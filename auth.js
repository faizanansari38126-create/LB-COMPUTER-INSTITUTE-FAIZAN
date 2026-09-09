/* =========================================================
   AUTH.JS
   Admin authentication with JWT.

   Admin accounts are stored in backend/data/admins.json so the admin
   portal can work on a local Windows setup even when MongoDB is not
   installed/running. Passwords are stored as bcrypt hashes, never plaintext.

   There is NO public admin signup route. The first administrator is created
   automatically from ADMIN_INITIAL_USERNAME / ADMIN_INITIAL_PASSWORD in .env.
   Additional administrators can ONLY be created by an authenticated admin.
   ========================================================= */

const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const DATA_DIR = path.join(__dirname, "data");
const ADMINS_FILE = path.join(DATA_DIR, "admins.json");

function ensureStore() {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(ADMINS_FILE)) {
        fs.writeFileSync(ADMINS_FILE, "[]", "utf8");
    }
}

function readAdmins() {
    ensureStore();
    try {
        const raw = fs.readFileSync(ADMINS_FILE, "utf8");
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Could not read admin store:", error.message);
        return [];
    }
}

function writeAdmins(admins) {
    ensureStore();
    const tempFile = ADMINS_FILE + ".tmp";
    fs.writeFileSync(tempFile, JSON.stringify(admins, null, 2), "utf8");
    fs.renameSync(tempFile, ADMINS_FILE);
}

function normalizeUsername(value) {
    return String(value || "").trim();
}

function publicAdmin(admin) {
    return {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email || "",
        mobile: admin.mobile || ""
    };
}

function signToken(admin) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured.");
    }
    return jwt.sign(
        { id: admin.id, username: admin.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
}

async function login(req, res) {
    try {
        const username = normalizeUsername(req.body.username);
        const password = String(req.body.password || "");

        if (!username || !password) {
            return res.status(400).json({ message: "Admin ID and password are required." });
        }

        const admin = readAdmins().find((item) => item.username === username);
        if (!admin) {
            return res.status(401).json({ message: "Invalid Admin ID or password." });
        }

        const matches = await bcrypt.compare(password, admin.passwordHash);
        if (!matches) {
            return res.status(401).json({ message: "Invalid Admin ID or password." });
        }

        const token = signToken(admin);
        return res.json({ token, admin: publicAdmin(admin) });
    } catch (error) {
        console.error("Admin login failed:", error);
        return res.status(500).json({ message: "Login failed." });
    }
}

function requireAdmin(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ message: "No admin session found." });
    }

    try {
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: "JWT_SECRET is not configured." });
        }
        req.admin = jwt.verify(token, process.env.JWT_SECRET);
        return next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired admin session." });
    }
}

async function ensureInitialAdmin() {
    const username = normalizeUsername(process.env.ADMIN_INITIAL_USERNAME);
    const password = String(process.env.ADMIN_INITIAL_PASSWORD || "");

    if (!username || !password) {
        console.warn("Initial admin bootstrap skipped: ADMIN_INITIAL_USERNAME / ADMIN_INITIAL_PASSWORD are not configured.");
        return;
    }

    const admins = readAdmins();
    if (admins.some((admin) => admin.username === username)) {
        return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    admins.push({
        id: `admin_${Date.now()}`,
        username,
        passwordHash,
        name: String(process.env.ADMIN_INITIAL_NAME || "Administrator").trim() || "Administrator",
        email: String(process.env.ADMIN_INITIAL_EMAIL || "").trim(),
        mobile: String(process.env.ADMIN_INITIAL_MOBILE || "").trim(),
        createdAt: new Date().toISOString()
    });

    writeAdmins(admins);
    console.log(`Initial administrator ready for username: ${username}`);
}

async function createAdmin(req, res) {
    try {
        const normalizedUsername = normalizeUsername(req.body.username);
        const password = String(req.body.password || "");
        const name = String(req.body.name || "Administrator").trim() || "Administrator";
        const email = String(req.body.email || "").trim();
        const mobile = String(req.body.mobile || "").trim();

        if (!normalizedUsername || !password) {
            return res.status(400).json({ message: "Username and password are required." });
        }
        if (normalizedUsername.length < 4) {
            return res.status(400).json({ message: "Admin username must be at least 4 characters." });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters." });
        }

        const admins = readAdmins();
        if (admins.some((admin) => admin.username === normalizedUsername)) {
            return res.status(409).json({ message: "That Admin ID / Username already exists." });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const admin = {
            id: `admin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            username: normalizedUsername,
            passwordHash,
            name,
            email,
            mobile,
            createdAt: new Date().toISOString()
        };

        admins.push(admin);
        writeAdmins(admins);

        return res.status(201).json({
            message: "New administrator added successfully.",
            admin: publicAdmin(admin)
        });
    } catch (error) {
        console.error("Create admin failed:", error);
        return res.status(500).json({ message: "Could not add administrator." });
    }
}

module.exports = { login, requireAdmin, ensureInitialAdmin, createAdmin };

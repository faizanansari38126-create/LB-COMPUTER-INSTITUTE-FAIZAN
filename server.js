/* =========================================================
   SERVER.JS
   Main entry point for the LB Computer Institute backend API.

   Run:
     1. cd backend
     2. npm install
     3. cp .env.example .env   (then fill in real values)
     4. npm run dev            (or: npm start)
   ========================================================= */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDatabase = require("./database");
const { login, requireAdmin, ensureInitialAdmin, createAdmin } = require("./auth");
const studentRoutes = require("./student-routes");
const certificateRoutes = require("./certificate-routes");
const enquiryRoutes = require("./enquiry-routes");

const app = express();


/* =========================================================
   MIDDLEWARE
   ========================================================= */

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Serve uploaded photos / certificates / id-cards as static files */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* Serve the complete website from the parent folder. This lets the
   frontend and API run from the same localhost server, avoiding
   file:// / CORS / "Failed to fetch" problems. */
app.use(express.static(path.join(__dirname, "..")));


/* =========================================================
   ROUTES
   ========================================================= */

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "LB Computer Institute API is running." });
});

app.post("/api/auth/login", login);
app.post("/api/auth/admins", requireAdmin, createAdmin);

app.use("/api/students", studentRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/enquiries", enquiryRoutes);


/* =========================================================
   404 HANDLER
   ========================================================= */

app.use((req, res) => {
    res.status(404).json({ message: "Route not found." });
});


/* =========================================================
   ERROR HANDLER
   ========================================================= */

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ message: "Something went wrong.", error: error.message });
});


/* =========================================================
   START SERVER
   ========================================================= */

const PORT = process.env.PORT || 5000;

(async () => {
    try {
        await connectDatabase();
    } catch (error) {
        console.warn("MongoDB unavailable. Student/certificate/enquiry database features will require MongoDB:", error.message);
    }

    try {
        await ensureInitialAdmin();
    } catch (error) {
        console.error("Admin store initialization failed:", error.message);
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`LB Computer Institute server running on http://127.0.0.1:${PORT}`);
        console.log("Admin authentication is available even when MongoDB is offline.");
    });
})();

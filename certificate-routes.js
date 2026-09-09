/* =========================================================
   CERTIFICATE-ROUTES.JS
   CRUD for certificates + public verification lookup.
   ========================================================= */

const express = require("express");
const router = express.Router();
const { Certificate, Student } = require("./database");
const { requireAdmin } = require("./auth");


/* ---------------------------------------------------------
   ISSUE CERTIFICATE
   POST /api/certificates   (admin only)
   body: { certificateNumber, studentId (Student._id), course,
           duration, grade, issueDate, status }
--------------------------------------------------------- */

router.post("/", requireAdmin, async (req, res) => {

    try {

        const student = await Student.findById(req.body.studentId);

        if (!student) {
            return res.status(404).json({ message: "Linked student not found." });
        }

        const certificate = await Certificate.create({
            certificateNumber: req.body.certificateNumber,
            student: student._id,
            studentName: student.name,
            fatherName: student.fatherName,
            course: req.body.course,
            duration: req.body.duration,
            grade: req.body.grade,
            issueDate: req.body.issueDate,
            status: req.body.status || "Issued"
        });

        res.status(201).json(certificate);

    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).json({ message: "Certificate number already exists." });
        }

        res.status(500).json({ message: "Failed to issue certificate.", error: error.message });

    }

});


/* ---------------------------------------------------------
   LIST / SEARCH CERTIFICATES
   GET /api/certificates?search=&status=   (admin only)
--------------------------------------------------------- */

router.get("/", requireAdmin, async (req, res) => {

    try {

        const { search, status } = req.query;
        const filter = {};

        if (status) {
            filter.status = status;
        }

        if (search) {
            filter.$or = [
                { studentName: new RegExp(search, "i") },
                { certificateNumber: new RegExp(search, "i") },
                { course: new RegExp(search, "i") }
            ];
        }

        const certificates = await Certificate.find(filter).sort({ createdAt: -1 });
        res.json(certificates);

    } catch (error) {

        res.status(500).json({ message: "Failed to fetch certificates.", error: error.message });

    }

});


/* ---------------------------------------------------------
   UPDATE CERTIFICATE (e.g. change status to Hold / Revoked)
   PUT /api/certificates/:certificateNumber   (admin only)
--------------------------------------------------------- */

router.put("/:certificateNumber", requireAdmin, async (req, res) => {

    try {

        const certificate = await Certificate.findOneAndUpdate(
            { certificateNumber: req.params.certificateNumber },
            req.body,
            { new: true, runValidators: true }
        );

        if (!certificate) {
            return res.status(404).json({ message: "Certificate not found." });
        }

        res.json(certificate);

    } catch (error) {

        res.status(500).json({ message: "Failed to update certificate.", error: error.message });

    }

});


/* ---------------------------------------------------------
   DELETE CERTIFICATE
   DELETE /api/certificates/:certificateNumber   (admin only)
--------------------------------------------------------- */

router.delete("/:certificateNumber", requireAdmin, async (req, res) => {

    try {

        const certificate = await Certificate.findOneAndDelete({
            certificateNumber: req.params.certificateNumber
        });

        if (!certificate) {
            return res.status(404).json({ message: "Certificate not found." });
        }

        res.json({ message: "Certificate deleted." });

    } catch (error) {

        res.status(500).json({ message: "Failed to delete certificate.", error: error.message });

    }

});


/* ---------------------------------------------------------
   PUBLIC - VERIFY CERTIFICATE
   GET /api/certificates/verify/:certificateNumber
   Used by certificate-verification.html - no auth required.
--------------------------------------------------------- */

router.get("/verify/:certificateNumber", async (req, res) => {

    try {

        const certificate = await Certificate.findOne({
            certificateNumber: req.params.certificateNumber
        });

        if (!certificate || certificate.status === "Revoked") {
            return res.status(404).json({ found: false });
        }

        res.json({
            found: true,
            studentName: certificate.studentName,
            certificateNumber: certificate.certificateNumber,
            course: certificate.course,
            duration: certificate.duration,
            grade: certificate.grade,
            issueDate: certificate.issueDate,
            status: certificate.status
        });

    } catch (error) {

        res.status(500).json({ message: "Verification failed.", error: error.message });

    }

});

module.exports = router;

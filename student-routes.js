/* =========================================================
   STUDENT-ROUTES.JS
   CRUD for student records + ID card lookups.
   All write routes are protected by requireAdmin.
   ========================================================= */

const express = require("express");
const router = express.Router();
const { Student } = require("./database");
const { requireAdmin } = require("./auth");


/* ---------------------------------------------------------
   CREATE STUDENT
   POST /api/students   (admin only)
--------------------------------------------------------- */

router.post("/", requireAdmin, async (req, res) => {

    try {

        const student = await Student.create(req.body);
        res.status(201).json(student);

    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Student ID or ID Card number already exists."
            });
        }

        res.status(500).json({ message: "Failed to create student.", error: error.message });

    }

});


/* ---------------------------------------------------------
   LIST / SEARCH STUDENTS
   GET /api/students?search=&course=&status=   (admin only)
--------------------------------------------------------- */

router.get("/", requireAdmin, async (req, res) => {

    try {

        const { search, course, status } = req.query;
        const filter = {};

        if (course) {
            filter.course = course;
        }

        if (status) {
            filter.status = status;
        }

        if (search) {
            filter.$or = [
                { name: new RegExp(search, "i") },
                { studentId: new RegExp(search, "i") },
                { mobile: new RegExp(search, "i") }
            ];
        }

        const students = await Student.find(filter).sort({ createdAt: -1 });
        res.json(students);

    } catch (error) {

        res.status(500).json({ message: "Failed to fetch students.", error: error.message });

    }

});


/* ---------------------------------------------------------
   GET ONE STUDENT
   GET /api/students/:studentId   (admin only)
--------------------------------------------------------- */

router.get("/:studentId", requireAdmin, async (req, res) => {

    try {

        const student = await Student.findOne({ studentId: req.params.studentId });

        if (!student) {
            return res.status(404).json({ message: "Student not found." });
        }

        res.json(student);

    } catch (error) {

        res.status(500).json({ message: "Failed to fetch student.", error: error.message });

    }

});


/* ---------------------------------------------------------
   UPDATE STUDENT
   PUT /api/students/:studentId   (admin only)
--------------------------------------------------------- */

router.put("/:studentId", requireAdmin, async (req, res) => {

    try {

        const student = await Student.findOneAndUpdate(
            { studentId: req.params.studentId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({ message: "Student not found." });
        }

        res.json(student);

    } catch (error) {

        res.status(500).json({ message: "Failed to update student.", error: error.message });

    }

});


/* ---------------------------------------------------------
   DELETE STUDENT
   DELETE /api/students/:studentId   (admin only)
--------------------------------------------------------- */

router.delete("/:studentId", requireAdmin, async (req, res) => {

    try {

        const student = await Student.findOneAndDelete({ studentId: req.params.studentId });

        if (!student) {
            return res.status(404).json({ message: "Student not found." });
        }

        res.json({ message: "Student deleted." });

    } catch (error) {

        res.status(500).json({ message: "Failed to delete student.", error: error.message });

    }

});


/* ---------------------------------------------------------
   PUBLIC - VERIFY ID CARD
   GET /api/students/verify/id-card/:idCardNumber
   Used by id-card-verification.html - no auth required,
   and only safe, non-sensitive fields are returned.
--------------------------------------------------------- */

router.get("/verify/id-card/:idCardNumber", async (req, res) => {

    try {

        const student = await Student.findOne({
            idCardNumber: req.params.idCardNumber
        });

        if (!student) {
            return res.status(404).json({ found: false });
        }

        res.json({
            found: true,
            name: student.name,
            studentId: student.studentId,
            idCardNumber: student.idCardNumber,
            course: student.course,
            status: student.status,
            joiningDate: student.joiningDate
        });

    } catch (error) {

        res.status(500).json({ message: "Verification failed.", error: error.message });

    }

});

module.exports = router;

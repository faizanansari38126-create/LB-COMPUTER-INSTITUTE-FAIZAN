/* =========================================================
   ENQUIRY-ROUTES.JS
   Public submission from enquiry.html + admin management.
   ========================================================= */

const express = require("express");
const router = express.Router();
const { Enquiry } = require("./database");
const { requireAdmin } = require("./auth");


/* ---------------------------------------------------------
   PUBLIC - SUBMIT ENQUIRY
   POST /api/enquiries
   Used by the public enquiry.html form - no auth required.
--------------------------------------------------------- */

router.post("/", async (req, res) => {

    try {

        const { name, phone, course } = req.body;

        if (!name || !phone || !course) {
            return res.status(400).json({
                message: "Name, mobile number and course are required."
            });
        }

        const enquiry = await Enquiry.create(req.body);

        res.status(201).json({
            message: "Enquiry submitted successfully.",
            id: enquiry._id
        });

    } catch (error) {

        res.status(500).json({ message: "Failed to submit enquiry.", error: error.message });

    }

});


/* ---------------------------------------------------------
   LIST / SEARCH ENQUIRIES
   GET /api/enquiries?search=&status=   (admin only)
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
                { name: new RegExp(search, "i") },
                { phone: new RegExp(search, "i") },
                { course: new RegExp(search, "i") }
            ];
        }

        const enquiries = await Enquiry.find(filter).sort({ createdAt: -1 });
        res.json(enquiries);

    } catch (error) {

        res.status(500).json({ message: "Failed to fetch enquiries.", error: error.message });

    }

});


/* ---------------------------------------------------------
   UPDATE ENQUIRY STATUS
   PUT /api/enquiries/:id   (admin only)
--------------------------------------------------------- */

router.put("/:id", requireAdmin, async (req, res) => {

    try {

        const enquiry = await Enquiry.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!enquiry) {
            return res.status(404).json({ message: "Enquiry not found." });
        }

        res.json(enquiry);

    } catch (error) {

        res.status(500).json({ message: "Failed to update enquiry.", error: error.message });

    }

});


/* ---------------------------------------------------------
   DELETE ENQUIRY
   DELETE /api/enquiries/:id   (admin only)
--------------------------------------------------------- */

router.delete("/:id", requireAdmin, async (req, res) => {

    try {

        const enquiry = await Enquiry.findByIdAndDelete(req.params.id);

        if (!enquiry) {
            return res.status(404).json({ message: "Enquiry not found." });
        }

        res.json({ message: "Enquiry deleted." });

    } catch (error) {

        res.status(500).json({ message: "Failed to delete enquiry.", error: error.message });

    }

});

module.exports = router;

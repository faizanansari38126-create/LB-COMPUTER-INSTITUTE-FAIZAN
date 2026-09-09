/* =========================================================
   DATABASE.JS
   Optional MongoDB connection for student/certificate/enquiry features.
   Admin authentication does not depend on MongoDB.
   ========================================================= */

const mongoose = require("mongoose");

async function connectDatabase() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error("MONGO_URI is not set.");
    }

    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log("MongoDB connected:", mongoose.connection.name);
        return true;
    } catch (error) {
        throw new Error(`MongoDB connection failed: ${error.message}`);
    }
}

module.exports = connectDatabase;

const { Schema, model } = mongoose;

const adminSchema = new Schema({
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "Administrator" },
    email: { type: String, trim: true },
    mobile: { type: String, trim: true }
}, { timestamps: true });

module.exports.Admin = model("Admin", adminSchema);

const studentSchema = new Schema({
    studentId: { type: String, required: true, unique: true },
    idCardNumber: { type: String, unique: true, sparse: true },
    certificateNumber: { type: String },
    name: { type: String, required: true },
    fatherName: { type: String },
    motherName: { type: String },
    dob: { type: Date },
    gender: { type: String },
    studentClass: { type: String },
    mobile: { type: String, required: true },
    email: { type: String },
    course: { type: String },
    admissionDate: { type: Date },
    status: { type: String, default: "Active" },
    address: { type: String },
    photo: { type: String },
    notes: { type: String }
}, { timestamps: true });

module.exports.Student = model("Student", studentSchema);

const certificateSchema = new Schema({
    certificateNumber: { type: String, required: true, unique: true },
    studentId: { type: String },
    studentName: { type: String },
    course: { type: String },
    issueDate: { type: Date },
    status: { type: String, default: "Valid" },
    filePath: { type: String }
}, { timestamps: true });
module.exports.Certificate = model("Certificate", certificateSchema);

const enquirySchema = new Schema({
    name: { type: String, required: true },
    mobile: { type: String },
    email: { type: String },
    course: { type: String },
    message: { type: String },
    status: { type: String, default: "New" }
}, { timestamps: true });
module.exports.Enquiry = model("Enquiry", enquirySchema);

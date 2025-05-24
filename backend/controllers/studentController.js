const Student = require('../models/Student');
const mongoose = require('mongoose');

// Get all students
exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.json({
            success: true,
            data: students
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get single student
exports.getStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        res.json({
            success: true,
            data: student
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create student
exports.createStudent = async (req, res) => {
    // Explicitly map incoming data (PascalCase from frontend) to PascalCase for Mongoose saving
    const studentData = {
        _id: req.body._id,
        HoTen: req.body.HoTen, // Use PascalCase from frontend
        LopSinhHoat: req.body.LopSinhHoat, // Use PascalCase from frontend
        Email: req.body.Email, // Use PascalCase from frontend
        SoDienThoai: req.body.SoDienThoai, // Use PascalCase from frontend
        NgayThamGia: req.body.NgayThamGia || Date.now() // Use default if not provided
        // Add other fields if necessary, using PascalCase from frontend
    };

    const student = new Student(studentData);
    try {
        const newStudent = await student.save();
        res.status(201).json({
            success: true,
            data: newStudent
        });
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(400).json({
            success: false,
            message: error.message,
            details: error.errors
        });
    }
};

// Update student
exports.updateStudent = async (req, res) => {
    // Explicitly map incoming data to PascalCase for Mongoose
    const studentData = {
        HoTen: req.body.HoTen,
        LopSinhHoat: req.body.LopSinhHoat,
        Email: req.body.Email,
        SoDienThoai: req.body.SoDienThoai,
        // Add other fields if necessary, do not update _id here
    };
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            studentData, // Use mapped data
            { new: true, runValidators: true }
        );
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        res.json({
            success: true,
            data: student
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete student
exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        res.json({
            success: true,
            message: 'Student deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get students by class ID
exports.getStudentsByClass = async (req, res) => {
    // Temporary response for the class route until StudentClassEnrollment is implemented
    res.status(501).json({ success: false, message: 'Get students by class functionality not implemented yet.' });
}; 
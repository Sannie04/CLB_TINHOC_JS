const Student = require('../models/Student');
const StudentClassEnrollment = require('../models/StudentClassEnrollment');
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
    const student = new Student(req.body);
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
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
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
    try {
        console.log(`Received request for students by class. Class ID: ${req.params.classId}`); // Debug log
        if (!mongoose.Types.ObjectId.isValid(req.params.classId)) {
            console.log(`Invalid class ID format: ${req.params.classId}`); // Debug log
            return res.status(400).json({
                success: false,
                message: 'Invalid class ID format'
            });
        }

        const enrollments = await StudentClassEnrollment.find({ MaLopHoc: req.params.classId });
        console.log(`Found ${enrollments.length} enrollments for class ID ${req.params.classId}`); // Debug log
        console.log('Enrollments data:', enrollments); // Debug log

        // Get student IDs from enrollments
        const studentIds = enrollments.map(enrollment => enrollment.MaSinhVien);
        console.log('Extracted student IDs:', studentIds); // Debug log

        // Find students by their IDs
        const students = await Student.find({ _id: { $in: studentIds } });
        console.log(`Found ${students.length} students for IDs: ${studentIds}`); // Debug log

        if (students.length === 0) {
            console.log('No students found for the given class ID.'); // Debug log
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        console.error('Error fetching students by class:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 
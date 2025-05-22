const express = require('express');
const router = express.Router();
const {
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentsByClass
} = require('../controllers/studentController');

// @desc    Get all students
// @route   GET /api/students
// @access  Public
router.route('/')
    .get(getStudents)
    .post(createStudent);

// @desc    Get students by class ID
// @route   GET /api/students/class/:classId
// @access  Public
router.route('/class/:classId').get(getStudentsByClass);

router.route('/:id')
    .get(getStudent)
    .put(updateStudent)
    .delete(deleteStudent);

module.exports = router; 
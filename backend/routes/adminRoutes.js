const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/adminController');

router.use(protect);
router.use(adminOnly);

// Stats
router.get('/stats', ctrl.getStats);

// Students
router.get('/students', ctrl.getStudents);
router.post('/students', ctrl.createStudent);
router.put('/students/:id', ctrl.updateStudent);
router.delete('/students/:id', ctrl.deleteStudent);

// Teachers
router.get('/teachers', ctrl.getTeachers);
router.post('/teachers', ctrl.createTeacher);
// Legacy
router.post('/register-teacher', ctrl.createTeacher);
router.put('/teachers/:id', ctrl.updateTeacher);
router.delete('/teachers/:id', ctrl.deleteTeacher);

// Courses
router.get('/courses', ctrl.getCourses);
router.post('/courses', ctrl.createCourse);
router.put('/courses/:id', ctrl.updateCourse);
router.delete('/courses/:id', ctrl.deleteCourse);

// User role management
router.get('/users', ctrl.getAllUsers);
router.put('/users/:id/role', ctrl.updateUserRole);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect, studentOnly } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/studentController');

router.use(protect);
router.use(studentOnly);

// Materials
router.get('/slides', ctrl.getSlides);

// Quizzes
router.get('/quizzes', ctrl.getQuizzes);
router.post('/quiz/:id/submit', ctrl.submitQuiz);

// Courses
router.get('/courses', ctrl.getMyCourses);

// Grades
router.get('/grades', ctrl.getMyGrades);

// Attendance
router.get('/attendance', ctrl.getMyAttendance);

// Assignments
router.get('/assignments', ctrl.getMyAssignments);
router.post('/assignments/:id/submit', ctrl.submitAssignment);

// Notices
router.get('/notices', ctrl.getNotices);
router.put('/notices/:id/read', ctrl.markNoticeRead);

module.exports = router;

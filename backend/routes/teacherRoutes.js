const express = require('express');
const router = express.Router();
const { protect, teacherOnly } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/teacherController');
const multer = require('multer');
const path = require('path');
const Slide = require('../models/Slide');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `slide_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

router.use(protect);
router.use(teacherOnly);

// Students
router.get('/students', ctrl.getMyStudents);
router.post('/register-student', ctrl.registerStudent);

// Courses
router.get('/courses', ctrl.getMyCourses);

// Slides (legacy)
router.get('/slides', ctrl.getSlides);
router.post('/upload-slide', upload.single('slide'), async (req, res) => {
    try {
        const slide = await Slide.create({
            title: req.body.title,
            fileUrl: `/uploads/${req.file.filename}`,
            mimetype: req.file.mimetype,
            uploadedBy: req.user._id,
        });
        res.status(201).json(slide);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Attendance
router.post('/attendance', ctrl.markAttendance);
router.get('/attendance', ctrl.getAttendance);

// Grades
router.post('/grades', ctrl.saveGrades);
router.get('/grades', ctrl.getGrades);

// Assignments
router.get('/assignments', ctrl.getAssignments);
router.post('/assignments', ctrl.createAssignment);
router.delete('/assignments/:id', ctrl.deleteAssignment);

// Announcements
router.get('/announcements', ctrl.getAnnouncements);
router.post('/announcements', ctrl.createAnnouncement);

module.exports = router;

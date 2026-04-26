const User = require('../models/User');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');
const Assignment = require('../models/Assignment');
const Notification = require('../models/Notification');
const Slide = require('../models/Slide');
const bcrypt = require('bcryptjs');

// ── My Courses ────────────────────────────────────────────────
exports.getMyCourses = async (req, res) => {
    try {
        const courses = await Course.find({ teacher: req.user._id })
            .populate('enrolledStudents', 'name email studentId');
        res.json(courses);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Students (in teacher's courses) ───────────────────────────
exports.getMyStudents = async (req, res) => {
    try {
        const config = { headers: { Authorization: `Bearer ${req.user.token}` } };
        const students = await User.find({ role: 'Student', createdBy: req.user._id }).select('-password');
        res.json(students);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.registerStudent = async (req, res) => {
    try {
        const { name, email, password, studentId, className, major, contactNumber } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already exists' });
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password || 'student123', salt);
        const student = await User.create({
            name, email, password: hashed, role: 'Student',
            studentId: studentId || `STU${Date.now()}`,
            className, major, contactNumber, createdBy: req.user._id
        });
        res.status(201).json({ ...student.toObject(), password: undefined });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Slides ─────────────────────────────────────────────────────
exports.getSlides = async (req, res) => {
    try {
        const Slide = require('../models/Slide');
        const slides = await Slide.find({ teacher: req.user._id }).sort({ createdAt: -1 });
        res.json(slides);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Attendance ─────────────────────────────────────────────────
exports.markAttendance = async (req, res) => {
    try {
        const { courseId, date, records } = req.body;
        // records = [{ studentId, status }]
        const ops = records.map(r => ({
            updateOne: {
                filter: { student: r.studentId, course: courseId, date: new Date(date) },
                update: { status: r.status, markedBy: req.user._id },
                upsert: true,
            }
        }));
        await Attendance.bulkWrite(ops);
        res.json({ message: 'Attendance saved' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAttendance = async (req, res) => {
    try {
        const { courseId, date } = req.query;
        const filter = {};
        if (courseId) filter.course = courseId;
        if (date) filter.date = new Date(date);
        const records = await Attendance.find(filter)
            .populate('student', 'name studentId')
            .populate('course', 'name code')
            .sort({ date: -1 });
        res.json(records);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Grades ─────────────────────────────────────────────────────
exports.saveGrades = async (req, res) => {
    try {
        const { courseId, grades } = req.body;
        const ops = grades.map(g => ({
            updateOne: {
                filter: { student: g.studentId, course: courseId },
                update: { score: g.score, semester: g.semester, remarks: g.remarks, gradedBy: req.user._id },
                upsert: true,
            }
        }));
        await Grade.bulkWrite(ops);
        // Trigger pre-save hook workaround - update grades individually
        for (const g of grades) {
            const grade = await Grade.findOne({ student: g.studentId, course: courseId });
            if (grade) { grade.score = g.score; await grade.save(); }
        }
        res.json({ message: 'Grades saved' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getGrades = async (req, res) => {
    try {
        const { courseId } = req.query;
        const filter = {};
        if (courseId) filter.course = courseId;
        const grades = await Grade.find(filter)
            .populate('student', 'name studentId')
            .populate('course', 'name code');
        res.json(grades);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Assignments ─────────────────────────────────────────────────
exports.getAssignments = async (req, res) => {
    try {
        const courses = await Course.find({ teacher: req.user._id }).select('_id');
        const courseIds = courses.map(c => c._id);
        const assignments = await Assignment.find({ course: { $in: courseIds } })
            .populate('course', 'name code')
            .sort({ deadline: 1 });
        res.json(assignments);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.create({ ...req.body, createdBy: req.user._id });
        res.status(201).json(assignment);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteAssignment = async (req, res) => {
    try {
        await Assignment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Assignment deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Announcements ───────────────────────────────────────────────
exports.createAnnouncement = async (req, res) => {
    try {
        const notif = await Notification.create({
            ...req.body,
            createdBy: req.user._id,
            type: 'announcement'
        });
        res.status(201).json(notif);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAnnouncements = async (req, res) => {
    try {
        const announcements = await Notification.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
        res.json(announcements);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

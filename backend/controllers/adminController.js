const User = require('../models/User');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');

// ── Students ────────────────────────────────────────────────
exports.getStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'Student' }).select('-password').sort({ createdAt: -1 });
        res.json(students);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createStudent = async (req, res) => {
    try {
        const { name, email, password, studentId, className, major, department, contactNumber, address } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already in use' });
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password || 'student123', salt);
        const student = await User.create({
            name, email, password: hashed, role: 'Student',
            studentId: studentId || `STU${Date.now()}`,
            className, major, department, contactNumber, address,
            createdBy: req.user._id
        });
        res.status(201).json({ ...student.toObject(), password: undefined });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateStudent = async (req, res) => {
    try {
        const { password, ...rest } = req.body;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            rest.password = await bcrypt.hash(password, salt);
        }
        const student = await User.findByIdAndUpdate(req.params.id, rest, { new: true }).select('-password');
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.json(student);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteStudent = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Student deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Teachers ─────────────────────────────────────────────────
exports.getTeachers = async (req, res) => {
    try {
        const teachers = await User.find({ role: 'Teacher' }).select('-password').sort({ createdAt: -1 });
        res.json(teachers);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createTeacher = async (req, res) => {
    try {
        const { name, email, password, department, contactNumber, address } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already in use' });
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password || 'teacher123', salt);
        const teacher = await User.create({
            name, email, password: hashed, role: 'Teacher',
            teacherId: `TCH${Date.now()}`,
            department, contactNumber, address,
            createdBy: req.user._id
        });
        res.status(201).json({ ...teacher.toObject(), password: undefined });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateTeacher = async (req, res) => {
    try {
        const { password, ...rest } = req.body;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            rest.password = await bcrypt.hash(password, salt);
        }
        const teacher = await User.findByIdAndUpdate(req.params.id, rest, { new: true }).select('-password');
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
        res.json(teacher);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteTeacher = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Teacher deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Courses ───────────────────────────────────────────────────
exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate('teacher', 'name email').sort({ createdAt: -1 });
        res.json(courses);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createCourse = async (req, res) => {
    try {
        const course = await Course.create(req.body);
        res.status(201).json(course);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('teacher', 'name email');
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteCourse = async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Stats / Reports ────────────────────────────────────────────
exports.getStats = async (req, res) => {
    try {
        const [students, teachers, courses, attendance] = await Promise.all([
            User.countDocuments({ role: 'Student' }),
            User.countDocuments({ role: 'Teacher' }),
            Course.countDocuments(),
            Attendance.find().lean(),
        ]);
        const present = attendance.filter(a => a.status === 'Present').length;
        const attendanceRate = attendance.length ? Math.round((present / attendance.length) * 100) : 0;
        res.json({ students, teachers, courses, attendanceRate, totalAttendance: attendance.length });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── All Users (role management) ────────────────────────────────
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ role: 1, createdAt: -1 });
        res.json(users);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
        res.json(user);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

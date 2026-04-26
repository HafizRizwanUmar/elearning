const User = require('../models/User');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');
const Assignment = require('../models/Assignment');
const Notification = require('../models/Notification');
const Slide = require('../models/Slide');

// ── Materials / Slides ─────────────────────────────────────────
exports.getSlides = async (req, res) => {
    try {
        const slides = await Slide.find().sort({ createdAt: -1 });
        res.json(slides);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Quizzes ─────────────────────────────────────────────────────
exports.getQuizzes = async (req, res) => {
    try {
        const Quiz = require('../models/Quiz');
        const quizzes = await Quiz.find().sort({ createdAt: -1 });
        res.json(quizzes);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.submitQuiz = async (req, res) => {
    try {
        const Quiz = require('../models/Quiz');
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        const { answers } = req.body;
        let score = 0;
        quiz.questions.forEach((q, idx) => {
            if (answers[idx] !== undefined && answers[idx] === q.correctAnswer) score++;
        });
        const total = quiz.questions.length;
        const percentage = Math.round((score / total) * 100);
        res.json({ score, total, percentage });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── My Courses ─────────────────────────────────────────────────
exports.getMyCourses = async (req, res) => {
    try {
        const courses = await Course.find({ enrolledStudents: req.user._id })
            .populate('teacher', 'name email department');
        res.json(courses);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Grades ─────────────────────────────────────────────────────
exports.getMyGrades = async (req, res) => {
    try {
        const grades = await Grade.find({ student: req.user._id })
            .populate('course', 'name code credits');
        res.json(grades);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Attendance ─────────────────────────────────────────────────
exports.getMyAttendance = async (req, res) => {
    try {
        const records = await Attendance.find({ student: req.user._id })
            .populate('course', 'name code')
            .sort({ date: -1 });
        res.json(records);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Assignments ─────────────────────────────────────────────────
exports.getMyAssignments = async (req, res) => {
    try {
        const enrolledCourses = await Course.find({ enrolledStudents: req.user._id }).select('_id');
        const courseIds = enrolledCourses.map(c => c._id);
        const assignments = await Assignment.find({ course: { $in: courseIds } })
            .populate('course', 'name code')
            .sort({ deadline: 1 });
        // Add submission status
        const assignmentsWithStatus = assignments.map(a => {
            const sub = a.submissions.find(s => s.student?.toString() === req.user._id.toString());
            return { ...a.toObject(), mySubmission: sub || null };
        });
        res.json(assignmentsWithStatus);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.submitAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
        const existing = assignment.submissions.find(s => s.student?.toString() === req.user._id.toString());
        const now = new Date();
        const isLate = now > new Date(assignment.deadline);
        if (existing) {
            existing.text = req.body.text || existing.text;
            existing.status = isLate ? 'Late' : 'Submitted';
            existing.submittedAt = now;
        } else {
            assignment.submissions.push({
                student: req.user._id,
                text: req.body.text || '',
                status: isLate ? 'Late' : 'Submitted',
                submittedAt: now,
            });
        }
        await assignment.save();
        res.json({ message: 'Submitted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Notices ─────────────────────────────────────────────────────
exports.getNotices = async (req, res) => {
    try {
        const notices = await Notification.find({
            $or: [
                { recipient: req.user._id },
                { recipientRole: 'Student' },
                { recipientRole: 'all' }
            ]
        }).sort({ createdAt: -1 });
        res.json(notices);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.markNoticeRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ message: 'Marked as read' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

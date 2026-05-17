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

// ── Taxonomy PDF Explainer ──────────────────────────────────────────
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const PDFDocument = require('pdfkit');

exports.uploadTaxonomyPdf = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No PDF file uploaded' });
        }

        const inputPath = req.file.path;
        const dataBuffer = fs.readFileSync(inputPath);
        
        // 1. Extract text from uploaded PDF
        const data = await pdfParse(dataBuffer);
        const extractedText = data.text;

        // 2. Mock AI Explanation (Ideally replace with Gemini/OpenAI API call)
        const explanation = `
TAXONOMY EXPLANATION REPORT
===========================
File Analyzed: ${req.file.originalname}
Number of Pages: ${data.numpages}

SUMMARY OF CONTENT:
We analyzed the uploaded document regarding taxonomy. The document discusses classification systems, hierarchical structures, and categorization.

KEY CONCEPTS IDENTIFIED:
- Hierarchical Classification: Organisms or concepts are arranged in a structured hierarchy.
- Nomenclature: The system of naming elements consistently.
- Categorization criteria: Based on shared characteristics.

HOW TO USE THIS IN YOUR STUDIES:
Understanding the taxonomy presented in this document helps in organizing complex information into manageable, logical groupings. 

(Note: This is an auto-generated mock explanation. Integrate an AI API for dynamic content.)
`;

        // 3. Generate New PDF with Explanation
        const outputFilename = `explanation_${Date.now()}_${req.file.originalname}`;
        const outputPath = path.join(__dirname, '..', 'uploads', outputFilename);
        
        const doc = new PDFDocument();
        const writeStream = fs.createWriteStream(outputPath);
        doc.pipe(writeStream);
        
        doc.fontSize(20).text('Taxonomy PDF Explanation', { underline: true });
        doc.moveDown();
        doc.fontSize(12).text(explanation);
        doc.end();

        writeStream.on('finish', () => {
            // Return the path to the newly generated PDF
            res.json({
                message: 'Explanation generated successfully',
                originalFile: req.file.filename,
                explanationFile: `/uploads/${outputFilename}`
            });
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};


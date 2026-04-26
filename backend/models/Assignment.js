const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fileUrl: { type: String, default: '' },
    text: { type: String, default: '' },
    submittedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['Submitted', 'Late', 'Graded'], default: 'Submitted' },
    score: { type: Number },
    feedback: { type: String, default: '' },
});

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    deadline: { type: Date, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    submissions: [submissionSchema],
    maxScore: { type: Number, default: 100 },
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);

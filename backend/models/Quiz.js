const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
    },
    options: {
        type: [String],
        required: true,
        validate: [arr => arr.length === 4, 'Each question must have exactly 4 options'],
    },
    correctAnswer: {
        type: Number,
        required: true,
        min: 0,
        max: 3,
    },
});

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    slideId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Slide',
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    questions: {
        type: [questionSchema],
        required: true,
        validate: [arr => arr.length > 0, 'Quiz must have at least one question'],
    },
}, {
    timestamps: true,
});

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;

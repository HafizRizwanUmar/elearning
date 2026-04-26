const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    score: { type: Number, min: 0, max: 100 },
    grade: { type: String }, // A, B, C, D, F
    semester: { type: String, default: '' },
    remarks: { type: String, default: '' },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Auto-compute letter grade before saving
gradeSchema.pre('save', function (next) {
    if (this.score !== undefined) {
        if (this.score >= 90) this.grade = 'A';
        else if (this.score >= 80) this.grade = 'B';
        else if (this.score >= 70) this.grade = 'C';
        else if (this.score >= 60) this.grade = 'D';
        else this.grade = 'F';
    }
    next();
});

module.exports = mongoose.model('Grade', gradeSchema);

const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    credits: { type: Number, default: 3 },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    schedule: { type: String, default: '' }, // e.g. "Mon/Wed 9:00-10:30"
    room: { type: String, default: '' },
    semester: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Teacher', 'Student'], default: 'Student' },
    studentId: { type: String },
    teacherId: { type: String },
    department: { type: String, default: '' },
    className: { type: String, default: '' },
    major: { type: String, default: '' },
    contactNumber: { type: String, default: '' },
    address: { type: String, default: '' },
    profileColor: { type: String, default: '#6C5CE7' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'success', 'warning', 'announcement'], default: 'info' },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null = broadcast to all
    recipientRole: { type: String, enum: ['Admin', 'Teacher', 'Student', 'all'], default: 'all' },
    isRead: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);

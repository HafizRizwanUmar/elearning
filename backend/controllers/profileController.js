const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateProfile = async (req, res) => {
    try {
        const { password, role, ...update } = req.body; // prevent role escalation
        const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password');
        res.json(user);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.json({ message: 'Password changed successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

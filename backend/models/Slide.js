const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    fileUrl: {
        type: String,
        required: true,
    },
    mimetype: {
        type: String,
        required: true,
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
});

const Slide = mongoose.model('Slide', slideSchema);
module.exports = Slide;

const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Crop name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('Crop', cropSchema);


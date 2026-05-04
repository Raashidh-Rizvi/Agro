const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema({
    cropName: {
        type: String,
        required: [true, 'Please provide the crop name'],
        trim: true
    },
    district: {
        type: String,
        required: [true, 'Please provide the district'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please provide the price']
    },
    unit: {
        type: String,
        required: [true, 'Please provide the unit (e.g., kg, bundle)'],
        default: 'kg'
    },
    trend: {
        type: String,
        enum: ['up', 'down', 'stable'],
        default: 'stable'
    },
    date: {
        type: Date,
        default: Date.now
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MarketPrice', marketPriceSchema);

const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema({
    cropName: {
        type: String,
        required: [true, 'Please add a crop name'],
        trim: true
    },
    district: {
        type: String,
        required: [true, 'Please add a district'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    unit: {
        type: String,
        default: '1kg',
        trim: true
    },
    market: {
        type: String,
        trim: true,
        default: 'General Market'
    },
    recordedAt: {
        type: Date,
        default: Date.now
    },
    recordedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MarketPrice', marketPriceSchema);

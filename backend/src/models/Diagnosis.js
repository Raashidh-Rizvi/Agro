const mongoose = require('mongoose');

const diagnosisSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    diseaseName: {
        type: String,
        required: true
    },
    confidenceScore: {
        type: Number,
        required: true
    },
    recommendation: {
        type: String,
        default: 'Consult with an agricultural expert for detailed management steps.'
    },
    isMock: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Diagnosis', diagnosisSchema);

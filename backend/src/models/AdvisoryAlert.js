const mongoose = require('mongoose');

const advisoryAlertSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide an alert title'],
            trim: true,
            maxlength: 120
        },
        cropType: {
            type: String,
            required: [true, 'Please provide a crop type'],
            trim: true,
            maxlength: 80
        },
        district: {
            type: String,
            required: [true, 'Please provide a district'],
            trim: true,
            maxlength: 80
        },
        season: {
            type: String,
            required: [true, 'Please provide a season'],
            trim: true,
            maxlength: 80
        },
        message: {
            type: String,
            required: [true, 'Please provide an alert message'],
            trim: true,
            maxlength: 1000
        },
        alertType: {
            type: String,
            required: [true, 'Please provide an alert type'],
            enum: ['weather', 'fertilizer', 'pest', 'irrigation', 'general']
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true
    }
);

advisoryAlertSchema.index({ createdAt: -1 });
advisoryAlertSchema.index({ alertType: 1, createdAt: -1 });
advisoryAlertSchema.index({ cropType: 1, district: 1, season: 1 });

module.exports = mongoose.model('AdvisoryAlert', advisoryAlertSchema);

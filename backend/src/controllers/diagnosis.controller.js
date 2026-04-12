const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const Diagnosis = require('../models/Diagnosis');

// @desc    Predict disease from image
// @route   POST /api/diagnosis/predict
// @access  Private
exports.predictDisease = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image'
            });
        }

        const imagePath = req.file.path;
        
        // 1. Prepare form data to send to ML service
        const form = new FormData();
        form.append('file', fs.createReadStream(imagePath), {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        // 2. Call ML service
        const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
        console.log(`--- [DEBUG] Calling ML Service: ${mlServiceUrl}/predict ---`);
        
        const response = await axios.post(`${mlServiceUrl}/predict`, form, {
            headers: {
                ...form.getHeaders()
            }
        });

        const { predicted_class, confidence, is_mock } = response.data;
        console.log(`--- [DEBUG] Prediction received: ${predicted_class} (Conf: ${confidence}, Mock: ${is_mock}) ---`);

        // 3. Save diagnosis to MongoDB
        if (!req.user || !req.user._id) {
            console.error('--- [ERROR] req.user is missing in predictDisease ---');
            throw new Error('User context missing');
        }

        const diagnosis = await Diagnosis.create({
            userId: req.user._id,
            imageUrl: `/uploads/diagnosis/${req.file.filename}`,
            diseaseName: predicted_class,
            confidenceScore: confidence,
            isMock: is_mock || false
            // recommendation filled by default schema
        });

        res.status(200).json({
            success: true,
            data: diagnosis
        });
    } catch (error) {
        console.error('Prediction Error:', error.message);
        
        // Cleanup local file if prediction fails
        if (req.file && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupErr) {
                console.error('File cleanup error:', cleanupErr.message);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Prediction failed',
            error: error.response ? error.response.data : error.message
        });
    }
};

// @desc    Get diagnosis history for logged in user
// @route   GET /api/diagnosis/history
// @access  Private
exports.getDiagnosisHistory = async (req, res) => {
    try {
        const diagnoses = await Diagnosis.find({ userId: req.user.id }).sort('-createdAt');
        res.status(200).json({
            success: true,
            count: diagnoses.length,
            data: diagnoses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Could not fetch history',
            error: error.message
        });
    }
};

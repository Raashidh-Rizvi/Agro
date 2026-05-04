const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Diagnosis = require('../models/Diagnosis');
const { getDiseaseDetails } = require('../constants/DiseaseInfo');

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

        // 3. Look up enriched disease details
        const details = getDiseaseDetails(predicted_class);

        // 4. Save diagnosis to MongoDB
        if (!req.user || !req.user._id) {
            console.error('--- [ERROR] req.user is missing in predictDisease ---');
            throw new Error('User context missing');
        }

        const diagnosis = await Diagnosis.create({
            userId: req.user._id,
            imageUrl: `/uploads/diagnosis/${req.file.filename}`,
            diseaseName: predicted_class,
            confidenceScore: confidence,
            isMock: is_mock || false,
            // Enriched fields
            cause: details ? details.cause : 'Unknown',
            symptoms: details ? details.symptoms : [],
            treatment: details ? details.treatment : [],
            prevention: details ? details.prevention : [],
            // Fallback recommendation if details found
            recommendation: details ? `Follow the suggested treatment: ${details.treatment.join(', ')}` : undefined
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

// @desc    Delete a diagnosis record
// @route   DELETE /api/diagnosis/:id
// @access  Private
exports.deleteDiagnosis = async (req, res) => {
    try {
        console.log(`--- [DEBUG] Delete Diagnosis Request for ID: ${req.params.id} ---`);
        console.log(`--- [DEBUG] User ID from Token: ${req.user.id} ---`);

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            console.error(`--- [ERROR] Invalid Diagnosis ID format: ${req.params.id} ---`);
            return res.status(400).json({
                success: false,
                message: 'Invalid record ID'
            });
        }

        const diagnosis = await Diagnosis.findById(req.params.id);

        if (!diagnosis) {
            console.error(`--- [ERROR] Diagnosis record not found in DB: ${req.params.id} ---`);
            return res.status(404).json({
                success: false,
                message: 'Diagnosis not found'
            });
        }

        console.log(`--- [DEBUG] Diagnosis found. Owner: ${diagnosis.userId} ---`);

        // Make sure user owns the diagnosis
        if (diagnosis.userId.toString() !== req.user.id) {
            console.error(`--- [ERROR] Unauthorized delete attempt. Owner: ${diagnosis.userId}, Attempt by: ${req.user.id} ---`);
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this record'
            });
        }

        // Delete the image file from storage if it exists
        if (diagnosis.imageUrl) {
            const filePath = path.join(__dirname, '../../public', diagnosis.imageUrl);
            console.log(`--- [DEBUG] Attempting to delete image file at: ${filePath} ---`);
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                    console.log(`--- [DEBUG] Image file deleted successfully ---`);
                } catch (err) {
                    console.error('--- [ERROR] Failed to delete image file:', err.message);
                }
            } else {
                console.warn(`--- [WARN] Image file not found at path: ${filePath} ---`);
            }
        }

        await diagnosis.deleteOne();
        console.log(`--- [DEBUG] Diagnosis record ${req.params.id} deleted from DB ---`);

        res.status(200).json({
            success: true,
            message: 'Diagnosis deleted successfully',
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

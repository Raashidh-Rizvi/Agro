const express = require('express');
const multer = require('multer');
const path = require('path');
const { predictDisease, getDiagnosisHistory } = require('../controllers/diagnosis.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Multer configuration for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `leaf-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetypes = /image\/jpeg|image\/jpg|image\/png|image\/webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = mimetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Images only (jpeg, jpg, png, webp)!'));
        }
    }
});

// Routes
// POST /api/diagnosis/predict - Upload image and get prediction
router.post('/predict', protect, upload.single('image'), predictDisease);

// GET /api/diagnosis/history - Get all diagnoses for current user
router.get('/history', protect, getDiagnosisHistory);

module.exports = router;

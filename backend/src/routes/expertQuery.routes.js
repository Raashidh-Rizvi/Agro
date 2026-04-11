const express = require('express');
const multer = require('multer');
const path = require('path');
const {
    createQuery,
    getQueries,
    getMyQueries,
    getQueryById,
    updateQuery,
    deleteQuery
} = require('../controllers/expertQuery.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/uploads/queries/'))
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Increased to 10MB
});

router.post("/", (req, res, next) => {
    upload.single('image')(req, res, function (err) {
        if (err) {
            console.error('Mutler Upload Error:', err);
            return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
        }
        console.log('--- POST /api/expert-query ---');
        console.log('Body fields:', Object.keys(req.body));
        if (req.body.image) {
            console.log('Image field detected in Body (unexpected). Type:', typeof req.body.image);
            console.log('Image field value (first 50 chars):', String(req.body.image).substring(0, 50));
        }
        console.log('File received:', req.file ? {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path
        } : 'None');
        next();
    });
}, protect, createQuery);

router.get("/my", protect, getMyQueries);
router.get("/", protect, getQueries);
router.get("/:id", protect, getQueryById);

router.put("/:id", (req, res, next) => {
    upload.single('image')(req, res, function (err) {
        if (err) {
            console.error('Mutler Update Error:', err);
            return res.status(400).json({ success: false, message: `Update upload error: ${err.message}` });
        }
        next();
    });
}, protect, updateQuery);
router.delete("/:id", protect, deleteQuery);

module.exports = router;


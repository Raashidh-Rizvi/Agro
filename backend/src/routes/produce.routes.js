const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
    createProduce,
    getAllProduce,
    getProduceById,
    updateProduce,
    deleteProduce,
    getMyProduce
} = require('../controllers/produce.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Multer configuration for produce images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../public/uploads/produce');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `prod-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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

// Public routes
router.get('/', getAllProduce);
router.get('/:id', getProduceById);

// Protected routes
router.use(protect);
router.get('/my/listings', getMyProduce);
router.post('/', authorize('Farmer', 'Admin'), upload.single('image'), createProduce);
router.put('/:id', authorize('Farmer', 'Admin'), upload.single('image'), updateProduce);
router.delete('/:id', authorize('Farmer', 'Admin'), deleteProduce);

module.exports = router;

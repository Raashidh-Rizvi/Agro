const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
    createCrop,
    getCrops,
    getCropById,
    updateCrop,
    deleteCrop
} = require('../controllers/crop.controller');

router.use(protect);

router.route('/')
    .post(authorize('Admin'), createCrop)
    .get(getCrops);

router.route('/:id')
    .get(getCropById)
    .put(authorize('Admin'), updateCrop)
    .delete(authorize('Admin'), deleteCrop);

module.exports = router;

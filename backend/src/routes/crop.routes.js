const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    createCrop,
    getCrops,
    getCropById,
    updateCrop,
    deleteCrop
} = require('../controllers/crop.controller');

router.use(protect);

router.route('/')
    .post(createCrop)
    .get(getCrops);

router.route('/:id')
    .get(getCropById)
    .put(updateCrop)
    .delete(deleteCrop);

module.exports = router;

const express = require('express');
const {
    getAllMarketPrices,
    getMarketPriceById,
    createMarketPrice,
    updateMarketPrice,
    deleteMarketPrice
} = require('../controllers/marketPrice.controller');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth.middleware');

// All routes are protected
router.use(protect);

router
    .route('/')
    .get(getAllMarketPrices)
    .post(authorize('Admin'), createMarketPrice);

router
    .route('/:id')
    .get(getMarketPriceById)
    .put(authorize('Admin'), updateMarketPrice)
    .delete(authorize('Admin'), deleteMarketPrice);

module.exports = router;

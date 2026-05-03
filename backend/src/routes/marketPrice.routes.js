const express = require('express');
const {
    getMarketPrices,
    getMarketPriceById,
    createMarketPrice,
    updateMarketPrice,
    deleteMarketPrice
} = require('../controllers/marketPrice.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getMarketPrices)
    .post(authorize('Admin'), createMarketPrice);

router.route('/:id')
    .get(getMarketPriceById)
    .put(authorize('Admin'), updateMarketPrice)
    .delete(authorize('Admin'), deleteMarketPrice);

module.exports = router;

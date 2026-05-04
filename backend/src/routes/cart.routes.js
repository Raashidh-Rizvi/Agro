const express = require('express');
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes are private
router.use(protect);

router.route('/')
    .get(getCart);

router.post('/add', addToCart);
router.put('/update', updateCartItem);
router.delete('/clear', clearCart);
router.delete('/remove/:productId', removeFromCart);

module.exports = router;

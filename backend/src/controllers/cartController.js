const Cart = require('../models/Cart');
const ProduceListing = require('../models/ProduceListing');

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.id }).populate({
            path: 'items.productId',
            select: 'name price imageUrl description sellerName'
        });

        if (!cart) {
            // If no cart exists, return an empty one (not saved yet)
            return res.status(200).json({
                success: true,
                data: {
                    userId: req.user.id,
                    items: []
                }
            });
        }

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = async (req, res, next) => {
    try {
        const { productId, quantity = 1 } = req.body;

        // Check if product exists
        const product = await ProduceListing.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        let cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) {
            // Create new cart if it doesn't exist
            cart = await Cart.create({
                userId: req.user.id,
                items: [{ productId, quantity }]
            });
        } else {
            // Check if product already in cart
            const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

            if (itemIndex > -1) {
                // If exists, increment quantity
                cart.items[itemIndex].quantity += quantity;
            } else {
                // If new, push to array
                cart.items.push({ productId, quantity });
            }
            await cart.save();
        }

        // Populate and return
        await cart.populate({
            path: 'items.productId',
            select: 'name price imageUrl description sellerName'
        });

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
exports.updateCartItem = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            });
        }

        const cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Product not in cart'
            });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        await cart.populate({
            path: 'items.productId',
            select: 'name price imageUrl description sellerName'
        });

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const itemToRemove = cart.items.find(item => item.productId.toString() === productId);
        
        if (itemToRemove) {
            cart.items.pull(itemToRemove._id);
        }

        await cart.save();

        await cart.populate({
            path: 'items.productId',
            select: 'name price imageUrl description sellerName'
        });

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
exports.clearCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Cart cleared',
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

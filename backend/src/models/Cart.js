const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        unique: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'ProduceListing',
                required: [true, 'Product ID is required']
            },
            quantity: {
                type: Number,
                required: [true, 'Quantity is required'],
                min: [1, 'Quantity cannot be less than 1'],
                default: 1
            }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);

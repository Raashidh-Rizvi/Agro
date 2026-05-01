const mongoose = require('mongoose');

const PRODUCE_CATEGORIES = ['Seeds', 'Fertilizers', 'Tools', 'Pesticides', 'Other'];

const produceListingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: PRODUCE_CATEGORIES,
            message: 'Invalid category'
        }
    },
    imageUrl: {
        type: String,
        default: ''
    },
    sellerName: {
        type: String,
        required: [true, 'Seller name is required']
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    badge: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('ProduceListing', produceListingSchema);
module.exports.PRODUCE_CATEGORIES = PRODUCE_CATEGORIES;

const ProduceListing = require('../models/ProduceListing');
const fs = require('fs');
const path = require('path');

// @desc    Create a new produce listing
// @route   POST /api/produce
// @access  Private
exports.createProduce = async (req, res) => {
    try {
        const { name, description, price, category } = req.body;
        
        if (!name || !description || !price || !category) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        let imageUrl = '';
        if (req.file) {
            imageUrl = `/uploads/produce/${req.file.filename}`;
        }

        const produce = await ProduceListing.create({
            userId: req.user.id,
            name,
            description,
            price,
            category,
            imageUrl,
            sellerName: req.user.name || 'Anonymous', // Assuming user object has name
            rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3 and 5 for demo
        });

        res.status(201).json({
            success: true,
            data: produce
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get all produce listings
// @route   GET /api/produce
// @access  Public
exports.getAllProduce = async (req, res) => {
    try {
        const { category, search } = req.query;
        
        let query = {};
        
        if (category && category !== 'All') {
            query.category = category;
        }
        
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const produce = await ProduceListing.find(query).sort('-createdAt');

        res.status(200).json({
            success: true,
            count: produce.length,
            data: produce
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get produce listing by ID
// @route   GET /api/produce/:id
// @access  Public
exports.getProduceById = async (req, res) => {
    try {
        const produce = await ProduceListing.findById(req.params.id);

        if (!produce) {
            return res.status(404).json({
                success: false,
                message: 'Produce listing not found'
            });
        }

        res.status(200).json({
            success: true,
            data: produce
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update a produce listing
// @route   PUT /api/produce/:id
// @access  Private
exports.updateProduce = async (req, res) => {
    try {
        let produce = await ProduceListing.findById(req.params.id);

        if (!produce) {
            return res.status(404).json({
                success: false,
                message: 'Produce listing not found'
            });
        }

        // Check if user owns the listing
        if (produce.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this listing'
            });
        }

        const { name, description, price, category } = req.body;
        
        let updateData = {
            name: name || produce.name,
            description: description || produce.description,
            price: price || produce.price,
            category: category || produce.category
        };

        if (req.file) {
            // Delete old image if exists
            if (produce.imageUrl) {
                const oldImagePath = path.join(__dirname, '../../public', produce.imageUrl);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            updateData.imageUrl = `/uploads/produce/${req.file.filename}`;
        }

        produce = await ProduceListing.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: produce
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Delete a produce listing
// @route   DELETE /api/produce/:id
// @access  Private
exports.deleteProduce = async (req, res) => {
    try {
        const produce = await ProduceListing.findById(req.params.id);

        if (!produce) {
            return res.status(404).json({
                success: false,
                message: 'Produce listing not found'
            });
        }

        // Check if user owns the listing
        if (produce.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this listing'
            });
        }

        // Delete image if exists
        if (produce.imageUrl) {
            const imagePath = path.join(__dirname, '../../public', produce.imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await produce.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Produce listing removed'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get user's produce listings
// @route   GET /api/produce/my
// @access  Private
exports.getMyProduce = async (req, res) => {
    try {
        const produce = await ProduceListing.find({ userId: req.user.id }).sort('-createdAt');

        res.status(200).json({
            success: true,
            count: produce.length,
            data: produce
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

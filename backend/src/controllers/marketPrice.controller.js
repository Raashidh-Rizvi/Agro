const MarketPrice = require('../models/MarketPrice');

// @desc    Get all market prices
// @route   GET /api/market-prices
// @access  Protected
exports.getMarketPrices = async (req, res, next) => {
    try {
        let query;

        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude from direct match
        const removeFields = ['select', 'sort', 'page', 'limit'];
        removeFields.forEach(param => delete reqQuery[param]);

        // Support case-insensitive regex filtering for cropName and district if provided
        if (reqQuery.cropName) {
            reqQuery.cropName = { $regex: reqQuery.cropName, $options: 'i' };
        }
        if (reqQuery.district) {
            reqQuery.district = { $regex: reqQuery.district, $options: 'i' };
        }

        query = MarketPrice.find(reqQuery).populate({
            path: 'recordedBy',
            select: 'name role'
        });

        // Sort by recordedAt descending by default
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-recordedAt');
        }

        const prices = await query;

        res.status(200).json({
            success: true,
            count: prices.length,
            data: prices
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single market price
// @route   GET /api/market-prices/:id
// @access  Protected
exports.getMarketPriceById = async (req, res, next) => {
    try {
        const price = await MarketPrice.findById(req.params.id).populate({
            path: 'recordedBy',
            select: 'name role'
        });

        if (!price) {
            return res.status(404).json({ success: false, message: `No market price found with id of ${req.params.id}` });
        }

        res.status(200).json({
            success: true,
            data: price
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new market price
// @route   POST /api/market-prices
// @access  Protected (Admin Only)
exports.createMarketPrice = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.recordedBy = req.user.id;

        const price = await MarketPrice.create(req.body);

        res.status(201).json({
            success: true,
            data: price
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update market price
// @route   PUT /api/market-prices/:id
// @access  Protected (Admin Only)
exports.updateMarketPrice = async (req, res, next) => {
    try {
        let price = await MarketPrice.findById(req.params.id);

        if (!price) {
            return res.status(404).json({ success: false, message: `No market price found with id of ${req.params.id}` });
        }

        price = await MarketPrice.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: price
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete market price
// @route   DELETE /api/market-prices/:id
// @access  Protected (Admin Only)
exports.deleteMarketPrice = async (req, res, next) => {
    try {
        const price = await MarketPrice.findById(req.params.id);

        if (!price) {
            return res.status(404).json({ success: false, message: `No market price found with id of ${req.params.id}` });
        }

        await price.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};

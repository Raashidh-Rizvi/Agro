const MarketPrice = require('../models/MarketPrice');

// @desc    Get all market prices
// @route   GET /api/market-prices
// @access  Protected
exports.getAllMarketPrices = async (req, res, next) => {
    try {
        const { district, cropName } = req.query;
        let query = {};

        if (district) {
            query.district = { $regex: district, $options: 'i' };
        }

        if (cropName) {
            query.cropName = { $regex: cropName, $options: 'i' };
        }

        const marketPrices = await MarketPrice.find(query)
            .populate('addedBy', 'name')
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: marketPrices.length,
            data: marketPrices
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single market price
// @route   GET /api/market-prices/:id
// @access  Protected
exports.getMarketPriceById = async (req, res, next) => {
    try {
        const marketPrice = await MarketPrice.findById(req.params.id).populate('addedBy', 'name');

        if (!marketPrice) {
            return res.status(404).json({
                success: false,
                message: 'Market price not found'
            });
        }

        res.status(200).json({
            success: true,
            data: marketPrice
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new market price
// @route   POST /api/market-prices
// @access  Protected/Admin
exports.createMarketPrice = async (req, res, next) => {
    try {
        req.body.addedBy = req.user.id;

        const marketPrice = await MarketPrice.create(req.body);

        res.status(201).json({
            success: true,
            data: marketPrice
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update market price
// @route   PUT /api/market-prices/:id
// @access  Protected/Admin
exports.updateMarketPrice = async (req, res, next) => {
    try {
        let marketPrice = await MarketPrice.findById(req.params.id);

        if (!marketPrice) {
            return res.status(404).json({
                success: false,
                message: 'Market price not found'
            });
        }

        marketPrice = await MarketPrice.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: marketPrice
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete market price
// @route   DELETE /api/market-prices/:id
// @access  Protected/Admin
exports.deleteMarketPrice = async (req, res, next) => {
    try {
        const marketPrice = await MarketPrice.findById(req.params.id);

        if (!marketPrice) {
            return res.status(404).json({
                success: false,
                message: 'Market price not found'
            });
        }

        await marketPrice.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

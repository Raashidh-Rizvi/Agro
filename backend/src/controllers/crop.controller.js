const Crop = require('../models/Crop');

// ─── Helper: calculate growthStage + analytics ───────────────────────────────
function enrichCrop(crop) {
    const now = new Date();
    const planted = new Date(crop.plantedDate);
    const cropAge = Math.floor((now - planted) / (1000 * 60 * 60 * 24));
    const duration = crop.cropDuration || 1;
    const progress = Math.min(cropAge / duration, 1);
    const expectedHarvestDate = new Date(planted);
    expectedHarvestDate.setDate(expectedHarvestDate.getDate() + duration);

    let growthStage;
    if (progress >= 0.8)       growthStage = 'Harvest';
    else if (progress >= 0.4)  growthStage = 'At Risk';
    else                       growthStage = 'Growing';

    return {
        ...crop.toObject(),
        growthStage,
        cropAge,
        progressPercent: Math.round(progress * 100),
        expectedHarvestDate: expectedHarvestDate.toISOString().split('T')[0]
    };
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validateCropInput(body) {
    const errors = [];
    if (!body.cropName || !body.cropName.trim()) errors.push('Crop name is required');
    if (!body.plantedDate) errors.push('Planted date is required');
    if (body.plantedDate && new Date(body.plantedDate) > new Date()) errors.push('Planted date cannot be a future date');
    if (!body.cropDuration || Number(body.cropDuration) <= 0) errors.push('Crop duration must be greater than 0');
    if (!body.landSize || Number(body.landSize) <= 0) errors.push('Land size must be greater than 0');
    if (!body.district) errors.push('District is required');
    if (body.description) {
        const wordCount = body.description.trim().split(/\s+/).length;
        if (wordCount > 200) errors.push('Description cannot exceed 200 words');
    }
    return errors;
}

// ─── POST /api/crops ──────────────────────────────────────────────────────────
exports.createCrop = async (req, res) => {
    const errors = validateCropInput(req.body);
    if (errors.length) return res.status(400).json({ success: false, message: errors[0], errors });

    try {
        const crop = await Crop.create({ ...req.body, userId: req.user.id });
        res.status(201).json({ success: true, data: enrichCrop(crop) });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// ─── GET /api/crops ───────────────────────────────────────────────────────────
exports.getCrops = async (req, res) => {
    try {
        const { cropType, district, search, sortBy } = req.query;

        const filter = { userId: req.user.id };
        if (cropType)  filter.cropType = { $regex: cropType, $options: 'i' };
        if (district)  filter.district = district;
        if (search)    filter.cropName = { $regex: search, $options: 'i' };

        const crops = await Crop.find(filter);
        let enriched = crops.map(enrichCrop);

        // Filter by computed growthStage
        if (req.query.growthStage) {
            enriched = enriched.filter(c => c.growthStage === req.query.growthStage);
        }

        // Sorting
        const stageOrder = { Growing: 0, 'At Risk': 1, Harvest: 2 };
        if (sortBy === 'growthStage') {
            enriched.sort((a, b) => stageOrder[a.growthStage] - stageOrder[b.growthStage]);
        } else if (sortBy === 'cropType') {
            enriched.sort((a, b) => (a.cropType || '').localeCompare(b.cropType || ''));
        } else if (sortBy === 'plantedDate') {
            enriched.sort((a, b) => new Date(b.plantedDate) - new Date(a.plantedDate));
        } else {
            enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        res.json({ success: true, count: enriched.length, data: enriched });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/crops/:id ───────────────────────────────────────────────────────
exports.getCropById = async (req, res) => {
    try {
        const crop = await Crop.findOne({ _id: req.params.id, userId: req.user.id });
        if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });
        res.json({ success: true, data: enrichCrop(crop) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── PUT /api/crops/:id ───────────────────────────────────────────────────────
exports.updateCrop = async (req, res) => {
    const errors = validateCropInput(req.body);
    if (errors.length) return res.status(400).json({ success: false, message: errors[0], errors });

    try {
        const crop = await Crop.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });
        res.json({ success: true, data: enrichCrop(crop) });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// ─── DELETE /api/crops/:id ────────────────────────────────────────────────────
exports.deleteCrop = async (req, res) => {
    try {
        const crop = await Crop.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });
        res.json({ success: true, message: 'Crop deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

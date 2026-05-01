const AdvisoryAlert = require('../models/AdvisoryAlert');

const editableFields = ['title', 'cropType', 'district', 'season', 'message', 'alertType'];
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normalizeText = (value) => (typeof value === 'string' ? value.trim() : value);

const buildAlertPayload = (body = {}) => {
    const payload = {};

    editableFields.forEach((field) => {
        if (body[field] !== undefined) {
            payload[field] = normalizeText(body[field]);
        }
    });

    return payload;
};

const parseLimit = (value) => {
    const parsed = Number.parseInt(value, 10);

    if (Number.isNaN(parsed) || parsed <= 0) {
        return null;
    }

    return Math.min(parsed, 100);
};

const buildFilters = (query) => {
    const filters = {};
    const alertType = normalizeText(query.alertType);
    const cropType = normalizeText(query.cropType);
    const district = normalizeText(query.district);
    const season = normalizeText(query.season);
    const search = normalizeText(query.search);

    if (alertType) {
        filters.alertType = alertType;
    }

    if (cropType) {
        filters.cropType = new RegExp(`^${escapeRegex(cropType)}$`, 'i');
    }

    if (district) {
        filters.district = new RegExp(`^${escapeRegex(district)}$`, 'i');
    }

    if (season) {
        filters.season = new RegExp(`^${escapeRegex(season)}$`, 'i');
    }

    if (search) {
        filters.$or = [
            { title: { $regex: escapeRegex(search), $options: 'i' } },
            { message: { $regex: escapeRegex(search), $options: 'i' } },
            { cropType: { $regex: escapeRegex(search), $options: 'i' } },
            { district: { $regex: escapeRegex(search), $options: 'i' } },
            { season: { $regex: escapeRegex(search), $options: 'i' } }
        ];
    }

    return filters;
};

const canModifyAlert = (user, alert) => {
    if (!user || !alert) return false;
    if (user.role === 'Admin') return true;
    const ownerId = alert.createdBy && typeof alert.createdBy === 'object' && alert.createdBy._id
        ? alert.createdBy._id
        : alert.createdBy;

    return String(ownerId) === String(user.id);
};

exports.createAlert = async (req, res, next) => {
    try {
        const alert = await AdvisoryAlert.create({
            ...buildAlertPayload(req.body),
            createdBy: req.user.id
        });

        const populatedAlert = await AdvisoryAlert.findById(alert._id).populate('createdBy', 'name role');

        res.status(201).json({
            success: true,
            alert: populatedAlert
        });
    } catch (error) {
        next(error);
    }
};

exports.getAlerts = async (req, res, next) => {
    try {
        let query = AdvisoryAlert.find(buildFilters(req.query))
            .populate('createdBy', 'name role')
            .sort({ createdAt: -1 });

        const limit = parseLimit(req.query.limit);
        if (limit) {
            query = query.limit(limit);
        }

        const alerts = await query;

        res.status(200).json({
            success: true,
            count: alerts.length,
            alerts
        });
    } catch (error) {
        next(error);
    }
};

exports.getAlertById = async (req, res, next) => {
    try {
        const alert = await AdvisoryAlert.findById(req.params.id).populate('createdBy', 'name role');

        if (!alert) {
            return res.status(404).json({ success: false, message: 'Alert not found' });
        }

        res.status(200).json({
            success: true,
            alert
        });
    } catch (error) {
        next(error);
    }
};

exports.updateAlert = async (req, res, next) => {
    try {
        const alert = await AdvisoryAlert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({ success: false, message: 'Alert not found' });
        }

        if (!canModifyAlert(req.user, alert)) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this alert' });
        }

        const updates = buildAlertPayload(req.body);

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid alert fields provided for update'
            });
        }

        const updatedAlert = await AdvisoryAlert.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        }).populate('createdBy', 'name role');

        res.status(200).json({
            success: true,
            alert: updatedAlert
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteAlert = async (req, res, next) => {
    try {
        const alert = await AdvisoryAlert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({ success: false, message: 'Alert not found' });
        }

        if (!canModifyAlert(req.user, alert)) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this alert' });
        }

        await alert.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Alert deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

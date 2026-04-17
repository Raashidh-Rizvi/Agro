const AdvisoryAlert = require('../models/AdvisoryAlert');

const editableFields = ['title', 'cropType', 'district', 'season', 'message', 'alertType'];
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildFilters = (query) => {
    const filters = {};

    if (query.alertType) {
        filters.alertType = query.alertType;
    }

    if (query.cropType) {
        filters.cropType = new RegExp(`^${escapeRegex(query.cropType)}$`, 'i');
    }

    if (query.district) {
        filters.district = new RegExp(`^${escapeRegex(query.district)}$`, 'i');
    }

    if (query.season) {
        filters.season = new RegExp(`^${escapeRegex(query.season)}$`, 'i');
    }

    if (query.search) {
        filters.$or = [
            { title: { $regex: escapeRegex(query.search), $options: 'i' } },
            { message: { $regex: escapeRegex(query.search), $options: 'i' } },
            { cropType: { $regex: escapeRegex(query.search), $options: 'i' } },
            { district: { $regex: escapeRegex(query.search), $options: 'i' } }
        ];
    }

    return filters;
};

const canModifyAlert = (user, alert) => {
    if (!user || !alert) return false;
    if (user.role === 'Admin') return true;
    return String(alert.createdBy) === String(user.id);
};

exports.createAlert = async (req, res, next) => {
    try {
        const alert = await AdvisoryAlert.create({
            ...req.body,
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
        const alerts = await AdvisoryAlert.find(buildFilters(req.query))
            .populate('createdBy', 'name role')
            .sort({ createdAt: -1 });

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

        const updates = {};
        editableFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

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

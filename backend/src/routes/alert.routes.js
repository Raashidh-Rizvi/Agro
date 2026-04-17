const express = require('express');
const {
    createAlert,
    getAlerts,
    getAlertById,
    updateAlert,
    deleteAlert
} = require('../controllers/alert.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/')
    .get(getAlerts);

router.use(protect);

router.route('/')
    .post(authorize('Expert', 'Admin'), createAlert);

router.route('/:id')
    .get(getAlertById)
    .put(updateAlert)
    .delete(deleteAlert);

module.exports = router;

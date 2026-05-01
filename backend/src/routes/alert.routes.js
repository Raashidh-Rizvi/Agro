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

router.use(protect);

router.route('/')
    .get(getAlerts)
    .post(authorize('Expert', 'Admin'), createAlert);

router.route('/:id')
    .get(getAlertById)
    .put(authorize('Expert', 'Admin'), updateAlert)
    .delete(authorize('Expert', 'Admin'), deleteAlert);

module.exports = router;

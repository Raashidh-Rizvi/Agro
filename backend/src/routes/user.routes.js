const express = require('express');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication via JWT (CSRF not applicable for JWT mobile API)
router.use(protect);

router.get('/', authorize('Admin'), getUsers);
router.post('/', authorize('Admin'), createUser);
router.get('/:id', authorize('Admin'), getUser);
router.put('/:id', authorize('Admin'), updateUser);
router.delete('/:id', deleteUser);

module.exports = router;

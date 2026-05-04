const User = require('../models/User');
const { isValidEmail, isValidRole } = require('../utils/validation');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find({ isActive: true });
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) { next(error); }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.isActive)
            return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, data: user });
    } catch (error) { next(error); }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ success: false, message: 'Name, email and password are required' });

        if (!isValidEmail(email))
            return res.status(400).json({ success: false, message: 'Invalid email format' });

        if (password.length < 6)
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

        if (role && !isValidRole(role))
            return res.status(400).json({ success: false, message: 'Invalid role provided' });

        const exists = await User.findOne({ email });
        if (exists)
            return res.status(400).json({ success: false, message: 'Email already in use' });

        const user = await User.create({ name, email, password, role });
        res.status(201).json({ success: true, data: user });
    } catch (error) { next(error); }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
    try {
        const { name, email, role } = req.body;

        if (email) {
            if (!isValidEmail(email))
                return res.status(400).json({ success: false, message: 'Invalid email format' });

            const exists = await User.findOne({ email, _id: { $ne: req.params.id } });
            if (exists)
                return res.status(400).json({ success: false, message: 'Email already in use' });
        }

        if (role && !isValidRole(role))
            return res.status(400).json({ success: false, message: 'Invalid role provided' });

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { ...(name && { name }), ...(email && { email }), ...(role && { role }) },
            { new: true, runValidators: true }
        );

        if (!user || !user.isActive)
            return res.status(404).json({ success: false, message: 'User not found' });

        res.status(200).json({ success: true, data: user });
    } catch (error) { next(error); }
};

// @desc    Soft delete user
// @route   DELETE /api/users/:id
// @access  Private (own account) or Admin
exports.deleteUser = async (req, res, next) => {
    try {
        const requestingUserId = req.user._id.toString();
        const targetId = req.params.id;

        if (requestingUserId !== targetId && req.user.role !== 'Admin')
            return res.status(403).json({ success: false, message: 'Not authorized to delete this account' });

        const user = await User.findByIdAndUpdate(
            targetId,
            { isActive: false },
            { new: true }
        );
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });

        res.status(200).json({ success: true, message: 'User deactivated successfully' });
    } catch (error) { next(error); }
};

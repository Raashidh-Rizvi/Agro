const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOtpEmail = async (email, otp) => {
    await transporter.sendMail({
        from: `"Agro App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Password Reset OTP',
        html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border-radius:12px;border:1px solid #e0e0e0">
                <h2 style="color:#0F9D58">Password Reset</h2>
                <p>Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
                <div style="font-size:36px;font-weight:800;letter-spacing:10px;color:#0F9D58;text-align:center;padding:24px;background:#E6F4EA;border-radius:8px;margin:24px 0">${otp}</div>
                <p style="color:#888">If you did not request this, please ignore this email.</p>
            </div>
        `,
    });
};

// Register User
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role
        });

        // Create token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

// Login User
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(401).json({ success: false, message: 'Account has been deactivated' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get current user profile
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

// Update user details
exports.updateDetails = async (req, res, next) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            email: req.body.email,
            farmName: req.body.farmName,
            location: req.body.location,
            farmSize: req.body.farmSize,
            farmType: req.body.farmType
        };

        // Remove undefined fields
        Object.keys(fieldsToUpdate).forEach(key => 
            fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
        );

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// Update password
exports.updatePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        if (!(await user.matchPassword(req.body.currentPassword))) {
            return res.status(401).json({ success: false, message: 'Password is incorrect' });
        }

        user.password = req.body.newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Forgot password - sends OTP to email
exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user)
            return res.status(404).json({ success: false, message: 'No account found with that email' });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otpCode = otp;
        user.otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save({ validateBeforeSave: false });

        // Try to send email, fallback to console log in development
        try {
            await sendOtpEmail(user.email, otp);
            console.log(`OTP email sent to ${user.email}`);
        } catch (emailError) {
            console.log(`\n=============================`);
            console.log(`EMAIL FAILED - OTP for ${user.email}: ${otp}`);
            console.log(`EMAIL ERROR:`, emailError.message);
            console.log(`=============================\n`);
            // Don't throw - still return success so user can proceed
        }

        return res.status(200).json({ success: true, message: 'OTP sent to your email' });
    } catch (error) {
        next(error);
    }
};

// Verify OTP
exports.verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({
            email,
            otpCode: otp,
            otpExpire: { $gt: Date.now() }
        });

        if (!user)
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

        res.status(200).json({ success: true, message: 'OTP verified' });
    } catch (error) {
        next(error);
    }
};

// Reset password with OTP
exports.resetPassword = async (req, res, next) => {
    try {
        const { email, otp, password } = req.body;

        if (!password || password.length < 6)
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

        const user = await User.findOne({
            email,
            otpCode: otp,
            otpExpire: { $gt: Date.now() }
        });

        if (!user)
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

        user.password = password;
        user.otpCode = undefined;
        user.otpExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        next(error);
    }
};

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc Register new user
// @route POST /api/auth/register
exports.registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Password strength validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                message: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.' 
            });
        }

        // Generate verification token
        const verificationToken = crypto.randomBytes(20).toString('hex');

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'customer',
            isVerified: false,
            verificationToken
        });

        if (user) {
            // Send verification email
            const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
            
            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Email Verification | Royal Hotel',
                    html: `
                        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e5ead7; border-radius: 24px; text-align: center; background-color: #fafbf5;">
                            <h1 style="color: #2c332b; font-size: 24px; font-weight: 800; margin-bottom: 20px;">Welcome to Royal Hotel!</h1>
                            <p style="color: #667064; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">Thank you for joining us. To complete your registration and ensure your account is secure, please verify your email address by clicking the button below.</p>
                            <a href="${verificationUrl}" style="background-color: #2c332b; color: #ffffff !important; padding: 16px 36px; text-decoration: none; border-radius: 40px; font-weight: 800; display: inline-block; font-size: 14px; letter-spacing: 1px;">VERIFY MY EMAIL</a>
                            <p style="margin-top: 30px; font-size: 12px; color: #a1bc98;">If you didn't create this account, you can safely ignore this email.</p>
                        </div>
                    `
                });

                res.status(201).json({
                    message: 'Registration successful! Please check your email to verify your account.'
                });
            } catch (emailError) {
                console.error('Registration Email Error:', emailError);
                // Even if email fails, user is created. They can use "Resend Verification" later.
                res.status(201).json({
                    message: 'Registration successful, but we could not send the verification email. Please try to login and request a new one.'
                });
            }
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Verify Email
// @route GET /api/auth/verify/:token
exports.verifyEmail = async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully. You can now login.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Auth user & get token
// @route POST /api/auth/login
exports.loginUser = async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (user.isBlocked) {
                return res.status(403).json({ message: 'Your account has been blocked by admin' });
            }

            if (!user.isVerified) {
                return res.status(401).json({ 
                    message: 'Please verify your email address first. Check your inbox for the verification link.' 
                });
            }

            // If a specific role is requested, enforce it
            // This prevents a customer from logging into the manager portal and vice versa
            if (role && user.role !== role) {
                const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
                return res.status(403).json({ 
                    message: `This account is not registered as a ${roleLabel}. Please use the correct login portal.` 
                });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                wishlist: user.wishlist || [],
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Forgot Password
// @route POST /api/auth/forgotpassword
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        
        // Hash and set to resetPasswordToken field
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expire (1 hour)
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;

        await user.save();

        // Send email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click the link to reset: \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token',
                message,
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e5ead7; border-radius: 24px; text-align: center; background-color: #fafbf5;">
                        <h2 style="color: #2c332b; font-size: 24px; font-weight: 800; margin-bottom: 20px;">Password Reset Request</h2>
                        <p style="color: #667064; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">You requested to reset your password. Please click the button below to proceed. This link is valid for 1 hour.</p>
                        <a href="${resetUrl}" style="background-color: #dc3545; color: #ffffff !important; padding: 16px 36px; text-decoration: none; border-radius: 40px; font-weight: 800; display: inline-block; font-size: 14px; letter-spacing: 1px;">RESET PASSWORD</a>
                        <p style="margin-top: 30px; font-size: 12px; color: #a1bc98;">If you didn't request this, you can safely ignore this email.</p>
                    </div>
                `
            });

            res.status(200).json({ message: 'Reset email sent' });
        } catch (error) {
            console.error('Email Error:', error);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            return res.status(500).json({ message: `Email could not be sent: ${error.message}` });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Reset Password
// @route PUT /api/auth/resetpassword/:resettoken
exports.resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful. You can now login with your new password.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get user profile
// @route GET /api/auth/profile
exports.getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone || '',
            address: user.address || '',
            gender: user.gender || '',
            avatar: user.avatar || '',
            wishlist: user.wishlist || []
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc Update user profile
// @route PUT /api/auth/profile
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
            user.address = req.body.address !== undefined ? req.body.address : user.address;
            user.gender = req.body.gender !== undefined ? req.body.gender : user.gender;
            
            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                phone: updatedUser.phone,
                address: updatedUser.address,
                gender: updatedUser.gender,
                avatar: updatedUser.avatar,
                wishlist: updatedUser.wishlist || [],
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Handle OAuth success
exports.oauthSuccess = (req, res) => {
    const token = generateToken(req.user._id);
    const userInfo = encodeURIComponent(JSON.stringify({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        token
    }));
    
    // Redirect to frontend with token info
    const redirectPath = req.user.role === 'manager' ? '/manager-login' : '/login';
    res.redirect(`${process.env.FRONTEND_URL}${redirectPath}?user=${userInfo}`);
};

const express = require('express');
const router = express.Router();
const passport = require('passport');
const { 
    registerUser, 
    loginUser, 
    getUserProfile, 
    verifyEmail, 
    forgotPassword, 
    resetPassword,
    oauthSuccess,
    updateUserProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.get('/verify/:token', verifyEmail);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Google OAuth
router.get('/google', (req, res, next) => {
    const role = req.query.role || 'customer';
    console.log(`[OAuth Init] Google Role Request: ${role}`);
    passport.authenticate('google', { 
        scope: ['profile', 'email'], 
        session: false,
        state: role // Pass role as state
    })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
    const role = req.query.state || 'customer';
    passport.authenticate('google', { 
        failureRedirect: role === 'manager' ? '/manager-login' : '/login', 
        session: false 
    }, (err, user, info) => {
        if (err || !user) return res.redirect(role === 'manager' ? '/manager-login' : '/login');
        
        // Enforce role consistency for existing users
        // This prevents a customer from using the manager's sign-in path
        if (user.role !== role) {
            const portalName = role === 'manager' ? 'Manager' : 'Customer';
            const errorMessage = encodeURIComponent(`Login failed: This account is registered as a ${user.role}, but you are using the ${portalName} portal.`);
            return res.redirect(`${process.env.FRONTEND_URL}${role === 'manager' ? '/manager-login' : '/login'}?error=${errorMessage}`);
        }
        
        req.user = user;
        oauthSuccess(req, res);
    })(req, res, next);
});

// GitHub OAuth
router.get('/github', (req, res, next) => {
    const role = req.query.role || 'customer';
    console.log(`[OAuth Init] GitHub Role Request: ${role}`);
    passport.authenticate('github', { 
        scope: ['user:email'], 
        session: false,
        state: role 
    })(req, res, next);
});

router.get('/github/callback', (req, res, next) => {
    const role = req.query.state || 'customer';
    passport.authenticate('github', { 
        failureRedirect: role === 'manager' ? '/manager-login' : '/login', 
        session: false 
    }, (err, user, info) => {
        if (err || !user) return res.redirect(role === 'manager' ? '/manager-login' : '/login');
        
        // Enforce role consistency for existing users
        if (user.role !== role) {
            const portalName = role === 'manager' ? 'Manager' : 'Customer';
            const errorMessage = encodeURIComponent(`Login failed: This account is registered as a ${user.role}, but you are using the ${portalName} portal.`);
            return res.redirect(`${process.env.FRONTEND_URL}${role === 'manager' ? '/manager-login' : '/login'}?error=${errorMessage}`);
        }
        
        req.user = user;
        oauthSuccess(req, res);
    })(req, res, next);
});

module.exports = router;

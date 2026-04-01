const express = require('express');
const passport = require('../config/passport');
const {
  register,
  login,
  adminLogin,
  googleAuthCallback,
  getMe,
  updateProfile,
  verifyOTP,
  resendOTP
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Google OAuth availability check
router.get('/google/status', (req, res) => {
  const available =
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id' &&
    process.env.GOOGLE_CLIENT_SECRET !== 'your-google-client-secret';
  res.json({ available: !!available });
});

// Google OAuth routes — only mounted when credentials are configured
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id' &&
  process.env.GOOGLE_CLIENT_SECRET !== 'your-google-client-secret'
) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    googleAuthCallback
  );
}

module.exports = router;
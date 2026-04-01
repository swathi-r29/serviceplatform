const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Check if JWT_SECRET exists
      if (!process.env.JWT_SECRET) {
        console.error('❌ JWT_SECRET not found in environment variables');
        return res.status(500).json({
          success: false,
          message: 'Server configuration error: JWT_SECRET not set'
        });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        console.error('❌ User not found in database');
        return res.status(401).json({
          success: false,
          message: 'Not authorized - user not found'
        });
      }

      // Check worker status
      if (req.user.role === 'worker') {
        if (req.user.status === 'pending') {
          console.error('❌ Worker awaiting status attempting to access protected route');
          return res.status(403).json({
            success: false,
            message: 'Your account is awaiting admin approval. Please wait for an administrator to approve your account.'
          });
        } else if (req.user.status === 'rejected') {
          console.error('❌ Rejected worker attempting to access protected route');
          return res.status(403).json({
            success: false,
            message: 'Your account is not approved by the admin.'
          });
        }
      }

      next();
    } catch (error) {
      console.error('❌ Auth error:', error.message);

      return res.status(401).json({
        success: false,
        message: 'Not authorized - token failed',
        error: error.message
      });
    }
  } else {
    console.error('❌ No token provided');

    return res.status(401).json({
      success: false,
      message: 'Not authorized - no token provided'
    });
  }
};

module.exports = { protect };
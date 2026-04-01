const User = require('../models/User');

const ensureSingleAdmin = async (req, res, next) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    if (adminCount > 1) {
      console.error('⚠️  CRITICAL: Multiple admins detected in the system!');
      return res.status(500).json({ 
        message: 'System error: Multiple admins detected. Contact support.' 
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const preventAdminModification = async (req, res, next) => {
  try {
    const targetUserId = req.params.id || req.body.userId;
    
    if (targetUserId) {
      const targetUser = await User.findById(targetUserId);
      
      if (targetUser && targetUser.role === 'admin') {
        return res.status(403).json({ 
          message: 'Cannot modify or delete admin account' 
        });
      }
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  ensureSingleAdmin, 
  preventAdminModification 
};
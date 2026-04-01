// Middleware to check user role
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    console.log('\n--- ROLE CHECK MIDDLEWARE ---');
    console.log('Allowed roles:', allowedRoles);
    
    // Make sure protect middleware has run first
    if (!req.user) {
      console.error('❌ No user found in request');
      console.log('--- ROLE CHECK END ---\n');
      return res.status(401).json({ 
        success: false,
        message: 'Not authenticated' 
      });
    }

    console.log('User role:', req.user.role);

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      console.error('❌ Access denied - insufficient permissions');
      console.log('--- ROLE CHECK END ---\n');
      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}` 
      });
    }

    console.log('✅ Role check passed');
    console.log('--- ROLE CHECK END ---\n');
    next();
  };
};

module.exports = { checkRole };
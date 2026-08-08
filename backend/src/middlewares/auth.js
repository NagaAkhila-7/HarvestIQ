const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { DEFAULT_ROLE_PERMISSIONS } = require('../config/constants');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication token is missing or invalid' }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'harvestiq_super_secret_access_key_2026_safe');
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive || user.isDeleted) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User account is inactive or not found' }
      });
    }

    req.user = user;
    req.organisationId = user.organisationId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token', details: [error.message] }
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { 
          code: 'FORBIDDEN', 
          message: `Access denied. Role '${req.user.role}' is not authorized for this operation` 
        }
      });
    }
    next();
  };
};

const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[req.user.role] || [];
    const userPermissions = [...rolePermissions, ...(req.user.customPermissions || [])];

    if (!userPermissions.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Missing required permission: ${requiredPermission}`
        }
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  checkPermission
};

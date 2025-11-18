const jwt = require('jsonwebtoken');
const { User, Organization } = require('../models');

// Verify JWT token and attach user to request
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      include: [{
        model: Organization,
        as: 'organization'
      }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'User account is not active'
      });
    }

    req.user = user;
    req.userId = user.id;
    req.organizationId = user.organizationId;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token expired'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

// Check if user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

// Check if user is org admin for the specified organization
const isOrgAdmin = async (req, res, next) => {
  try {
    const orgId = req.params.orgId || req.params.id;

    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID required'
      });
    }

    // Super admins can access any organization
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Org admins can only access their own organization
    if (req.user.role === 'org_admin' && req.user.organizationId === orgId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'You do not have admin access to this organization'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authorization error',
      error: error.message
    });
  }
};

// Generate JWT token for user
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = {
  authenticate,
  authorize,
  isOrgAdmin,
  generateToken
};

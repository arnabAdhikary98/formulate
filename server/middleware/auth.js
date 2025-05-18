const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes - requires authentication
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production');

      // Get user from the token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          message: 'User not found',
        });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({
        message: 'Not authorized, token failed',
      });
    }
  }

  if (!token) {
    res.status(401).json({
      message: 'Not authorized, no token',
    });
  }
};

module.exports = { protect }; 
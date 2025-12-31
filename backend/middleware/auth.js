const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyAccessToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access token required', code: 'NO_TOKEN' });
    }

    const accessToken = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.userId).select('-password -refreshToken');

      if (!user) {
        return res.status(401).json({ message: 'User not found', code: 'USER_NOT_FOUND' });
      }

      req.user = user;
      req.userId = decoded.userId;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Access token expired', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ message: 'Invalid access token', code: 'INVALID_TOKEN' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { verifyAccessToken };

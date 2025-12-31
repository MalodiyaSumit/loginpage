const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyAccessToken } = require('../middleware/auth');
const { validateSignup, validateLogin } = require('../validators/auth.validator');

const router = express.Router();

// Cookie options for refresh token
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

// Generate Access Token (15 minutes)
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

// Generate Refresh Token (7 days)
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/signup
router.post('/signup', validateSignup, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = new User({ name, email, password });
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(201).json({
      message: 'Account created successfully',
      accessToken,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is locked
    if (user.isLocked) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        message: `Account locked. Try again in ${remainingTime} minutes`,
        code: 'ACCOUNT_LOCKED'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.handleFailedLogin();
      const attemptsLeft = 5 - (user.loginAttempts + 1);
      return res.status(401).json({
        message: attemptsLeft > 0
          ? `Invalid password. ${attemptsLeft} attempts left`
          : 'Account locked for 15 minutes due to too many failed attempts'
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.json({
      message: 'Login successful',
      accessToken,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required', code: 'NO_REFRESH_TOKEN' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      res.clearCookie('refreshToken', cookieOptions);
      return res.status(401).json({ message: 'Invalid refresh token', code: 'INVALID_REFRESH_TOKEN' });
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      res.clearCookie('refreshToken', cookieOptions);
      return res.status(401).json({ message: 'Refresh token revoked', code: 'REFRESH_TOKEN_REVOKED' });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie('refreshToken', newRefreshToken, cookieOptions);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/verify
router.get('/verify', verifyAccessToken, (req, res) => {
  res.json({
    user: { id: req.user._id, name: req.user.name, email: req.user.email }
  });
});

// POST /api/auth/logout
router.post('/logout', verifyAccessToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { refreshToken: null });
    res.clearCookie('refreshToken', cookieOptions);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', verifyAccessToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.userId);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/auth/update-profile
router.put('/update-profile', verifyAccessToken, async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name && !email) {
      return res.status(400).json({ message: 'Name or email is required' });
    }

    const updates = {};
    if (name) updates.name = name.trim();
    if (email) {
      const emailLower = email.toLowerCase().trim();

      // Check if email already exists
      const existingUser = await User.findOne({ email: emailLower, _id: { $ne: req.userId } });
      if (existingUser) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      updates.email = emailLower;
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true });

    res.json({
      message: 'Profile updated successfully',
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/auth/delete-account
router.delete('/delete-account', verifyAccessToken, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required to delete account' });
    }

    const user = await User.findById(req.userId);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password is incorrect' });
    }

    await User.findByIdAndDelete(req.userId);
    res.clearCookie('refreshToken', cookieOptions);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

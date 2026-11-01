const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Marriage = require('../models/Marriage');

const sendTokenResponse = (user, statusCode, res) => {
  const payload = {
    id: user._id,
    role: user.role,
    name: user.name,
    email: user.email,
    assignedMarriageId: user.assignedMarriageId || null
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret_key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  };

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    user: payload,
    token
  });
};

// @desc    Register Admin
// @route   POST /api/v1/auth/admin/register
// @access  Public
const adminRegister = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'ADMIN'
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login Admin
// @route   POST /api/v1/auth/admin/login
// @access  Public
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Guest Unlock (Login via Marriage Code)
// @route   POST /api/v1/auth/guest/login
// @access  Public
const guestLogin = async (req, res, next) => {
  try {
    const { marriageCode } = req.body;

    if (!marriageCode) {
      return res.status(400).json({ error: 'Please provide a marriage passcode.' });
    }

    const marriage = await Marriage.findOne({
      marriageCode: marriageCode.trim().toUpperCase()
    });

    if (!marriage) {
      return res.status(404).json({ error: 'Invalid marriage code. Marriage not found.' });
    }

    // Update guest engagement count
    await Marriage.findByIdAndUpdate(marriage._id, {
      $inc: { 'globalStats.totalGuestsEngaged': 1 }
    });

    const guestPayload = {
      _id: `guest_${Date.now()}`,
      name: 'Guest',
      email: `guest@${marriage.marriageCode.toLowerCase()}.local`,
      role: 'GUEST',
      assignedMarriageId: marriage._id
    };

    sendTokenResponse(guestPayload, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({
    success: true,
    message: 'User logged out successfully.'
  });
};

// @desc    Get current user profile
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
};

module.exports = {
  adminRegister,
  adminLogin,
  guestLogin,
  logout,
  getMe
};


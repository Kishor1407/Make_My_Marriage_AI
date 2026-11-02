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

// @desc    Guest Unlock (Instant Zero-Password Login via Name/Email & Marriage Code)
// @route   POST /api/v1/auth/guest/login
// @access  Public
const guestLogin = async (req, res, next) => {
  try {
    const { name, email, marriageCode } = req.body;

    let marriage = null;
    if (marriageCode) {
      marriage = await Marriage.findOne({
        marriageCode: marriageCode.trim().toUpperCase()
      });

      if (!marriage && !name && !email) {
        return res.status(404).json({ error: 'Invalid marriage code. Marriage not found.' });
      }

      if (marriage) {
        // Update guest engagement count
        await Marriage.findByIdAndUpdate(marriage._id, {
          $inc: { 'globalStats.totalGuestsEngaged': 1 }
        });
      }
    }

    const guestPayload = {
      _id: `guest_${Date.now()}`,
      name: name?.trim() || 'Honored Guest',
      email: email?.trim().toLowerCase() || (marriage ? `guest@${marriage.marriageCode.toLowerCase()}.local` : 'guest@makemymarriage.com'),
      role: 'GUEST',
      assignedMarriageId: marriage ? marriage._id : null
    };

    sendTokenResponse(guestPayload, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Secret Passcode & Unlock Marriage Sanctuary
// @route   POST /api/v1/auth/guest/verify-passcode
// @access  Public
const verifyPasscode = async (req, res, next) => {
  try {
    const { marriageCode, name, email } = req.body;

    if (!marriageCode) {
      return res.status(400).json({ success: false, error: 'Please provide a confidential wedding passcode.' });
    }

    const cleanCode = marriageCode.trim().toUpperCase();
    const marriage = await Marriage.findOne({ marriageCode: cleanCode });

    if (!marriage) {
      return res.status(404).json({
        success: false,
        error: 'The code entered does not match this wedding sanctuary. Verify with the host family or physical stationery.'
      });
    }

    // Atomic increment of guests engaged
    await Marriage.findByIdAndUpdate(marriage._id, {
      $inc: { 'globalStats.totalGuestsEngaged': 1 }
    });

    const guestPayload = {
      _id: `guest_${Date.now()}`,
      name: name?.trim() || 'Honored Guest',
      email: email?.trim().toLowerCase() || `guest@${cleanCode.toLowerCase()}.local`,
      role: 'GUEST',
      assignedMarriageId: marriage._id,
      unlockedCode: cleanCode
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
  verifyPasscode,
  logout,
  getMe
};


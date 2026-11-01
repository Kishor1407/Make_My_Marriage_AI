const express = require('express');
const router = express.Router();
const {
  adminRegister,
  adminLogin,
  guestLogin,
  logout,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/admin/register', adminRegister);
router.post('/admin/login', adminLogin);
router.post('/guest/login', guestLogin);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;


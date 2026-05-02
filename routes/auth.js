const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// POST /api/auth/register - ثبت‌نام
router.post('/register', authController.register);

// POST /api/auth/login - لاگین
router.post('/login', authController.login);

// GET /api/auth/profile - پروفایل کاربر (نیاز به لاگین)
router.get('/profile', auth, authController.getProfile);

module.exports = router;

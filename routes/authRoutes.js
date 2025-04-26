const express = require('express');
const router = express.Router();
const { registerUser, getUserProfile } = require('../controllers/authController');
const { authenticateUser } = require('../middlewares/authMiddleware');

// @route POST /api/auth/register
router.post('/register', registerUser);

// @route GET /api/auth/me
router.get('/profile', authenticateUser, getUserProfile);

module.exports = router;

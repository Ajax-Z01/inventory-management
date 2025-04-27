const express = require('express');
const { check } = require('express-validator');
const { authenticateUser, authorizeAdmin } = require('../middlewares/authMiddleware');
const { userController } = require('../controllers');
const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticateUser, authorizeAdmin, userController.getAllUsersController);

// Get user by ID
router.get('/:id', authenticateUser, userController.getUser);

// Update user info
router.put('/:id', 
  authenticateUser, 
  check('email').isEmail().optional(),  // Email validation
  check('name').notEmpty().optional(),  // Optional name validation
  check('role').isIn(['admin', 'user']).optional(),  // Optional role validation
  userController.updateUserInfo
);

// Delete user
router.delete('/:id', authenticateUser, authorizeAdmin, userController.deleteUserInfo);

module.exports = router;

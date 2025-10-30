const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.post('/login', authController.login);

// Protected routes
router.post('/register', authenticate, authorize(['Admin']), authController.register);
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;

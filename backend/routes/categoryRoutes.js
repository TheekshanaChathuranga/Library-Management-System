const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

router.get('/', categoryController.getAllCategories);
router.post('/', authorize(['Admin', 'Librarian']), categoryController.addCategory);

module.exports = router;

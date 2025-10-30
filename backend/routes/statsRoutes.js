const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

router.get('/dashboard', statsController.getDashboardStats);
router.get('/popular-books', statsController.getPopularBooks);
router.get('/categories', statsController.getCategoryStats);
router.get('/monthly-report', statsController.getMonthlyReport);
router.get('/members', statsController.getMemberStats);

module.exports = router;

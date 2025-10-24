const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate); // All report routes require authentication

router.get('/overdue', reportController.getOverdueBooks);
router.get('/popular', reportController.getPopularBooks);
router.get('/statistics', reportController.getDailyStatistics);
router.get('/revenue', authorize(['Admin']), reportController.getRevenueReport);

module.exports = router;
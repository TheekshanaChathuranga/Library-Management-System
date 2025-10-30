const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET routes
router.get('/', transactionController.getAllTransactions);
router.get('/overdue', transactionController.getOverdueBooks);
router.get('/member/:member_id', transactionController.getMemberTransactions);
router.get('/:id', transactionController.getTransactionById);

// POST routes (Admin & Librarian only)
router.post('/issue', authorize(['Admin', 'Librarian']), transactionController.issueBook);

// PUT routes (Admin & Librarian only)
router.put('/:id/return', authorize(['Admin', 'Librarian']), transactionController.returnBook);

module.exports = router;

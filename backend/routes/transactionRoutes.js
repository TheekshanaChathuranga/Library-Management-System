const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate); // All transaction routes require authentication

router.get('/', transactionController.getAllTransactions);
router.get('/:id', transactionController.getTransactionById);
router.post('/issue', authorize(['Admin', 'Librarian']), transactionController.issueBook);
router.post('/return', authorize(['Admin', 'Librarian']), transactionController.returnBook);
router.post('/reserve', transactionController.reserveBook);

module.exports = router;
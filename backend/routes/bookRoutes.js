const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', bookController.getAllBooks);
router.get('/search', bookController.searchBooks);
router.get('/:id', bookController.getBookById);

// Protected routes
router.post('/', authenticate, authorize(['Admin', 'Librarian']), bookController.addBook);
router.put('/:id', authenticate, authorize(['Admin', 'Librarian']), bookController.updateBook);
router.delete('/:id', authenticate, authorize(['Admin']), bookController.deleteBook);

module.exports = router;
const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET routes
router.get('/', bookController.getAllBooks);
router.get('/search', bookController.searchBooks);
router.get('/popular', bookController.getPopularBooks);
router.get('/:id', bookController.getBookById);

// POST routes (Admin & Librarian only)
router.post('/', authorize(['Admin', 'Librarian']), bookController.addBook);

// PUT routes (Admin & Librarian only)
router.put('/:id', authorize(['Admin', 'Librarian']), bookController.updateBook);

// DELETE routes (Admin only)
router.delete('/:id', authorize(['Admin']), bookController.deleteBook);

module.exports = router;

const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET routes
router.get('/', memberController.getAllMembers);
router.get('/search', memberController.searchMembers);
router.get('/:id', memberController.getMemberById);

// POST routes (Admin & Librarian only)
router.post('/', authorize(['Admin', 'Librarian']), memberController.addMember);

// PUT routes (Admin & Librarian only)
router.put('/:id', authorize(['Admin', 'Librarian']), memberController.updateMember);

// DELETE routes (Admin only)
router.delete('/:id', authorize(['Admin']), memberController.deleteMember);

module.exports = router;

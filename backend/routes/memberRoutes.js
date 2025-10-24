const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate); // All member routes require authentication

router.get('/', memberController.getAllMembers);
router.get('/:id', memberController.getMemberById);
router.get('/:id/history', memberController.getMemberHistory);
router.post('/', authorize(['Admin', 'Librarian']), memberController.addMember);
router.put('/:id', authorize(['Admin', 'Librarian']), memberController.updateMember);
router.delete('/:id', authorize(['Admin']), memberController.deleteMember);

module.exports = router;
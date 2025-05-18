const express = require('express');
const {
  createForm,
  getForms,
  getFormById,
  getFormByUrl,
  updateForm,
  deleteForm,
  publishForm,
  closeForm,
  verifyFormPassword,
} = require('../controllers/formController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected routes (require authentication)
router.route('/')
  .get(protect, getForms)
  .post(protect, createForm);

router.route('/:id')
  .get(protect, getFormById)
  .put(protect, updateForm)
  .delete(protect, deleteForm);

router.put('/:id/publish', protect, publishForm);
router.put('/:id/close', protect, closeForm);

// Public routes
router.get('/url/:uniqueUrl', getFormByUrl);
router.post('/:id/verify-password', verifyFormPassword);

module.exports = router; 
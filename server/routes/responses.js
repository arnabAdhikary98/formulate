const express = require('express');
const {
  submitResponse,
  getFormResponses,
  getResponseSummary,
  deleteResponse,
} = require('../controllers/responseController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/', submitResponse);

// Protected routes
router.get('/form/:formId', protect, getFormResponses);
router.get('/form/:formId/summary', protect, getResponseSummary);
router.delete('/:id', protect, deleteResponse);

module.exports = router; 
const express = require('express');
const {
  uploadFile,
  getFile,
  deleteFile
} = require('../controllers/fileController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/files/upload/:formId
// @desc    Upload a file for a form response
// @access  Public
router.post('/upload/:formId', uploadFile);

// @route   GET /api/files/:formId/:fileName
// @desc    Get a file by form ID and filename
// @access  Public
router.get('/:formId/:fileName', getFile);

// @route   DELETE /api/files/:responseId/:fileId
// @desc    Delete a file from a response
// @access  Private
router.delete('/:responseId/:fileId', protect, deleteFile);

module.exports = router; 
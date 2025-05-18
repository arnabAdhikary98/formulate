const path = require('path');
const fs = require('fs');
const Form = require('../models/Form');
const Response = require('../models/Response');

// @desc    Upload file for a form response
// @route   POST /api/files/upload/:formId
// @access  Public
const uploadFile = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'No files were uploaded.' });
    }

    const formId = req.params.formId;
    const fieldId = req.body.fieldId;
    const fieldLabel = req.body.fieldLabel;
    const responseId = req.body.responseId;

    // Validate form exists and accepts file uploads
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (!form.settings.enableFileUploads) {
      return res.status(400).json({ message: 'File uploads are not enabled for this form' });
    }

    // Get the upload file from request
    const file = req.files.file;
    
    // Validate file size
    if (file.size > form.settings.maxFileSizeTotal) {
      return res.status(400).json({ 
        message: `File too large. Maximum size is ${form.settings.maxFileSizeTotal / (1024 * 1024)}MB` 
      });
    }

    // Check if response exists
    let response;
    if (responseId) {
      response = await Response.findById(responseId);
      if (!response) {
        return res.status(404).json({ message: 'Response not found' });
      }

      // Check if max file count is reached
      if (response.files.length >= form.settings.maxFileCount) {
        return res.status(400).json({ 
          message: `Maximum file count (${form.settings.maxFileCount}) reached` 
        });
      }
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads', formId);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate a unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);
    const fileUrl = `/uploads/${formId}/${fileName}`;

    // Move the file to the uploads directory
    await file.mv(filePath);

    // Create file info object
    const fileInfo = {
      fieldId,
      fieldLabel,
      originalName: file.name,
      fileName,
      fileSize: file.size,
      fileType: file.mimetype,
      uploadPath: filePath,
      url: fileUrl,
      uploadedAt: new Date()
    };

    // If we have a response ID, add the file to the response
    if (response) {
      response.files.push(fileInfo);
      await response.save();
    }

    res.status(200).json({
      message: 'File uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Server error during file upload' });
  }
};

// @desc    Get file from uploads directory
// @route   GET /api/files/:formId/:fileName
// @access  Public for published forms, Private for unpublished
const getFile = async (req, res) => {
  try {
    const { formId, fileName } = req.params;
    const filePath = path.join(__dirname, '../uploads', formId, fileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('File retrieval error:', error);
    res.status(500).json({ message: 'Server error during file retrieval' });
  }
};

// @desc    Delete file from response
// @route   DELETE /api/files/:responseId/:fileId
// @access  Private
const deleteFile = async (req, res) => {
  try {
    const { responseId, fileId } = req.params;
    
    // Find the response
    const response = await Response.findById(responseId);
    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }

    // Find the form to check ownership
    const form = await Form.findById(response.form);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check if user owns the form
    if (form.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this file' });
    }

    // Find the file in the response
    const fileIndex = response.files.findIndex(file => file._id.toString() === fileId);
    if (fileIndex === -1) {
      return res.status(404).json({ message: 'File not found in response' });
    }

    const fileToDelete = response.files[fileIndex];
    
    // Delete the file from the filesystem
    const filePath = fileToDelete.uploadPath;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove the file from the response
    response.files.splice(fileIndex, 1);
    await response.save();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ message: 'Server error during file deletion' });
  }
};

module.exports = {
  uploadFile,
  getFile,
  deleteFile
}; 
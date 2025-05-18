const Form = require('../models/Form');

// @desc    Create a new form
// @route   POST /api/forms
// @access  Private
const createForm = async (req, res) => {
  try {
    const { title, description } = req.body;

    const form = await Form.create({
      title,
      description,
      creator: req.user._id,
      pages: [{ title: 'Page 1', order: 1, fields: [] }], // Default first page
    });

    res.status(201).json(form);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all forms for a user
// @route   GET /api/forms
// @access  Private
const getForms = async (req, res) => {
  try {
    const forms = await Form.find({ creator: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(forms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a single form by ID
// @route   GET /api/forms/:id
// @access  Private
const getFormById = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check if user owns the form
    if (form.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this form' });
    }

    res.json(form);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a form by unique URL (for responding)
// @route   GET /api/forms/url/:uniqueUrl
// @access  Public
const getFormByUrl = async (req, res) => {
  try {
    const form = await Form.findOne({ uniqueUrl: req.params.uniqueUrl });

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check form status
    if (form.status === 'draft') {
      return res.status(403).json({ message: 'This form is not yet published' });
    } else if (form.status === 'closed') {
      return res.status(403).json({ message: 'This form is no longer accepting responses' });
    } else if (form.status === 'scheduled' && new Date(form.publishDate) > new Date()) {
      return res.status(403).json({ message: 'This form is not yet open for responses' });
    }

    // For security, only send necessary form data for responding (exclude sensitive data)
    const responseForm = {
      _id: form._id,
      title: form.title,
      description: form.description,
      pages: form.pages,
      status: form.status,
      publishDate: form.publishDate,
      settings: form.settings,
      uniqueUrl: form.uniqueUrl,
      passwordProtected: form.accessCode.enabled,
      // Don't send the actual password to the client
    };

    res.json(responseForm);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a form
// @route   PUT /api/forms/:id
// @access  Private
const updateForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check if user owns the form
    if (form.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this form' });
    }

    // Update form fields
    const updatedForm = await Form.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json(updatedForm);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a form
// @route   DELETE /api/forms/:id
// @access  Private
const deleteForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check if user owns the form
    if (form.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this form' });
    }

    await form.deleteOne();
    res.json({ message: 'Form removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Publish a form
// @route   PUT /api/forms/:id/publish
// @access  Private
const publishForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check if user owns the form
    if (form.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to publish this form' });
    }

    // Update form with password protection if provided
    if (req.body.passwordProtected) {
      form.accessCode.enabled = true;
      form.accessCode.code = req.body.password;
    } else {
      form.accessCode.enabled = false;
      form.accessCode.code = null;
    }

    form.status = 'published';
    const updatedForm = await form.save();

    res.json(updatedForm);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Close a form
// @route   PUT /api/forms/:id/close
// @access  Private
const closeForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check if user owns the form
    if (form.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to close this form' });
    }

    form.status = 'closed';
    const updatedForm = await form.save();

    res.json(updatedForm);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify form password
// @route   POST /api/forms/:id/verify-password
// @access  Public
const verifyFormPassword = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Verify the password
    if (!form.accessCode.enabled) {
      return res.status(400).json({ message: 'This form is not password protected' });
    }

    if (req.body.password === form.accessCode.code) {
      return res.status(200).json({ verified: true });
    } else {
      return res.status(401).json({ verified: false, message: 'Incorrect password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createForm,
  getForms,
  getFormById,
  getFormByUrl,
  updateForm,
  deleteForm,
  publishForm,
  closeForm,
  verifyFormPassword,
}; 
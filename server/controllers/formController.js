const Form = require('../models/Form');

// @desc    Create a new form
// @route   POST /api/forms
// @access  Private
const createForm = async (req, res) => {
  try {
    // Extract all form data from request body
    const formData = { ...req.body };
    
    // Ensure creator is set
    formData.creator = req.user._id;
    
    // Log the form data being saved
    console.log('Creating new form with data:', JSON.stringify(formData));
    
    // Ensure pages and fields have proper structure
    if (!formData.pages || !Array.isArray(formData.pages) || formData.pages.length === 0) {
      // Set default page if missing
      formData.pages = [{ title: 'Page 1', order: 0, fields: [] }];
    } else {
      // Process existing pages to ensure proper structure
      formData.pages = formData.pages.map((page, pageIndex) => {
        // Ensure page has an order
        page.order = pageIndex;
        
        // Process fields if they exist
        if (page.fields && Array.isArray(page.fields)) {
          page.fields = page.fields.map((field, fieldIndex) => {
            // Ensure field has proper structure
            return {
              ...field,
              order: fieldIndex,
              // Ensure conditional logic is properly structured
              conditional: field.conditional || {
                isConditional: false,
                condition: 'equals',
                value: ''
              }
            };
          });
        } else {
          page.fields = [];
        }
        
        return page;
      });
    }

    // Check if we need to update an existing form or create a new one
    let form;
    
    if (formData._id) {
      // This might be an update with existing ID - check if it exists
      try {
        const existingForm = await Form.findById(formData._id);
        
        if (existingForm) {
          // If existing form belongs to this user, update it instead of creating new
          if (existingForm.creator.toString() === req.user._id.toString()) {
            console.log(`Updating existing form with ID: ${existingForm._id}`);
            
            // Remove _id from formData to prevent MongoDB error
            delete formData._id;
            
            form = await Form.findByIdAndUpdate(
              existingForm._id,
              formData,
              { new: true, runValidators: true }
            );
            console.log('Form updated successfully');
          } else {
            // ID exists but doesn't belong to this user, create new without the ID
            delete formData._id;
            form = await Form.create(formData);
            console.log('Form created with new ID:', form._id);
          }
        } else {
          // ID was provided but doesn't exist, create new without the ID
          delete formData._id;
          form = await Form.create(formData);
          console.log('Form created with new ID:', form._id);
        }
      } catch (error) {
        // Error finding by ID - create new without the ID
        console.log('Error checking form ID, creating new:', error.message);
        delete formData._id;
        form = await Form.create(formData);
        console.log('Form created with new ID:', form._id);
      }
    } else {
      // No ID provided, create new
      form = await Form.create(formData);
      console.log('Form created with new ID:', form._id);
    }
    
    // Generate a unique URL for the form if one doesn't exist
    if (!form.uniqueUrl) {
      form.uniqueUrl = form._id.toString();
      await form.save();
    }

    res.status(201).json(form);
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ message: 'Server error creating form', error: error.message });
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
    console.log(`Attempting to find form with uniqueUrl: "${req.params.uniqueUrl}"`);
    
    // Decode the URL parameter in case it was encoded
    const decodedUrl = decodeURIComponent(req.params.uniqueUrl);
    
    // Try to find by uniqueUrl first
    let form = await Form.findOne({ uniqueUrl: decodedUrl });
    
    // If not found and the URL looks like a MongoDB ID, try finding by ID
    if (!form && /^[0-9a-fA-F]{24}$/.test(decodedUrl)) {
      console.log(`No form found with uniqueUrl, trying as MongoDB ID: ${decodedUrl}`);
      form = await Form.findById(decodedUrl);
    }

    if (!form) {
      console.log(`Form not found for uniqueUrl or ID: ${decodedUrl}`);
      return res.status(404).json({ message: 'Form not found' });
    }
    
    console.log(`Form found: ${form._id}, status: ${form.status}`);

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
    console.error('Error getting form by URL:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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

    // Log the incoming update payload to debug field saving issues
    console.log('Updating form with ID:', req.params.id);
    console.log('Update payload:', JSON.stringify(req.body));
    
    // Ensure the request body has all required nested structures
    const formData = { ...req.body };
    
    // Make sure we don't lose the creator when updating
    formData.creator = form.creator;
    
    // Clean up fields data to ensure it matches the schema
    if (formData.pages && Array.isArray(formData.pages)) {
      formData.pages = formData.pages.map((page, pageIndex) => {
        // Ensure page properties match schema
        if (page.fields && Array.isArray(page.fields)) {
          page.fields = page.fields.map((field, fieldIndex) => {
            // Ensure field has all required properties
            return {
              ...field,
              order: fieldIndex
            };
          });
        }
        return {
          ...page,
          order: pageIndex
        };
      });
    }

    // Update form with new data
    const updatedForm = await Form.findByIdAndUpdate(
      req.params.id,
      formData,
      { new: true, runValidators: true }
    );

    console.log('Form updated successfully');
    res.json(updatedForm);
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ message: 'Server error updating form' });
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
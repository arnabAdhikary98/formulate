import api from './axios';

// Create a new form
export const createForm = async (formData) => {
  const response = await api.post('/forms', formData);
  return response.data;
};

// Get all forms for the logged in user
export const getForms = async () => {
  const response = await api.get('/forms');
  return response.data;
};

// Get a form by ID (for editing)
export const getFormById = async (formId) => {
  const response = await api.get(`/forms/${formId}`);
  return response.data;
};

// Get a form by its unique URL (for submissions)
export const getFormByUrl = async (uniqueUrl) => {
  try {
    // The uniqueUrl should already be properly encoded by the calling function
    // But we'll handle any edge cases here
    const url = `/forms/url/${uniqueUrl}`;
    console.log(`Making API request to: ${url}`);
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching form by URL:', error);
    throw error;
  }
};

// Update a form
export const updateForm = async (formId, formData) => {
  const response = await api.put(`/forms/${formId}`, formData);
  return response.data;
};

// Delete a form
export const deleteForm = async (formId) => {
  const response = await api.delete(`/forms/${formId}`);
  return response.data;
};

// Publish a form
export const publishForm = async (formId, protectionOptions = {}) => {
  const response = await api.put(`/forms/${formId}/publish`, protectionOptions);
  return response.data;
};

// Close a form
export const closeForm = async (formId) => {
  const response = await api.put(`/forms/${formId}/close`);
  return response.data;
};

// Verify form password
export const verifyFormPassword = async (formId, password) => {
  const response = await api.post(`/forms/${formId}/verify-password`, { password });
  return response.data;
}; 
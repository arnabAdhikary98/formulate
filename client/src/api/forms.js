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
  const response = await api.get(`/forms/url/${uniqueUrl}`);
  return response.data;
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
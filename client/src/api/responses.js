import api from './axios';

// Submit a response to a form (public)
export const submitResponse = async (responseData) => {
  try {
    const response = await api.post('/responses', responseData);
    return response.data;
  } catch (error) {
    console.error('Error submitting form response:', error);
    // Propagate the error with any response data
    throw error;
  }
};

// Get all responses for a form
export const getFormResponses = async (formId) => {
  const response = await api.get(`/responses/form/${formId}`);
  return response.data;
};

// Get summary of responses for a form
export const getResponseSummary = async (formId) => {
  const response = await api.get(`/responses/form/${formId}/summary`);
  return response.data;
};

// Get response count for a form
export const getResponseCount = async (formId) => {
  try {
    const response = await api.get(`/responses/form/${formId}/count`);
    return response.data;
  } catch (error) {
    // If the endpoint doesn't exist, return a default count object
    console.warn(`Response count endpoint not available for form ${formId}`);
    return { count: 0 };
  }
};

// Delete a specific response
export const deleteResponse = async (responseId) => {
  const response = await api.delete(`/responses/${responseId}`);
  return response.data;
}; 
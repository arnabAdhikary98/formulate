import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  Rating,
  InputLabel,
  CircularProgress,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  ArrowForward as NextIcon,
  ArrowBack as PrevIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  LockOutlined as LockIcon,
  Email as EmailIcon
} from '@mui/icons-material';

import { getFormByUrl, verifyFormPassword } from '../api/forms';
import { submitResponse } from '../api/responses';
import Cookies from 'js-cookie';

const PublicForm = () => {
  const { formUrl } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  
  // Load form data
  useEffect(() => {
    const loadForm = async () => {
      try {
        console.log("Loading form with URL:", formUrl);
        
        if (!formUrl) {
          console.error("No form URL provided");
          setError('Invalid form URL. Please check the link and try again.');
          setLoading(false);
          return;
        }
        
        // Ensure formUrl is properly encoded for API request
        // But we need to decode it first to avoid double-encoding
        const normalizedUrl = decodeURIComponent(formUrl);
        const encodedUrl = encodeURIComponent(normalizedUrl);
        
        console.log(`Fetching form with normalized URL: ${normalizedUrl}, encoded as: ${encodedUrl}`);
        
        // Try to load the form
        const formData = await getFormByUrl(encodedUrl);
        console.log("Form data loaded:", formData);
        
        if (!formData || Object.keys(formData).length === 0) {
          console.error("Form data is empty or null");
          setError('Form not found or no longer available.');
          setLoading(false);
          return;
        }
        
        if (formData.status === 'closed') {
          setError('This form is no longer accepting responses.');
          setLoading(false);
          return;
        }
        
        if (formData.status === 'scheduled' && new Date(formData.publishDate) > new Date()) {
          setError('This form is not yet open for responses.');
          setLoading(false);
          return;
        }
        
        // Initialize form values
        const initialValues = {};
        if (formData.pages && Array.isArray(formData.pages)) {
          formData.pages.forEach(page => {
            if (page.fields && Array.isArray(page.fields)) {
              page.fields.forEach(field => {
                initialValues[field._id] = getInitialValueForField(field);
              });
            }
          });
        }
        
        setForm(formData);
        setFormValues(initialValues);
        
        // Check if password protected - notice we're checking both possible property names
        const isPasswordProtected = 
          (formData.passwordProtected && formData.passwordProtected === true) ||
          (formData.accessCode && formData.accessCode.enabled === true);
        
        console.log("Is form password protected:", isPasswordProtected);
        
        if (isPasswordProtected) {
          console.log("Form is password protected");
          setPasswordDialog(true);
          setAuthenticated(false);
        } else {
          console.log("Form is not password protected, setting authenticated to true");
          setAuthenticated(true);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error loading form:", err);
        setError('Form not found or no longer available. Please check the URL and try again.');
        setLoading(false);
      }
    };
    
    if (formUrl) {
      loadForm();
    } else {
      setError('Invalid form URL. Please check the link and try again.');
      setLoading(false);
    }
  }, [formUrl]);
  
  // Check for existing submission
  useEffect(() => {
    if (form?.settings?.preventDuplicateSubmissions) {
      const hasSubmitted = Cookies.get(`form_submitted_${form._id}`);
      if (hasSubmitted === 'true') {
        setError('You have already submitted this form. Multiple submissions are not allowed.');
      }
    }
  }, [form]);
  
  // Get initial value based on field type
  const getInitialValueForField = (field) => {
    switch (field.type) {
      case 'checkbox':
        return [];
      case 'rating':
        return 0;
      case 'number':
        return '';
      default:
        return '';
    }
  };
  
  // Handle form value changes
  const handleValueChange = (fieldId, value) => {
    setFormValues({
      ...formValues,
      [fieldId]: value
    });
    
    // Clear error for this field if it exists
    if (errors[fieldId]) {
      const newErrors = { ...errors };
      delete newErrors[fieldId];
      setErrors(newErrors);
    }
  };
  
  // Handle checkbox changes (multiple values)
  const handleCheckboxChange = (fieldId, option, checked) => {
    const currentValues = [...(formValues[fieldId] || [])];
    
    if (checked) {
      if (!currentValues.includes(option)) {
        currentValues.push(option);
      }
    } else {
      const index = currentValues.indexOf(option);
      if (index !== -1) {
        currentValues.splice(index, 1);
      }
    }
    
    handleValueChange(fieldId, currentValues);
  };
  
  // Validate the current page
  const validatePage = () => {
    const currentPage = form.pages[activeStep];
    const newErrors = {};
    let isValid = true;
    
    // Validate email if collection is enabled and we're on the first page
    if (form.settings.collectEmail && activeStep === 0 && !email.trim()) {
      newErrors.email = 'Email address is required';
      isValid = false;
    } else if (form.settings.collectEmail && activeStep === 0 && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Please enter a valid email address';
        isValid = false;
      }
    }
    
    currentPage.fields.forEach(field => {
      // Skip validation for conditional fields that aren't shown
      if (isFieldHidden(field)) {
        return;
      }
      
      if (field.required) {
        const value = formValues[field._id];
        let fieldIsValid = true;
        
        if (value === undefined || value === null || value === '') {
          fieldIsValid = false;
        } else if (Array.isArray(value) && value.length === 0) {
          fieldIsValid = false;
        }
        
        if (!fieldIsValid) {
          newErrors[field._id] = 'This field is required';
          isValid = false;
        }
      }
      
      // Type-specific validation
      if (field.type === 'email' && formValues[field._id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formValues[field._id])) {
          newErrors[field._id] = 'Please enter a valid email address';
          isValid = false;
        }
      }
      
      if (field.type === 'number' && formValues[field._id] !== '') {
        const num = Number(formValues[field._id]);
        if (isNaN(num)) {
          newErrors[field._id] = 'Please enter a valid number';
          isValid = false;
        } else if (field.min !== undefined && num < field.min) {
          newErrors[field._id] = `Value must be at least ${field.min}`;
          isValid = false;
        } else if (field.max !== undefined && num > field.max) {
          newErrors[field._id] = `Value must be at most ${field.max}`;
          isValid = false;
        }
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Check if a field should be hidden based on conditionals
  const isFieldHidden = (field) => {
    if (!field.conditional || !field.conditional.isConditional) {
      return false;
    }
    
    if (!field.conditional.dependsOn && field.conditional.dependsOn !== 0) {
      return false;
    }
    
    // Find the dependent field by order property
    const dependentField = form.pages
      .flatMap(page => page.fields)
      .find(f => f.order === parseInt(field.conditional.dependsOn));
    
    if (!dependentField) {
      console.log("Dependent field not found for condition:", field.conditional);
      return false;
    }
    
    const dependentValue = formValues[dependentField._id];
    
    switch (field.conditional.condition) {
      case 'equals':
        return String(dependentValue) !== String(field.conditional.value);
      case 'not_equals':
        return String(dependentValue) === String(field.conditional.value);
      case 'contains':
        return !String(dependentValue).includes(field.conditional.value);
      case 'not_contains':
        return String(dependentValue).includes(field.conditional.value);
      case 'greater_than':
        return Number(dependentValue) <= Number(field.conditional.value);
      case 'less_than':
        return Number(dependentValue) >= Number(field.conditional.value);
      case 'is_empty':
        return dependentValue !== undefined && dependentValue !== null && dependentValue !== '';
      case 'is_not_empty':
        return dependentValue === undefined || dependentValue === null || dependentValue === '';
      default:
        return false;
    }
  };
  
  // Handle moving to the next page
  const handleNext = () => {
    if (validatePage()) {
      if (activeStep === form.pages.length - 1) {
        handleSubmit();
      } else {
        setActiveStep(activeStep + 1);
      }
    }
  };
  
  // Handle moving to the previous page
  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validatePage()) {
      return;
    }
    
    if (form.settings?.preventDuplicateSubmissions) {
      const hasSubmitted = Cookies.get(`form_submitted_${form._id}`);
      if (hasSubmitted === 'true') {
        setError('You have already submitted this form. Multiple submissions are not allowed.');
        return;
      }
    }
    
    setSubmitting(true);
    
    try {
      // Build responses array
      const answers = [];
      
      form.pages.forEach(page => {
        page.fields.forEach(field => {
          // Skip hidden fields
          if (isFieldHidden(field)) {
            return;
          }
          
          // For required fields with no value, add an empty value to ensure they're included
          if (field.required && (formValues[field._id] === undefined || formValues[field._id] === null || formValues[field._id] === '')) {
            setError(`Please complete all required fields before submitting.`);
            setSubmitting(false);
            return;
          }
          
          // Add all fields that have a value or are required
          if (formValues[field._id] !== undefined && formValues[field._id] !== null) {
            answers.push({
              fieldId: field._id,
              fieldLabel: field.label || 'Untitled Field',
              fieldType: field.type || 'text',
              value: formValues[field._id]
            });
          }
        });
      });
      
      // Check if we have any answers
      if (answers.length === 0) {
        setError('Please complete at least one field before submitting.');
        setSubmitting(false);
        return;
      }
      
      const responseData = {
        formId: form._id,
        answers,
        respondentEmail: form.settings?.collectEmail ? email : undefined,
        startedAt: new Date().toISOString(),
        timeSpentMs: 0, // You could track this with a timer if needed
        status: 'complete'
      };
      
      console.log('Submitting form response:', responseData);
      
      try {
        // Submit the response
        const result = await submitResponse(responseData);
        console.log('Form submission successful:', result);
        
        // Set cookie to prevent duplicate submissions
        if (form.settings?.preventDuplicateSubmissions) {
          // Set cookie to expire in 30 days
          Cookies.set(`form_submitted_${form._id}`, 'true', { expires: 30 });
        }
        
        // Show success message before redirecting
        setError('');
        
        // Redirect to thank you page or custom URL
        if (form.settings?.redirectUrl) {
          window.location.href = form.settings.redirectUrl;
        } else {
          navigate('/thank-you', { state: { formTitle: form.title } });
        }
      } catch (submitError) {
        console.error('Form submission failed:', submitError);
        // More specific error message based on the response
        if (submitError.response) {
          if (submitError.response.status === 400) {
            setError(`Form submission error: ${submitError.responseData?.message || submitError.response.data?.message || 'Bad request'}`);
          } else if (submitError.response.status === 403) {
            setError('This form is not currently accepting responses.');
          } else if (submitError.response.status === 404) {
            setError('Form not found. It may have been deleted or unpublished.');
          } else {
            setError('Failed to submit form. The server might be unavailable or the form may no longer be accepting responses.');
          }
        } else if (submitError.responseData) {
          setError(submitError.responseData.message || 'Error submitting form');
        } else {
          setError('Network error. Please check your connection and try again.');
        }
        setSubmitting(false);
      }
    } catch (err) {
      console.error('Error preparing form submission:', err);
      setError('Failed to prepare form submission. Please check your answers and try again.');
      setSubmitting(false);
    }
  };
  
  // Handle password verification
  const handleVerifyPassword = async () => {
    if (!password) {
      setPasswordError('Please enter a password');
      return;
    }
    
    try {
      console.log("Verifying password for form:", form._id);
      
      // Check if the form uses the old or new password protection mechanism
      let verified = false;
      
      if (form.accessCode && form.accessCode.enabled) {
        // New mechanism - check against accessCode.code directly
        verified = password === form.accessCode.code;
        console.log("Using accessCode mechanism, verified:", verified);
      } else {
        // Old mechanism - call API
        const response = await verifyFormPassword(form._id, password);
        console.log("Password verification response:", response);
        verified = response && response.verified;
      }
      
      if (verified) {
        setAuthenticated(true);
        setPasswordDialog(false);
        setPasswordError('');
      } else {
        setPasswordError('Incorrect password');
      }
    } catch (err) {
      console.error("Error verifying password:", err);
      setPasswordError('Error verifying password. Please try again.');
    }
  };
  
  // Render a form field based on its type
  const renderField = (field) => {
    // Skip rendering if field is hidden
    if (isFieldHidden(field)) {
      return null;
    }
    
    const fieldValue = formValues[field._id];
    const fieldError = errors[field._id];
    
    switch (field.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            label={field.label}
            placeholder={field.placeholder || ''}
            value={fieldValue}
            onChange={(e) => handleValueChange(field._id, e.target.value)}
            margin="normal"
            error={!!fieldError}
            helperText={fieldError || field.helpText}
            required={field.required}
          />
        );
        
      case 'email':
        return (
          <TextField
            fullWidth
            label={field.label}
            placeholder={field.placeholder || 'Email address'}
            value={fieldValue}
            onChange={(e) => handleValueChange(field._id, e.target.value)}
            margin="normal"
            error={!!fieldError}
            helperText={fieldError || field.helpText}
            required={field.required}
            type="email"
            InputProps={{
              startAdornment: <EmailIcon fontSize="small" sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.54)' }} />
            }}
          />
        );
        
      case 'number':
        return (
          <TextField
            fullWidth
            label={field.label}
            placeholder={field.placeholder || '0'}
            value={fieldValue}
            onChange={(e) => handleValueChange(field._id, e.target.value)}
            margin="normal"
            error={!!fieldError}
            helperText={fieldError || field.helpText}
            required={field.required}
            type="number"
            inputProps={{
              min: field.min,
              max: field.max,
              step: field.step || 1
            }}
          />
        );
        
      case 'dropdown':
        return (
          <FormControl fullWidth margin="normal" error={!!fieldError} required={field.required}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={fieldValue}
              onChange={(e) => handleValueChange(field._id, e.target.value)}
              label={field.label}
            >
              {field.options.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {(fieldError || field.helpText) && (
              <Typography 
                variant="caption" 
                color={fieldError ? 'error' : 'textSecondary'} 
                sx={{ mt: 0.5 }}
              >
                {fieldError || field.helpText}
              </Typography>
            )}
          </FormControl>
        );
        
      case 'checkbox':
        return (
          <FormControl 
            component="fieldset" 
            margin="normal" 
            error={!!fieldError}
            required={field.required}
          >
            <FormLabel component="legend">{field.label}</FormLabel>
            {field.options.map((option, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    checked={Array.isArray(fieldValue) && fieldValue.includes(option)}
                    onChange={(e) => handleCheckboxChange(field._id, option, e.target.checked)}
                  />
                }
                label={option}
              />
            ))}
            {(fieldError || field.helpText) && (
              <Typography 
                variant="caption" 
                color={fieldError ? 'error' : 'textSecondary'} 
                sx={{ mt: 0.5 }}
              >
                {fieldError || field.helpText}
              </Typography>
            )}
          </FormControl>
        );
        
      case 'radio':
        return (
          <FormControl component="fieldset" margin="normal" error={!!fieldError} required={field.required}>
            <FormLabel component="legend">{field.label}</FormLabel>
            <RadioGroup
              value={fieldValue}
              onChange={(e) => handleValueChange(field._id, e.target.value)}
            >
              {field.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
            {(fieldError || field.helpText) && (
              <Typography 
                variant="caption" 
                color={fieldError ? 'error' : 'textSecondary'} 
                sx={{ mt: 0.5 }}
              >
                {fieldError || field.helpText}
              </Typography>
            )}
          </FormControl>
        );
        
      case 'rating':
        return (
          <Box mt={2} mb={2}>
            <Typography component="legend" gutterBottom>
              {field.label}
              {field.required && <span style={{ color: 'red' }}> *</span>}
            </Typography>
            <Rating
              name={`rating-${field._id}`}
              value={Number(fieldValue)}
              onChange={(e, newValue) => handleValueChange(field._id, newValue)}
              max={field.max || 5}
            />
            {(fieldError || field.helpText) && (
              <Typography 
                variant="caption" 
                color={fieldError ? 'error' : 'textSecondary'} 
                display="block" 
                sx={{ mt: 0.5 }}
              >
                {fieldError || field.helpText}
              </Typography>
            )}
          </Box>
        );
        
      default:
        return <Typography color="error">Unknown field type: {field.type}</Typography>;
    }
  };
  
  // Render the current page content
  const renderPageContent = () => {
    if (!form || activeStep >= form.pages.length) {
      return null;
    }
    
    const currentPage = form.pages[activeStep];
    
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          {currentPage.title}
        </Typography>
        
        {currentPage.description && (
          <Typography variant="body1" color="textSecondary" paragraph>
            {currentPage.description}
          </Typography>
        )}
        
        <Divider sx={{ mb: 2 }} />
        
        {/* Email collection if enabled and first page */}
        {form.settings.collectEmail && activeStep === 0 && (
          <Box mb={2}>
            <TextField
              fullWidth
              label="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              margin="normal"
              error={!!errors.email}
              helperText={errors.email || ""}
              InputProps={{
                startAdornment: <EmailIcon fontSize="small" sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.54)' }} />
              }}
            />
          </Box>
        )}
        
        {/* Form fields */}
        {currentPage.fields.map((field, index) => (
          <Box key={field._id} mb={2}>
            {renderField(field)}
          </Box>
        ))}
      </Box>
    );
  };
  
  // Render the main form content
  if (loading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>Loading form...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box py={4} textAlign="center">
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          <Button 
            variant="contained"
            onClick={() => navigate('/')}
          >
            Return to Home
          </Button>
        </Box>
      </Container>
    );
  }

  if (!form) {
    return (
      <Container maxWidth="md">
        <Box py={4} textAlign="center">
          <Alert severity="error">Form not found.</Alert>
          <Button 
            variant="contained"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Return to Home
          </Button>
        </Box>
      </Container>
    );
  }

  if (!authenticated) {
    return (
      <>
        <Dialog open={passwordDialog} onClose={() => navigate('/')}>
          <DialogTitle>
            <Box display="flex" alignItems="center">
              <LockIcon sx={{ mr: 1 }} />
              Password Protected Form
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" paragraph>
              This form requires a password to access. Please enter the password to continue.
            </Typography>
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!passwordError}
              helperText={passwordError}
              margin="normal"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleVerifyPassword();
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => navigate('/')}>Cancel</Button>
            <Button 
              onClick={handleVerifyPassword}
              variant="contained" 
              color="primary"
              disabled={!password}
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>

        <Container maxWidth="md">
          <Box py={4} textAlign="center">
            <Typography variant="h4" component="h1" gutterBottom>
              Password Protected Form
            </Typography>
            <Typography variant="body1" paragraph>
              Please enter the form password to view and submit responses.
            </Typography>
          </Box>
        </Container>
      </>
    );
  }
  
  return (
    <Container maxWidth="md">
      <Box py={4}>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h4" component="h1" gutterBottom>
              {form.title}
            </Typography>
            
            {form.description && (
              <Typography variant="body1" color="textSecondary" paragraph>
                {form.description}
              </Typography>
            )}
          </CardContent>
        </Card>
        
        {/* Progress bar */}
        {form.settings.showProgressBar && form.pages.length > 1 && (
          <Box mb={4}>
            {form.settings.progressBarStyle === 'default' && (
              <LinearProgress 
                variant="determinate" 
                value={((activeStep + 1) / form.pages.length) * 100} 
              />
            )}
            
            {form.settings.progressBarStyle === 'numbered' && (
              <Stepper activeStep={activeStep} alternativeLabel>
                {form.pages.map((page, index) => (
                  <Step key={index}>
                    <StepLabel>{page.title}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            )}
            
            {form.settings.progressBarStyle === 'percentage' && (
              <Box display="flex" justifyContent="center" alignItems="center">
                <Typography variant="body2">
                  {Math.round(((activeStep + 1) / form.pages.length) * 100)}% Complete
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={((activeStep + 1) / form.pages.length) * 100}
                  sx={{ mx: 2, flexGrow: 1 }}
                />
                <Typography variant="body2">
                  Page {activeStep + 1} of {form.pages.length}
                </Typography>
              </Box>
            )}
          </Box>
        )}
        
        <Paper elevation={1} sx={{ p: 3 }}>
          {renderPageContent()}
          
          {form.settings && form.settings.preventDuplicateSubmissions && activeStep === form.pages.length - 1 && (
            <Box mt={2} p={1} bgcolor="#f5f5f5" borderRadius={1}>
              <Typography variant="caption" color="textSecondary">
                Note: Multiple submissions from the same device are not allowed.
              </Typography>
            </Box>
          )}
          
          <Box display="flex" justifyContent="space-between" mt={4}>
            <Button
              variant="outlined"
              onClick={handleBack}
              startIcon={<PrevIcon />}
              disabled={activeStep === 0}
            >
              Previous
            </Button>
            
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={activeStep === form.pages.length - 1 ? <CheckIcon /> : <NextIcon />}
              disabled={submitting}
            >
              {submitting ? (
                <CircularProgress size={24} />
              ) : activeStep === form.pages.length - 1 ? (
                form.settings.submitButtonText || 'Submit'
              ) : (
                'Next'
              )}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default PublicForm; 
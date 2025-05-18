import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  TextField,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Select,
  Rating,
  InputLabel,
  MenuItem,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { getFormById } from '../api/forms';

const FormPreview = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  
  // Load the form data
  useEffect(() => {
    const loadForm = async () => {
      try {
        const formData = await getFormById(formId);
        setForm(formData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load form. Please try again.');
        setLoading(false);
      }
    };
    
    loadForm();
  }, [formId]);
  
  // Handle page navigation
  const handleNextPage = () => {
    if (activeStep < form.pages.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !form) {
    return (
      <Container maxWidth="md">
        <Box py={4}>
          <Alert severity="error">{error || 'Form not found'}</Alert>
          <Button 
            component={Link} 
            to="/dashboard" 
            variant="contained"
            sx={{ mt: 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md">
      <Box py={4}>
        <Box mb={4} display="flex" alignItems="center" justifyContent="space-between">
          <Button 
            component={Link} 
            to={`/forms/${formId}/edit`}
            startIcon={<ArrowBackIcon />}
          >
            Back to Editor
          </Button>
          <Typography variant="h6" color="textSecondary">Preview Mode</Typography>
        </Box>
        
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>{form.title}</Typography>
          {form.description && (
            <Typography variant="body1" color="textSecondary" paragraph>
              {form.description}
            </Typography>
          )}
        </Paper>
        
        {form.pages.length > 1 && form.settings && form.settings.showProgressBar && (
          <Box mb={3}>
            {form.settings.progressBarStyle === 'default' && (
              <Box sx={{ width: '100%', bgcolor: '#eee', borderRadius: 1, height: 10, mb: 2 }}>
                <Box 
                  sx={{ 
                    width: `${((activeStep + 1) / form.pages.length) * 100}%`,
                    bgcolor: 'primary.main',
                    height: '100%',
                    borderRadius: 1
                  }}
                />
              </Box>
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
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2">
                  {Math.round(((activeStep + 1) / form.pages.length) * 100)}% Complete
                </Typography>
                <Typography variant="body2">
                  Page {activeStep + 1} of {form.pages.length}
                </Typography>
              </Box>
            )}
          </Box>
        )}
        
        <Paper elevation={1} sx={{ p: 3 }}>
          {form.pages.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                {form.pages[activeStep].title}
              </Typography>
              
              {form.pages[activeStep].description && (
                <Typography variant="body2" color="textSecondary" paragraph>
                  {form.pages[activeStep].description}
                </Typography>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              {activeStep === 0 && form.settings && form.settings.collectEmail && (
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  placeholder="Your email address"
                  margin="normal"
                  required
                  disabled
                />
              )}
              
              {form.pages[activeStep].fields.map((field, index) => (
                <Box key={index} my={3}>
                  {field.type === 'text' && (
                    <TextField
                      fullWidth
                      label={field.label}
                      placeholder={field.placeholder}
                      helperText={field.helpText}
                      required={field.required}
                      disabled
                    />
                  )}
                  
                  {field.type === 'email' && (
                    <TextField
                      fullWidth
                      label={field.label}
                      type="email"
                      placeholder={field.placeholder || "Email address"}
                      helperText={field.helpText}
                      required={field.required}
                      disabled
                    />
                  )}
                  
                  {field.type === 'number' && (
                    <TextField
                      fullWidth
                      label={field.label}
                      type="number"
                      placeholder={field.placeholder}
                      helperText={field.helpText}
                      required={field.required}
                      inputProps={{
                        min: field.min,
                        max: field.max,
                        step: field.step
                      }}
                      disabled
                    />
                  )}
                  
                  {field.type === 'dropdown' && (
                    <FormControl fullWidth required={field.required} disabled>
                      <InputLabel>{field.label}</InputLabel>
                      <Select label={field.label} value="">
                        {field.options && field.options.map((option, i) => (
                          <MenuItem key={i} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                      {field.helpText && (
                        <Typography variant="caption" color="textSecondary">
                          {field.helpText}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                  
                  {field.type === 'checkbox' && (
                    <FormControl required={field.required} component="fieldset">
                      <FormLabel component="legend">{field.label}</FormLabel>
                      {field.options && field.options.map((option, i) => (
                        <FormControlLabel
                          key={i}
                          control={<Checkbox disabled />}
                          label={option}
                        />
                      ))}
                      {field.helpText && (
                        <Typography variant="caption" color="textSecondary">
                          {field.helpText}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                  
                  {field.type === 'radio' && (
                    <FormControl required={field.required} component="fieldset">
                      <FormLabel component="legend">{field.label}</FormLabel>
                      <RadioGroup>
                        {field.options && field.options.map((option, i) => (
                          <FormControlLabel
                            key={i}
                            value={option}
                            control={<Radio disabled />}
                            label={option}
                          />
                        ))}
                      </RadioGroup>
                      {field.helpText && (
                        <Typography variant="caption" color="textSecondary">
                          {field.helpText}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                  
                  {field.type === 'rating' && (
                    <Box>
                      <Typography component="legend">
                        {field.label}
                        {field.required && <span style={{ color: 'red' }}> *</span>}
                      </Typography>
                      <Rating max={field.max || 5} readOnly />
                      {field.helpText && (
                        <Typography variant="caption" color="textSecondary" display="block">
                          {field.helpText}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              ))}
              
              <Box mt={4} display="flex" justifyContent="space-between">
                <Button 
                  variant="outlined" 
                  onClick={handlePrevPage} 
                  disabled={activeStep === 0}
                >
                  Previous
                </Button>
                
                {activeStep < form.pages.length - 1 ? (
                  <Button 
                    variant="contained" 
                    onClick={handleNextPage}
                  >
                    Next
                  </Button>
                ) : (
                  <Button variant="contained" color="primary" disabled>
                    {form.settings && form.settings.submitButtonText ? form.settings.submitButtonText : 'Submit'}
                  </Button>
                )}
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default FormPreview; 
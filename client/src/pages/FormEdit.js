import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Paper,
  Radio,
  RadioGroup,
  Checkbox,
  Rating,
  Select,
  FormControl,
  InputLabel,
  FormLabel,
  MenuItem,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Save as SaveIcon,
  Publish as PublishIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  Link as LinkIcon,
  ContentCopy as CopyIcon,
  LockOutlined as LockIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

// Import components
import FormBuilder from './FormBuilder';
import { getFormById, updateForm, publishForm, closeForm } from '../api/forms';
import DateTimePicker from '../components/DateTimePicker';

const FormEdit = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [publishDate, setPublishDate] = useState(new Date());
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [formPassword, setFormPassword] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  // Load form data
  useEffect(() => {
    const loadForm = async () => {
      try {
        const formData = await getFormById(formId);
        console.log("Loaded form data:", formData);
        
        // Check if we have saved form data in session storage (from FormBuilder)
        const savedFormData = sessionStorage.getItem('lastSavedForm');
        if (savedFormData) {
          const parsedForm = JSON.parse(savedFormData);
          console.log("Found saved form data in session storage:", parsedForm);
          setForm(parsedForm);
          // Clear session storage after using it
          sessionStorage.removeItem('lastSavedForm');
        } else {
          setForm(formData);
        }
        
        setLoading(false);
        
        // Set password state from form data
        setPasswordEnabled(formData.accessCode && !!formData.accessCode.enabled);
        setFormPassword((formData.accessCode && formData.accessCode.code) || '');
        
        // Generate absolute share URL
        const baseUrl = window.location.origin;
        const formUrl = formData.uniqueUrl || formData._id;
        // Create a fully qualified URL that works on all devices
        const encodedFormUrl = encodeURIComponent(formUrl);
        setShareUrl(`${baseUrl}/forms/${encodedFormUrl}/respond`);
        console.log("Generated share URL:", `${baseUrl}/forms/${encodedFormUrl}/respond`, 
                    "from original formUrl:", formUrl);
      } catch (err) {
        console.error("Error loading form:", err);
        setError('Failed to load form. Please try again.');
        setLoading(false);
      }
    };
    
    loadForm();
  }, [formId]);

  // Handle form updates
  const handleFormUpdate = (updatedForm) => {
    console.log("Form updated:", updatedForm);
    setForm(updatedForm);
  };

  // Save form changes
  const handleSaveForm = async () => {
    setSaving(true);
    setError('');
    
    try {
      // Create a deep copy to ensure all fields and nested properties are included
      const formToSave = JSON.parse(JSON.stringify(form));
      
      // Include password protection in form data
      formToSave.accessCode = {
        enabled: passwordEnabled,
        code: passwordEnabled ? formPassword : null
      };
      
      // Ensure all pages and fields have proper IDs and are structured correctly
      if (formToSave.pages) {
        formToSave.pages = formToSave.pages.map((page, pageIndex) => {
          // Ensure page has order property
          page.order = pageIndex;
          
          // Ensure fields are properly structured
          if (page.fields) {
            page.fields = page.fields.map((field, fieldIndex) => {
              // Ensure field has order property
              field.order = fieldIndex;
              return field;
            });
          }
          
          return page;
        });
      }
      
      console.log("Saving form with structured data:", formToSave);
      const updatedForm = await updateForm(formId, formToSave);
      console.log("Form saved successfully:", updatedForm);
      setForm(updatedForm);
      setSaving(false);
    } catch (err) {
      console.error("Error saving form:", err);
      setError('Failed to save form. Please try again.');
      setSaving(false);
    }
  };

  // Publish form
  const handlePublishForm = async () => {
    setPublishDialogOpen(false);
    setSaving(true);
    
    try {
      const updatedForm = await publishForm(formId, {
        passwordProtected: passwordEnabled,
        password: passwordEnabled ? formPassword : null
      });
      setForm(updatedForm);
      setSaving(false);
    } catch (err) {
      setError('Failed to publish form. Please try again.');
      setSaving(false);
    }
  };

  // Schedule form
  const handleScheduleForm = async () => {
    setScheduleDialogOpen(false);
    setSaving(true);
    
    try {
      const updatedForm = await updateForm(formId, {
        ...form,
        status: 'scheduled',
        publishDate,
        accessCode: {
          enabled: passwordEnabled,
          code: passwordEnabled ? formPassword : null
        }
      });
      setForm(updatedForm);
      setSaving(false);
    } catch (err) {
      setError('Failed to schedule form. Please try again.');
      setSaving(false);
    }
  };

  // Close form
  const handleCloseForm = async () => {
    setSaving(true);
    
    try {
      const updatedForm = await closeForm(formId);
      setForm(updatedForm);
      setSaving(false);
    } catch (err) {
      setError('Failed to close form. Please try again.');
      setSaving(false);
    }
  };

  // Copy share URL to clipboard
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedToClipboard(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedToClipboard(false);
      }, 2000);
    });
  };

  // Save access control settings
  const handleSaveAccessSettings = () => {
    // Update the form with password protection
    const updatedForm = {
      ...form,
      accessCode: {
        enabled: passwordEnabled,
        code: passwordEnabled ? formPassword : null
      }
    };
    
    setForm(updatedForm);
    setAccessDialogOpen(false);
    
    // Save changes
    handleSaveForm();
  };

  // Handle form preview
  const handlePreview = () => {
    setPreviewOpen(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Alert severity="error">{error}</Alert>
          <Button 
            variant="contained" 
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  if (!form) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Alert severity="error">Form not found.</Alert>
          <Button 
            variant="contained" 
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  // TODO: Extract these status chips to a component for reuse
  const renderStatusChip = () => {
    switch (form.status) {
      case 'draft':
        return <Typography color="textSecondary">(Draft)</Typography>;
      case 'published':
        return <Typography color="success.main">(Published)</Typography>;
      case 'closed':
        return <Typography color="error.main">(Closed)</Typography>;
      case 'scheduled':
        return (
          <Typography color="warning.main">
            (Scheduled for {new Date(form.publishDate).toLocaleString()})
          </Typography>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Container maxWidth="lg">
        <Box py={2} display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <Typography variant="h4" component="h1" sx={{ mr: 2 }}>
              Edit Form
            </Typography>
            {renderStatusChip()}
          </Box>
          
          <Box>
            {form.status === 'draft' && (
              <>
                <Button 
                  variant="outlined" 
                  startIcon={<PublishIcon />} 
                  onClick={() => setPublishDialogOpen(true)}
                  sx={{ mr: 1 }}
                >
                  Publish
                </Button>
                
                <Button 
                  variant="outlined" 
                  startIcon={<ScheduleIcon />} 
                  onClick={() => setScheduleDialogOpen(true)}
                  sx={{ mr: 1 }}
                >
                  Schedule
                </Button>
              </>
            )}
            
            {form.status === 'published' && (
              <Button 
                variant="outlined" 
                startIcon={<CloseIcon />} 
                onClick={handleCloseForm}
                sx={{ mr: 1 }}
                color="error"
              >
                Close Form
              </Button>
            )}
            
            <Button 
              variant="outlined" 
              startIcon={<LockIcon />} 
              onClick={() => setAccessDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              Access Control
            </Button>
            
            <Button 
              variant="outlined" 
              startIcon={<VisibilityIcon />} 
              onClick={handlePreview}
              sx={{ mr: 1 }}
            >
              Preview
            </Button>
            
            {form.status !== 'draft' && (
              <Button 
                variant="outlined" 
                startIcon={<LinkIcon />} 
                onClick={() => setShareDialogOpen(true)}
                sx={{ mr: 1 }}
              >
                Share
              </Button>
            )}
            
            <Button 
              variant="contained" 
              color="primary"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleSaveForm}
              disabled={saving}
            >
              Save
            </Button>
          </Box>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <FormBuilder 
          existingForm={form} 
          onFormUpdate={handleFormUpdate} 
          isEditMode={true}
        />
      </Container>
      
      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onClose={() => setPublishDialogOpen(false)}>
        <DialogTitle>Publish Form</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to publish this form? Once published, it will be available to collect responses.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handlePublishForm} 
            variant="contained" 
            color="primary"
          >
            Publish
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)}>
        <DialogTitle>Schedule Form</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Select when you want this form to be automatically published:
          </Typography>
          
          <DateTimePicker
            label="Publish Date & Time"
            value={publishDate}
            onChange={(newValue) => setPublishDate(newValue)}
            minDateTime={new Date()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleScheduleForm} 
            variant="contained" 
            color="primary"
          >
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Access Control Dialog */}
      <Dialog open={accessDialogOpen} onClose={() => setAccessDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Access Control Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="h6" gutterBottom>Password Protection</Typography>
            
            <FormControlLabel
              control={
                <Switch 
                  checked={passwordEnabled}
                  onChange={(e) => setPasswordEnabled(e.target.checked)} 
                />
              }
              label="Require password to access form"
            />
            
            {passwordEnabled && (
              <TextField
                label="Form Password"
                type="password"
                fullWidth
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                margin="normal"
                helperText="Users will need to enter this password to access your form"
              />
            )}
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Note: Access control settings apply to all form states (published, scheduled, etc.)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAccessDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveAccessSettings}
            variant="contained" 
            color="primary"
            disabled={passwordEnabled && !formPassword}
          >
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share Form</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Use this link to share your form:
          </Typography>
          
          <Box display="flex" alignItems="center">
            <TextField
              fullWidth
              value={shareUrl}
              variant="outlined"
              InputProps={{
                readOnly: true,
              }}
              sx={{ mr: 1 }}
            />
            
            <Button 
              variant="contained" 
              color={copiedToClipboard ? "success" : "primary"}
              startIcon={<CopyIcon />}
              onClick={handleCopyUrl}
            >
              {copiedToClipboard ? "Copied!" : "Copy"}
            </Button>
          </Box>
          
          <Box mt={2}>
            <Typography variant="body2" color="textSecondary">
              Share this URL to allow users to access and submit responses to your form.
              <br />
              The link works on any device including mobile phones.
              {form.accessCode && form.accessCode.enabled && (
                <><br /><strong>Note: Password protection is enabled.</strong></>
              )}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Preview Dialog */}
      <Dialog 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Form Preview</Typography>
            <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {form && (
            <Box p={2}>
              <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom>{form.title}</Typography>
                {form.description && (
                  <Typography variant="body1" color="textSecondary" paragraph>
                    {form.description}
                  </Typography>
                )}
              </Paper>

              {form.pages.length > 1 && form.settings && form.settings.showProgressBar && (
                <Stepper activeStep={0} alternativeLabel sx={{ mb: 4 }}>
                  {form.pages.map((page, index) => (
                    <Step key={index}>
                      <StepLabel>{page.title}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              )}

              <Paper elevation={1} sx={{ p: 3 }}>
                {form.pages.length > 0 && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      {form.pages[0].title}
                    </Typography>
                    
                    {form.pages[0].description && (
                      <Typography variant="body2" color="textSecondary" paragraph>
                        {form.pages[0].description}
                      </Typography>
                    )}
                    
                    <Divider sx={{ my: 2 }} />
                    
                    {form.settings && form.settings.collectEmail && (
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        placeholder="Your email address"
                        margin="normal"
                        required
                      />
                    )}

                    {form.pages[0].fields.map((field, index) => (
                      <Box key={index} my={3}>
                        {field.type === 'text' && (
                          <TextField
                            fullWidth
                            label={field.label}
                            placeholder={field.placeholder}
                            helperText={field.helpText}
                            required={field.required}
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
                          />
                        )}
                        
                        {field.type === 'dropdown' && (
                          <FormControl fullWidth required={field.required}>
                            <InputLabel>{field.label}</InputLabel>
                            <Select label={field.label}>
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
                                control={<Checkbox />}
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
                                  control={<Radio />}
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
                            <Rating max={field.max || 5} />
                            {field.helpText && (
                              <Typography variant="caption" color="textSecondary" display="block">
                                {field.helpText}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    ))}
                    
                    <Box mt={4} display="flex" justifyContent="flex-end">
                      <Button variant="contained" color="primary">
                        {form.settings && form.settings.submitButtonText ? form.settings.submitButtonText : 'Submit'}
                      </Button>
                    </Box>
                  </>
                )}
              </Paper>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FormEdit; 
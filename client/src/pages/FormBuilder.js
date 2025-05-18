import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  Rating,
  Select,
  FormControl,
  InputLabel,
  FormLabel,
  Chip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  PublishOutlined as PublishIcon,
  Link as LinkIcon,
  LockOutlined as LockIcon,
  ContentCopy as CopyIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Import components
import FieldSettings from '../components/FormBuilder/FieldSettings';
import TextField_Component from '../components/FormFields/TextField_Component';
import CheckboxField from '../components/FormFields/CheckboxField';
import RadioField from '../components/FormFields/RadioField';
import DropdownField from '../components/FormFields/DropdownField';
import NumberField from '../components/FormFields/NumberField';
import EmailField from '../components/FormFields/EmailField';
import RatingField from '../components/FormFields/RatingField';
import FormPageTabs from '../components/FormBuilder/FormPageTabs';
import FormSettings from '../components/FormBuilder/FormSettings';
import FormConditions from '../components/FormBuilder/FormConditions';

// Import API functions
import { createForm } from '../api/forms';

const fieldTypes = [
  { type: 'text', label: 'Text' },
  { type: 'email', label: 'Email' },
  { type: 'number', label: 'Number' },
  { type: 'dropdown', label: 'Dropdown' },
  { type: 'checkbox', label: 'Checkbox' },
  { type: 'radio', label: 'Radio' },
  { type: 'rating', label: 'Rating (1-5)' }
];

const emptyPage = {
  title: 'Page 1',
  description: '',
  order: 0,
  fields: []
};

const FormBuilder = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pages: [emptyPage],
    status: 'draft',
    settings: {
      collectEmail: false,
      preventDuplicateSubmissions: true,
      showProgressBar: true,
      progressBarStyle: 'default',
      allowSavingDrafts: false,
      redirectUrl: '',
      submitButtonText: 'Submit',
      webhookUrl: ''
    }
  });
  
  const [currentTab, setCurrentTab] = useState(0);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState(null);
  const [fieldTypeMenuAnchor, setFieldTypeMenuAnchor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [conditionsOpen, setConditionsOpen] = useState(false);
  const [formId, setFormId] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  
  // New state variables
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [formPassword, setFormPassword] = useState('');
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [formSaved, setFormSaved] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle adding a new field
  const handleAddField = (fieldType) => {
    const newField = createEmptyField(fieldType, formData.pages[activePageIndex].fields.length);
    const updatedPages = [...formData.pages];
    updatedPages[activePageIndex].fields.push(newField);
    
    setFormData({
      ...formData,
      pages: updatedPages
    });
    
    setFieldTypeMenuAnchor(null);
    setSelectedFieldIndex(updatedPages[activePageIndex].fields.length - 1);
  };

  // Create an empty field based on type
  const createEmptyField = (type, order) => {
    const baseField = {
      type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      placeholder: '',
      helpText: '',
      required: false,
      order,
      conditional: {
        isConditional: false,
        dependsOn: null,
        condition: 'equals',
        value: ''
      }
    };

    // Add specific properties based on field type
    switch (type) {
      case 'dropdown':
      case 'radio':
      case 'checkbox':
        return {
          ...baseField,
          options: ['Option 1', 'Option 2', 'Option 3']
        };
      case 'number':
        return {
          ...baseField,
          min: 0,
          max: 100,
          step: 1
        };
      case 'rating':
        return {
          ...baseField,
          max: 5
        };
      default:
        return baseField;
    }
  };

  // Handle field updates
  const handleFieldUpdate = (fieldIndex, updatedField) => {
    const updatedPages = [...formData.pages];
    updatedPages[activePageIndex].fields[fieldIndex] = updatedField;
    
    setFormData({
      ...formData,
      pages: updatedPages
    });
  };

  // Handle field deletion
  const handleDeleteField = (fieldIndex) => {
    const updatedPages = [...formData.pages];
    updatedPages[activePageIndex].fields.splice(fieldIndex, 1);
    
    // Update order for remaining fields
    updatedPages[activePageIndex].fields.forEach((field, idx) => {
      field.order = idx;
    });
    
    setFormData({
      ...formData,
      pages: updatedPages
    });
    
    setSelectedFieldIndex(null);
  };

  // Handle drag and drop reordering
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    
    if (sourceIndex === destIndex) return;
    
    const updatedPages = [...formData.pages];
    const [movedField] = updatedPages[activePageIndex].fields.splice(sourceIndex, 1);
    updatedPages[activePageIndex].fields.splice(destIndex, 0, movedField);
    
    // Update order for all fields
    updatedPages[activePageIndex].fields.forEach((field, idx) => {
      field.order = idx;
    });
    
    setFormData({
      ...formData,
      pages: updatedPages
    });
    
    // Update selected field index after drag
    if (selectedFieldIndex === sourceIndex) {
      setSelectedFieldIndex(destIndex);
    } else if (
      selectedFieldIndex > sourceIndex && 
      selectedFieldIndex <= destIndex
    ) {
      setSelectedFieldIndex(selectedFieldIndex - 1);
    } else if (
      selectedFieldIndex < sourceIndex && 
      selectedFieldIndex >= destIndex
    ) {
      setSelectedFieldIndex(selectedFieldIndex + 1);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Handle page change
  const handlePageChange = (pageIndex) => {
    setActivePageIndex(pageIndex);
    setSelectedFieldIndex(null);
  };

  // Add a new page
  const handleAddPage = () => {
    try {
      // Create the new page
      const newPage = {
        title: `Page ${formData.pages.length + 1}`,
        description: '',
        order: formData.pages.length,
        fields: []
      };
      
      // Create a new pages array with the new page added
      const updatedPages = [...formData.pages, newPage];
      
      // Update the form data with the new pages array
      setFormData(prevFormData => ({
        ...prevFormData,
        pages: updatedPages
      }));
      
      // Set the active page index to the new page index
      const newPageIndex = updatedPages.length - 1;
      setActivePageIndex(newPageIndex);
      
      // Reset the selected field index since we're changing pages
      setSelectedFieldIndex(null);
      
      console.log("Added new page:", newPage, "New active index:", newPageIndex);
    } catch (error) {
      console.error("Error adding page:", error);
      setError("Failed to add page. Please try again.");
    }
  };

  // Delete a page
  const handleDeletePage = (pageIndex) => {
    if (formData.pages.length <= 1) {
      return; // Don't delete the last page
    }
    
    const updatedPages = formData.pages.filter((_, index) => index !== pageIndex);
    
    // Update order for remaining pages
    updatedPages.forEach((page, idx) => {
      page.order = idx;
    });
    
    setFormData({
      ...formData,
      pages: updatedPages
    });
    
    // Update active page index if needed
    if (activePageIndex >= updatedPages.length) {
      setActivePageIndex(updatedPages.length - 1);
    } else if (activePageIndex === pageIndex) {
      setActivePageIndex(pageIndex > 0 ? pageIndex - 1 : 0);
    }
  };

  // Update page title or description
  const handlePageUpdate = (pageIndex, field, value) => {
    const updatedPages = [...formData.pages];
    updatedPages[pageIndex][field] = value;
    
    setFormData({
      ...formData,
      pages: updatedPages
    });
  };

  // Save the form
  const handleSaveForm = async (shouldPublish = false) => {
    if (!formData.title.trim()) {
      setError('Please add a form title');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Create a deep copy to ensure all nested properties are included
      const savedFormData = JSON.parse(JSON.stringify(formData));
      
      // Set status to published if requested
      if (shouldPublish) {
        savedFormData.status = 'published';
      }
      
      // Ensure all pages and fields have proper structure
      if (savedFormData.pages) {
        savedFormData.pages = savedFormData.pages.map((page, pageIndex) => {
          // Ensure page has order property
          page.order = pageIndex;
          
          // Ensure fields are properly structured
          if (page.fields) {
            page.fields = page.fields.map((field, fieldIndex) => {
              // Ensure field has order property
              field.order = fieldIndex;
              
              // Ensure field has all required properties based on type
              switch (field.type) {
                case 'dropdown':
                case 'radio':
                case 'checkbox':
                  field.options = field.options || ['Option 1', 'Option 2', 'Option 3'];
                  break;
                case 'number':
                  field.min = field.min !== undefined ? field.min : 0;
                  field.max = field.max !== undefined ? field.max : 100;
                  field.step = field.step || 1;
                  break;
                case 'rating':
                  field.max = field.max || 5;
                  break;
                default:
                  break;
              }
              
              // Make sure conditional logic is properly defined
              field.conditional = field.conditional || {
                isConditional: false,
                dependsOn: null,
                condition: 'equals',
                value: ''
              };
              
              return field;
            });
          }
          
          return page;
        });
      }
      
      console.log("Saving structured form data:", savedFormData);
      const response = await createForm(savedFormData);
      console.log("Form saved successfully:", response);
      
      // Update the current form data with the saved response
      setFormData(response);
      setSaving(false);
      
      // Set success message and auto-dismiss after 1 second
      setIsSuccess(true);
      setError(`Form ${shouldPublish ? 'published' : 'saved'} successfully!`);
      
      // Auto-dismiss the success message after 1 second
      const timer = setTimeout(() => {
        setError('');
        setIsSuccess(false);
      }, 1000);
      
      // Store the ID for later use
      if (response._id) {
        setFormId(response._id);
        sessionStorage.setItem('currentFormId', response._id);
        // Set up share URL if the form has been published
        if (response.status === 'published' || shouldPublish) {
          const baseUrl = window.location.origin;
          const formUrl = response.uniqueUrl || response._id;
          setShareUrl(`${baseUrl}/forms/${formUrl}/respond`);
        }
      }
      
      return () => clearTimeout(timer);
    } catch (err) {
      console.error("Error saving form:", err);
      setSaving(false);
      setError('Failed to save form. Please try again.');
    }
  };

  // Handle form preview
  const handlePreview = () => {
    setPreviewOpen(true);
  };

  // Render field based on type
  const renderField = (field, index, isDragging) => {
    const isSelected = selectedFieldIndex === index;
    const props = {
      field,
      isSelected,
      isDragging,
      onClick: () => setSelectedFieldIndex(index),
      onDelete: () => handleDeleteField(index)
    };

    switch (field.type) {
      case 'text':
        return <TextField_Component {...props} />;
      case 'email':
        return <EmailField {...props} />;
      case 'number':
        return <NumberField {...props} />;
      case 'dropdown':
        return <DropdownField {...props} />;
      case 'checkbox':
        return <CheckboxField {...props} />;
      case 'radio':
        return <RadioField {...props} />;
      case 'rating':
        return <RatingField {...props} />;
      default:
        return <div>Unknown field type: {field.type}</div>;
    }
  };

  // Toggle form settings dialog
  const toggleSettingsDialog = () => {
    setSettingsOpen(!settingsOpen);
  };

  // Toggle conditional logic dialog
  const toggleConditionsDialog = (e) => {
    // Prevent default behavior to avoid page navigation
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    console.log("Toggling conditions dialog. Current state:", conditionsOpen);
    setConditionsOpen(prevState => !prevState);
  };

  // Handle opening share dialog
  const handleOpenShareDialog = () => {
    if (!formId) {
      // Save the form first before sharing
      setError('Please save the form first before sharing');
      return;
    }
    
    // Generate share URL
    const baseUrl = window.location.origin;
    const formUrl = formData.uniqueUrl || formId;
    setShareUrl(`${baseUrl}/forms/${formUrl}/respond`);
    setShareDialogOpen(true);
  };

  // Handle copying share URL to clipboard
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedToClipboard(true);
      setTimeout(() => {
        setCopiedToClipboard(false);
      }, 2000);
    });
  };

  // Handle publishing form
  const handlePublishForm = () => {
    if (!formId) {
      // Save with publish = true
      handleSaveForm(true);
    } else {
      // Form already saved, update status to published
      const updatedFormData = {
        ...formData,
        status: 'published',
        accessCode: {
          enabled: passwordEnabled,
          code: passwordEnabled ? formPassword : null
        }
      };
      setFormData(updatedFormData);
      handleSaveForm(true);
    }
    setPublishDialogOpen(false);
  };

  // Handle access control settings
  const handleSaveAccessSettings = () => {
    // Update form data with password protection
    const updatedFormData = {
      ...formData,
      accessCode: {
        enabled: passwordEnabled,
        code: passwordEnabled ? formPassword : null
      }
    };
    setFormData(updatedFormData);
    setAccessDialogOpen(false);
    
    // Save the form if it's already been saved once
    if (formId) {
      handleSaveForm();
    } else {
      setIsSuccess(true);
      setError('Access control settings saved. Remember to save your form.');
      setTimeout(() => {
        setIsSuccess(false);
        setError('');
      }, 1000);
    }
  };

  // Update form settings
  const handleUpdateSettings = (updatedSettings) => {
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        ...updatedSettings
      }
    });
    setSettingsOpen(false);
  };

  // Update conditional logic
  const handleUpdateConditions = (fieldIndex, conditions) => {
    try {
      console.log("Updating conditions for field index:", fieldIndex, "with:", conditions);
      
      // Create a deep copy of the form data to avoid mutation issues
      const updatedPages = JSON.parse(JSON.stringify(formData.pages));
      
      // Ensure the conditions object has the correct structure
      const formattedConditions = {
        isConditional: conditions.isConditional,
        dependsOn: conditions.dependsOn,
        condition: conditions.condition || 'equals',
        value: conditions.value || ''
      };
      
      // Update the field's conditional logic
      if (updatedPages[activePageIndex] && 
          updatedPages[activePageIndex].fields && 
          updatedPages[activePageIndex].fields[fieldIndex]) {
        updatedPages[activePageIndex].fields[fieldIndex].conditional = formattedConditions;
        
        // Update the form data with the new pages
        setFormData(prevData => ({
          ...prevData,
          pages: updatedPages
        }));
        
        console.log("Conditions updated successfully");
      } else {
        console.error("Failed to update conditions: Invalid field index or page structure");
      }
      
      // Close the conditions dialog
      setConditionsOpen(false);
    } catch (error) {
      console.error("Error updating conditions:", error);
      setError("Failed to update conditions. Please try again.");
    }
  };

  return (
    <Container maxWidth="lg">
      <Box py={{ xs: 2, md: 3 }}>
        <Paper 
          elevation={1} 
          sx={{ 
            p: { xs: 2, md: 3 }, 
            mb: { xs: 2, md: 4 },
            borderRadius: 2,
            border: '1px solid #e0e0e0',
            backgroundColor: '#f9fafb'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            mb: 3
          }}>
            <TextField
              label="Form Title"
              variant="outlined"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <TextField
              label="Form Description"
              variant="outlined"
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            {/* Mobile action buttons layout */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 1.5,
              width: '100%'
            }}>
              <Button
                variant="outlined"
                startIcon={<VisibilityIcon />}
                onClick={handlePreview}
                fullWidth
                size="medium"
                sx={{ height: '42px' }}
              >
                Preview
              </Button>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={toggleSettingsDialog}
                fullWidth 
                size="medium"
                sx={{ height: '42px' }}
              >
                Settings
              </Button>
              <Button
                variant="outlined"
                startIcon={<LockIcon />}
                onClick={() => setAccessDialogOpen(true)}
                fullWidth
                size="medium"
                sx={{ height: '42px' }}
              >
                Access
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<PublishIcon />}
                onClick={() => setPublishDialogOpen(true)}
                fullWidth
                size="medium"
                sx={{ height: '42px' }}
              >
                Publish
              </Button>
              {formId && (
                <Button
                  variant="outlined"
                  startIcon={<LinkIcon />}
                  onClick={handleOpenShareDialog}
                  fullWidth
                  size="medium"
                  sx={{ height: '42px' }}
                >
                  Share
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                onClick={() => handleSaveForm()}
                disabled={saving}
                fullWidth
                size="medium"
                sx={{ 
                  height: '42px',
                  gridColumn: formId ? 'auto' : '1 / span 2'
                }}
              >
                Save
              </Button>
            </Box>
            
            {formId && (
              <Box mt={2} display="flex" alignItems="center">
                <Typography variant="body2" color="textSecondary" mr={2} sx={{ fontSize: '0.75rem' }}>
                  Form ID: {formId}
                </Typography>
                {formData.status && (
                  <Chip 
                    label={formData.status.charAt(0).toUpperCase() + formData.status.slice(1)} 
                    color={
                      formData.status === 'published' ? 'success' : 
                      formData.status === 'draft' ? 'default' : 'primary'
                    }
                    size="small"
                  />
                )}
              </Box>
            )}
            
            {error && (
              <Alert 
                severity={isSuccess ? "success" : "error"} 
                sx={{ mt: 2 }}
                action={isSuccess ? null : undefined}
                onClose={isSuccess ? null : () => setError('')}
              >
                {error}
              </Alert>
            )}
          </Box>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormPageTabs
              pages={formData.pages}
              activePageIndex={activePageIndex}
              onPageChange={handlePageChange}
              onPageUpdate={handlePageUpdate}
              onAddPage={handleAddPage}
              onDeletePage={handleDeletePage}
            />
          </Grid>

          {/* Form builder area - stack the fields and properties panel on mobile, side by side on larger screens */}
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: { xs: 1.5, md: 2 }, 
                minHeight: '500px',
                borderRadius: 2,
                border: '1px solid #e0e0e0',
                mb: { xs: 3, md: 0 }
              }}
              key={`page-content-${activePageIndex}`}
            >
              <Box 
                display="flex" 
                flexDirection={{ xs: 'column', sm: 'row' }} 
                justifyContent="space-between" 
                alignItems={{ xs: 'flex-start', sm: 'center' }} 
                mb={2}
              >
                <Typography variant="h6" sx={{ mb: { xs: 1, sm: 0 } }}>
                  {formData.pages[activePageIndex]?.title || `Page ${activePageIndex + 1}`}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={(e) => setFieldTypeMenuAnchor(e.currentTarget)}
                  fullWidth={isMobile}
                  size={isMobile ? "medium" : "medium"}
                  sx={{ 
                    width: { xs: '100%', sm: 'auto' },
                    height: '42px'
                  }}
                >
                  Add Field
                </Button>
                <Menu
                  anchorEl={fieldTypeMenuAnchor}
                  open={Boolean(fieldTypeMenuAnchor)}
                  onClose={() => setFieldTypeMenuAnchor(null)}
                  PaperProps={{
                    style: {
                      width: isMobile ? '80%' : 'auto',
                      maxWidth: '300px'
                    }
                  }}
                >
                  {fieldTypes.map((type) => (
                    <MenuItem 
                      key={type.type} 
                      onClick={() => handleAddField(type.type)}
                      sx={{ py: 1.5 }}
                    >
                      {type.label}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  {formData.pages[activePageIndex]?.description || ''}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {!formData.pages[activePageIndex] || formData.pages[activePageIndex].fields.length === 0 ? (
                <Box 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center" 
                  justifyContent="center" 
                  p={{ xs: 2, md: 4 }}
                  sx={{ 
                    height: '200px', 
                    border: '2px dashed #e0e0e0',
                    borderRadius: 2,
                    backgroundColor: '#f9f9f9'
                  }}
                >
                  <Typography variant="body1" color="textSecondary" gutterBottom sx={{ textAlign: 'center' }}>
                    No fields added yet
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={(e) => setFieldTypeMenuAnchor(e.currentTarget)}
                    size={isMobile ? "small" : "medium"}
                    sx={{ mt: 1 }}
                  >
                    Add Your First Field
                  </Button>
                </Box>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="form-fields">
                    {(provided) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {formData.pages[activePageIndex].fields.map((field, index) => (
                          <Draggable 
                            key={`field-${index}`} 
                            draggableId={`field-${index}`} 
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <Box
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                sx={{ mb: 2 }}
                              >
                                <Card 
                                  variant="outlined" 
                                  sx={{
                                    borderColor: selectedFieldIndex === index ? 'primary.main' : 'inherit',
                                    boxShadow: selectedFieldIndex === index ? '0 0 0 2px rgba(33,150,243,0.3)' : 'none',
                                    borderRadius: '8px'
                                  }}
                                >
                                  <CardContent sx={{ position: 'relative', p: { xs: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1.5, md: 2 } } }}>
                                    <Box
                                      {...provided.dragHandleProps}
                                      position="absolute"
                                      top="8px"
                                      left="8px"
                                      sx={{ cursor: 'move' }}
                                    >
                                      <DragIcon color="action" fontSize={isMobile ? "small" : "medium"} />
                                    </Box>
                                    <Box pl={4}>
                                      {renderField(field, index, snapshot.isDragging)}
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Box>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: { xs: 1.5, md: 2 }, 
                minHeight: { xs: 'auto', md: '500px' },
                borderRadius: 2,
                border: '1px solid #e0e0e0'
              }}
            >
              <Tabs 
                value={currentTab} 
                onChange={handleTabChange} 
                sx={{ mb: 2 }}
                variant={isMobile ? "fullWidth" : "standard"}
              >
                <Tab label="Properties" />
                <Tab label="Conditions" />
              </Tabs>

              {currentTab === 0 && selectedFieldIndex !== null && (
                <FieldSettings
                  field={formData.pages[activePageIndex].fields[selectedFieldIndex]}
                  onUpdate={(updatedField) => handleFieldUpdate(selectedFieldIndex, updatedField)}
                  onDelete={() => handleDeleteField(selectedFieldIndex)}
                />
              )}
              
              {currentTab === 0 && selectedFieldIndex === null && (
                <Box p={2} textAlign="center">
                  <Typography variant="body1" color="textSecondary">
                    Select a field to edit its properties
                  </Typography>
                </Box>
              )}

              {currentTab === 1 && selectedFieldIndex !== null && (
                <Box>
                  <Button
                    variant="outlined"
                    fullWidth
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleConditionsDialog(e);
                    }}
                  >
                    Configure Conditions
                  </Button>
                  
                  {formData.pages[activePageIndex].fields[selectedFieldIndex].conditional.isConditional && (
                    <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
                      <Typography variant="body2">
                        This field has conditional logic applied.
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
              
              {currentTab === 1 && selectedFieldIndex === null && (
                <Box p={2} textAlign="center">
                  <Typography variant="body1" color="textSecondary">
                    Select a field to configure its conditions
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Form Settings Dialog */}
      <Dialog 
        open={settingsOpen} 
        onClose={toggleSettingsDialog} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Form Settings</Typography>
            <IconButton edge="end" color="inherit" onClick={toggleSettingsDialog} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <FormSettings
            settings={formData.settings}
            onUpdate={handleUpdateSettings}
          />
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 1 } }}>
          <Button onClick={toggleSettingsDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => handleUpdateSettings(formData.settings)}
          >
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Conditional Logic Dialog */}
      {selectedFieldIndex !== null && (
        <Dialog 
          open={conditionsOpen}
          onClose={toggleConditionsDialog}
          maxWidth="md" 
          fullWidth
          fullScreen={isMobile}
          disableEnforceFocus
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Conditional Logic for {formData.pages[activePageIndex]?.fields[selectedFieldIndex]?.label || 'Field'}</Typography>
              <IconButton edge="end" color="inherit" onClick={toggleConditionsDialog} aria-label="close">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {formData.pages[activePageIndex] && formData.pages[activePageIndex].fields && formData.pages[activePageIndex].fields[selectedFieldIndex] && (
              <FormConditions
                currentField={formData.pages[activePageIndex].fields[selectedFieldIndex]}
                allFields={formData.pages.flatMap((page, pageIndex) => 
                  // Add page index info to each field for better context
                  page.fields.map(field => ({
                    ...field,
                    pageIndex,
                    pageName: page.title
                  }))
                )}
                currentFieldIndex={selectedFieldIndex}
                conditional={formData.pages[activePageIndex].fields[selectedFieldIndex].conditional}
                onUpdate={handleUpdateConditions}
              />
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Preview Dialog */}
      <Dialog 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Form Preview</Typography>
            <IconButton edge="end" color="inherit" onClick={() => setPreviewOpen(false)} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box p={{ xs: 1, md: 2 }}>
            <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
              <Typography variant="h5" gutterBottom>{formData.title}</Typography>
              {formData.description && (
                <Typography variant="body1" color="textSecondary" paragraph>
                  {formData.description}
                </Typography>
              )}
            </Paper>

            {formData.pages.length > 1 && formData.settings.showProgressBar && (
              <Stepper 
                activeStep={0} 
                alternativeLabel={!isMobile}
                orientation={isMobile ? "vertical" : "horizontal"}
                sx={{ mb: 4 }}
              >
                {formData.pages.map((page, index) => (
                  <Step key={index}>
                    <StepLabel>{page.title}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            )}

            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {formData.pages[activePageIndex].title}
              </Typography>
              
              {formData.pages[activePageIndex].description && (
                <Typography variant="body2" color="textSecondary" paragraph>
                  {formData.pages[activePageIndex].description}
                </Typography>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              {formData.settings.collectEmail && (
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  placeholder="Your email address"
                  margin="normal"
                  required
                />
              )}

              {formData.pages[activePageIndex].fields.map((field, index) => (
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
                  {formData.settings.submitButtonText || 'Submit'}
                </Button>
              </Box>
            </Paper>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Access Control Dialog */}
      <Dialog 
        open={accessDialogOpen} 
        onClose={() => setAccessDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Access Control Settings</Typography>
            <IconButton edge="end" color="inherit" onClick={() => setAccessDialogOpen(false)} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
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
        <DialogActions sx={{ p: { xs: 2, sm: 1 } }}>
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
      <Dialog 
        open={shareDialogOpen} 
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Share Form</Typography>
            <IconButton edge="end" color="inherit" onClick={() => setShareDialogOpen(false)} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Use this link to share your form:
          </Typography>
          
          <Box 
            display="flex" 
            flexDirection={isMobile ? "column" : "row"}
            alignItems="stretch"
            gap={1}
          >
            <TextField
              fullWidth
              value={shareUrl}
              variant="outlined"
              InputProps={{
                readOnly: true,
              }}
              sx={{ mr: isMobile ? 0 : 1 }}
            />
            
            <Button 
              variant="contained" 
              color={copiedToClipboard ? "success" : "primary"}
              startIcon={<CopyIcon />}
              onClick={handleCopyUrl}
              fullWidth={isMobile}
            >
              {copiedToClipboard ? "Copied!" : "Copy"}
            </Button>
          </Box>
          
          <Box mt={2}>
            <Typography variant="body2" color="textSecondary">
              Share this URL to allow users to access and submit responses to your form.
              <br />
              The link works on any device including mobile phones.
              {passwordEnabled && (
                <><br /><strong>Note: Password protection is enabled.</strong></>
              )}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 1 } }}>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Publish Dialog */}
      <Dialog 
        open={publishDialogOpen} 
        onClose={() => setPublishDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Publish Form</Typography>
            <IconButton edge="end" color="inherit" onClick={() => setPublishDialogOpen(false)} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you sure you want to publish this form? Once published, it will be immediately available to collect responses.
          </Typography>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            Publishing will save all your current changes.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 1 } }}>
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
    </Container>
  );
};

export default FormBuilder; 
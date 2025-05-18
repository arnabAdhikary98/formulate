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
  FormLabel
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
  PublishOutlined as PublishIcon
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
    const newPage = {
      title: `Page ${formData.pages.length + 1}`,
      description: '',
      order: formData.pages.length,
      fields: []
    };
    
    setFormData({
      ...formData,
      pages: [...formData.pages, newPage]
    });
    
    setActivePageIndex(formData.pages.length);
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
  const handleSaveForm = async () => {
    if (!formData.title.trim()) {
      setError('Please add a form title');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await createForm(formData);
      setSaving(false);
      navigate(`/forms/${response._id}/edit`);
    } catch (err) {
      setSaving(false);
      setError('Failed to save form. Please try again.');
      console.error(err);
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
  const toggleConditionsDialog = () => {
    setConditionsOpen(!conditionsOpen);
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
    const updatedPages = [...formData.pages];
    updatedPages[activePageIndex].fields[fieldIndex].conditional = conditions;
    
    setFormData({
      ...formData,
      pages: updatedPages
    });
  };

  return (
    <Container maxWidth="lg">
      <Box py={3}>
        <Paper elevation={0} sx={{ mb: 3, p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <TextField
              label="Form Title"
              variant="outlined"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              sx={{ mr: 2 }}
            />
            <Box>
              <Button
                variant="outlined"
                startIcon={<VisibilityIcon />}
                onClick={handlePreview}
                sx={{ mr: 1 }}
              >
                Preview
              </Button>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={toggleSettingsDialog}
                sx={{ mr: 1 }}
              >
                Settings
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSaveForm}
                disabled={saving}
              >
                Save Form
              </Button>
            </Box>
          </Box>
          
          <TextField
            label="Form Description"
            variant="outlined"
            fullWidth
            multiline
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
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

          <Grid item xs={12} md={8}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                minHeight: '500px',
                borderRadius: 2,
                border: '1px solid #e0e0e0'
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  {formData.pages[activePageIndex].title}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={(e) => setFieldTypeMenuAnchor(e.currentTarget)}
                >
                  Add Field
                </Button>
                <Menu
                  anchorEl={fieldTypeMenuAnchor}
                  open={Boolean(fieldTypeMenuAnchor)}
                  onClose={() => setFieldTypeMenuAnchor(null)}
                >
                  {fieldTypes.map((type) => (
                    <MenuItem 
                      key={type.type} 
                      onClick={() => handleAddField(type.type)}
                    >
                      {type.label}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  {formData.pages[activePageIndex].description}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {formData.pages[activePageIndex].fields.length === 0 ? (
                <Box 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center" 
                  justifyContent="center" 
                  p={4}
                  sx={{ 
                    height: '200px', 
                    border: '2px dashed #e0e0e0',
                    borderRadius: 2,
                    backgroundColor: '#f9f9f9'
                  }}
                >
                  <Typography variant="body1" color="textSecondary" gutterBottom>
                    No fields added yet
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={(e) => setFieldTypeMenuAnchor(e.currentTarget)}
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
                                    boxShadow: selectedFieldIndex === index ? '0 0 0 2px rgba(33,150,243,0.3)' : 'none'
                                  }}
                                >
                                  <CardContent sx={{ position: 'relative', pb: 1 }}>
                                    <Box
                                      {...provided.dragHandleProps}
                                      position="absolute"
                                      top="8px"
                                      left="8px"
                                      sx={{ cursor: 'move' }}
                                    >
                                      <DragIcon color="action" />
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
                p: 2, 
                height: '100%',
                borderRadius: 2,
                border: '1px solid #e0e0e0'
              }}
            >
              <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 2 }}>
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
                    onClick={toggleConditionsDialog}
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
      <Dialog open={settingsOpen} onClose={toggleSettingsDialog} maxWidth="md" fullWidth>
        <DialogTitle>Form Settings</DialogTitle>
        <DialogContent>
          <FormSettings
            settings={formData.settings}
            onUpdate={handleUpdateSettings}
          />
        </DialogContent>
        <DialogActions>
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
        <Dialog open={conditionsOpen} onClose={toggleConditionsDialog} maxWidth="md" fullWidth>
          <DialogTitle>Conditional Logic</DialogTitle>
          <DialogContent>
            <FormConditions
              currentField={formData.pages[activePageIndex].fields[selectedFieldIndex]}
              allFields={formData.pages.flatMap(page => page.fields)}
              currentFieldIndex={selectedFieldIndex}
              conditional={formData.pages[activePageIndex].fields[selectedFieldIndex].conditional}
              onUpdate={handleUpdateConditions}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={toggleConditionsDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

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
          <Box p={2}>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" gutterBottom>{formData.title}</Typography>
              {formData.description && (
                <Typography variant="body1" color="textSecondary" paragraph>
                  {formData.description}
                </Typography>
              )}
            </Paper>

            {formData.pages.length > 1 && formData.settings.showProgressBar && (
              <Stepper activeStep={0} alternativeLabel sx={{ mb: 4 }}>
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
    </Container>
  );
};

export default FormBuilder; 
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Switch,
  FormControlLabel,
  Typography,
  Divider,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  Slider,
  Grid,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';

const FieldSettings = ({ field, onUpdate, onDelete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Helper function to handle field updates
  const handleChange = (property, value) => {
    onUpdate({
      ...field,
      [property]: value
    });
  };

  // Add new option (for dropdown, checkbox, radio)
  const handleAddOption = () => {
    const updatedField = { ...field };
    // Ensure options is an array before pushing to it
    if (!Array.isArray(updatedField.options)) {
      updatedField.options = [];
    }
    updatedField.options.push(`Option ${updatedField.options.length + 1}`);
    onUpdate(updatedField);
  };

  // Update an option
  const handleOptionChange = (index, value) => {
    const updatedField = { ...field };
    // Ensure options is an array before accessing it
    if (!Array.isArray(updatedField.options)) {
      updatedField.options = [];
    }
    updatedField.options[index] = value;
    onUpdate(updatedField);
  };

  // Delete an option
  const handleDeleteOption = (index) => {
    const updatedField = { ...field };
    // Ensure options is an array before manipulating it
    if (!Array.isArray(updatedField.options)) {
      return;
    }
    updatedField.options.splice(index, 1);
    onUpdate(updatedField);
  };

  // Render different settings based on field type
  const renderTypeSpecificSettings = () => {
    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <>
            <TextField
              label="Min Length"
              type="number"
              value={field.validation?.minLength || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value) || '';
                handleChange('validation', {
                  ...field.validation,
                  minLength: value
                });
              }}
              fullWidth
              margin="normal"
              size="small"
            />
            <TextField
              label="Max Length"
              type="number"
              value={field.validation?.maxLength || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value) || '';
                handleChange('validation', {
                  ...field.validation,
                  maxLength: value
                });
              }}
              fullWidth
              margin="normal"
              size="small"
            />
          </>
        );
        
      case 'number':
        return (
          <>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Min Value"
                  type="number"
                  value={field.min}
                  onChange={(e) => handleChange('min', parseInt(e.target.value) || 0)}
                  fullWidth
                  margin="normal"
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Max Value"
                  type="number"
                  value={field.max}
                  onChange={(e) => handleChange('max', parseInt(e.target.value) || 100)}
                  fullWidth
                  margin="normal"
                  size="small"
                />
              </Grid>
            </Grid>
            <TextField
              label="Step"
              type="number"
              value={field.step}
              onChange={(e) => handleChange('step', parseFloat(e.target.value) || 1)}
              fullWidth
              margin="normal"
              size="small"
              InputProps={{
                inputProps: { min: 0.01, step: 0.01 }
              }}
            />
          </>
        );
        
      case 'dropdown':
      case 'radio':
      case 'checkbox':
        return (
          <Box mt={2}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle2">Options</Typography>
              <Button 
                size="small" 
                startIcon={<AddIcon />} 
                onClick={handleAddOption}
              >
                Add Option
              </Button>
            </Box>
            <List dense>
              {Array.isArray(field.options) && field.options.map((option, index) => (
                <ListItem 
                  key={index} 
                  dense
                  divider
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      size="small" 
                      onClick={() => handleDeleteOption(index)}
                      disabled={field.options.length <= 1}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <TextField
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    size="small"
                    fullWidth
                    variant="standard"
                    placeholder={`Option ${index + 1}`}
                  />
                </ListItem>
              ))}
              {(!Array.isArray(field.options) || field.options.length === 0) && (
                <Button 
                  fullWidth 
                  variant="outlined" 
                  size="small"
                  onClick={handleAddOption}
                  sx={{ mt: 1 }}
                >
                  Add your first option
                </Button>
              )}
            </List>
          </Box>
        );
        
      case 'rating':
        return (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Max Rating: {field.max}
            </Typography>
            <Slider
              value={field.max}
              onChange={(e, value) => handleChange('max', value)}
              step={1}
              marks
              min={3}
              max={10}
              valueLabelDisplay="auto"
            />
          </Box>
        );
        
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: isMobile ? 0.5 : 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant={isMobile ? "body1" : "h6"} component="h3" fontWeight="bold">
          Field Settings
        </Typography>
        <IconButton 
          color="error" 
          onClick={onDelete} 
          size={isMobile ? "small" : "medium"}
        >
          <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <TextField
        label="Field Label"
        fullWidth
        value={field.label}
        onChange={(e) => handleChange('label', e.target.value)}
        margin="dense"
        size={isMobile ? "small" : "medium"}
      />

      <TextField
        label="Placeholder"
        fullWidth
        value={field.placeholder || ''}
        onChange={(e) => handleChange('placeholder', e.target.value)}
        margin="dense"
        size={isMobile ? "small" : "medium"}
      />

      <TextField
        label="Help Text"
        fullWidth
        multiline
        rows={2}
        value={field.helpText || ''}
        onChange={(e) => handleChange('helpText', e.target.value)}
        margin="dense"
        size={isMobile ? "small" : "medium"}
        helperText="Additional instructions for this field"
      />

      <FormControlLabel
        control={
          <Switch
            checked={field.required || false}
            onChange={(e) => handleChange('required', e.target.checked)}
            color="primary"
            size={isMobile ? "small" : "medium"}
          />
        }
        label={<Typography variant={isMobile ? "body2" : "body1"}>Required field</Typography>}
        sx={{ mt: 1, mb: 1, display: 'flex' }}
      />

      {/* Render type-specific settings */}
      {renderTypeSpecificSettings()}

      <Box mt={2}>
        <Chip 
          label={field.type.charAt(0).toUpperCase() + field.type.slice(1)} 
          color="primary" 
          variant="outlined" 
          size={isMobile ? "small" : "medium"}
        />
      </Box>
    </Box>
  );
};

export default FieldSettings; 
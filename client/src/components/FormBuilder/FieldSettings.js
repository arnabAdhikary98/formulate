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
  Chip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';

const FieldSettings = ({ field, onUpdate, onDelete }) => {
  // Helper function to handle field updates
  const handleChange = (property, value) => {
    onUpdate({
      ...field,
      [property]: value
    });
  };

  // Add new option (for dropdown, checkbox, radio)
  const handleAddOption = () => {
    const options = [...field.options, `Option ${field.options.length + 1}`];
    handleChange('options', options);
  };

  // Update an option
  const handleOptionChange = (index, value) => {
    const options = [...field.options];
    options[index] = value;
    handleChange('options', options);
  };

  // Delete an option
  const handleDeleteOption = (index) => {
    const options = field.options.filter((_, i) => i !== index);
    handleChange('options', options);
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
              {field.options.map((option, index) => (
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
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Field Properties
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      <TextField
        label="Label"
        value={field.label}
        onChange={(e) => handleChange('label', e.target.value)}
        fullWidth
        margin="normal"
        size="small"
      />
      
      <TextField
        label="Placeholder"
        value={field.placeholder || ''}
        onChange={(e) => handleChange('placeholder', e.target.value)}
        fullWidth
        margin="normal"
        size="small"
      />
      
      <TextField
        label="Help Text"
        value={field.helpText || ''}
        onChange={(e) => handleChange('helpText', e.target.value)}
        fullWidth
        margin="normal"
        size="small"
        multiline
        rows={2}
      />

      <Box display="flex" alignItems="center" mt={1}>
        <FormControlLabel
          control={
            <Switch
              checked={field.required}
              onChange={(e) => handleChange('required', e.target.checked)}
              color="primary"
            />
          }
          label="Required"
        />
      </Box>
      
      <Box mt={2}>
        <Chip 
          label={`Field Type: ${field.type.charAt(0).toUpperCase() + field.type.slice(1)}`} 
          variant="outlined" 
        />
      </Box>
      
      <Box mt={3}>
        <Typography variant="subtitle2" gutterBottom>
          Validation Settings
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {renderTypeSpecificSettings()}
      </Box>
      
      <Box mt={4} textAlign="center">
        <Button 
          variant="outlined" 
          color="error" 
          startIcon={<DeleteIcon />}
          onClick={onDelete}
        >
          Delete Field
        </Button>
      </Box>
    </Box>
  );
};

export default FieldSettings; 
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  IconButton,
  Divider,
  Alert,
  Paper,
  Grid
} from '@mui/material';
import { DeleteOutline as DeleteIcon, AddCircleOutline as AddIcon, Save as SaveIcon } from '@mui/icons-material';

const FormConditions = ({ 
  currentField, 
  allFields, 
  currentFieldIndex, 
  conditional = {},
  onUpdate 
}) => {
  // Ensure conditional has default values if undefined
  const safeConditional = conditional || {};
  
  const [isConditional, setIsConditional] = useState(safeConditional.isConditional || false);
  const [dependsOn, setDependsOn] = useState(safeConditional.dependsOn || '');
  const [condition, setCondition] = useState(safeConditional.condition || 'equals');
  const [value, setValue] = useState(safeConditional.value || '');
  const [error, setError] = useState('');
  
  // Get available fields for conditions (fields that come before this one)
  const availableFields = allFields.filter((field, index) => {
    return index < currentFieldIndex && 
           field.type !== 'file' &&
           field.type !== 'heading' &&
           field.type !== 'paragraph';
  });

  // Get available conditions based on field type - Define this BEFORE using it in useEffect
  const getAvailableConditions = useCallback((fieldType) => {
    switch (fieldType) {
      case 'text':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'not_equals', label: 'Does not equal' },
          { value: 'contains', label: 'Contains' },
          { value: 'not_contains', label: 'Does not contain' },
          { value: 'is_empty', label: 'Is empty' },
          { value: 'is_not_empty', label: 'Is not empty' }
        ];
      case 'email':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'not_equals', label: 'Does not equal' },
          { value: 'contains', label: 'Contains (e.g. @gmail.com)' },
          { value: 'not_contains', label: 'Does not contain' },
          { value: 'is_empty', label: 'Is empty' },
          { value: 'is_not_empty', label: 'Is not empty' }
        ];
      case 'number':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'not_equals', label: 'Does not equal' },
          { value: 'greater_than', label: 'Greater than' },
          { value: 'less_than', label: 'Less than' },
          { value: 'is_empty', label: 'Is empty' },
          { value: 'is_not_empty', label: 'Is not empty' }
        ];
      case 'dropdown':
        return [
          { value: 'equals', label: 'Is selected' },
          { value: 'not_equals', label: 'Is not selected' }
        ];
      case 'radio':
        return [
          { value: 'equals', label: 'Is selected' },
          { value: 'not_equals', label: 'Is not selected' }
        ];
      case 'checkbox':
        return [
          { value: 'equals', label: 'Is checked' },
          { value: 'not_equals', label: 'Is not checked' }
        ];
      case 'rating':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'not_equals', label: 'Does not equal' },
          { value: 'greater_than', label: 'Greater than' },
          { value: 'less_than', label: 'Less than' }
        ];
      default:
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'not_equals', label: 'Does not equal' }
        ];
    }
  }, []);

  // Get the selected field - find by order property
  const selectedField = availableFields.find(f => f.order === parseInt(dependsOn));

  // Reset condition when field type changes
  useEffect(() => {
    // When the dependent field changes, reset the condition to an appropriate default
    if (selectedField) {
      // Get available conditions for this field type
      const availableConditions = getAvailableConditions(selectedField.type);
      
      // If current condition isn't valid for this field type, reset to first available condition
      if (!availableConditions.some(c => c.value === condition)) {
        setCondition(availableConditions[0].value);
        setValue(''); // Reset value when condition changes
      }
    }
  }, [dependsOn, selectedField, condition, getAvailableConditions]);

  // Handle saving the conditional logic
  const handleSaveConditions = () => {
    try {
      // Validate if conditional is enabled but no field is selected
      if (isConditional && !dependsOn && dependsOn !== 0) {
        setError('Please select a field to depend on');
        return;
      }
      
      // Validate if condition requires a value but none is provided
      if (isConditional && shouldShowValueInput() && !value && value !== 0) {
        setError('Please provide a value for the condition');
        return;
      }
      
      // Clear any previous errors
      setError('');
      
      // Call the parent update function
      onUpdate(currentFieldIndex, {
        isConditional,
        dependsOn,
        condition,
        value
      });
    } catch (err) {
      console.error("Error saving conditions:", err);
      setError('Failed to save conditions. Please try again.');
    }
  };

  // Handle toggling conditional logic
  const handleToggleConditional = (event) => {
    setIsConditional(event.target.checked);
    if (!event.target.checked) {
      // Reset values if turning off conditional logic
      setDependsOn('');
      setCondition('equals');
      setValue('');
    }
  };

  // Helper to determine if value input should be shown
  const shouldShowValueInput = () => {
    if (!selectedField) return false;
    
    // These conditions don't need a value input
    return !['is_empty', 'is_not_empty'].includes(condition);
  };

  // Handle field selection change
  const handleFieldChange = (e) => {
    const newDependsOn = e.target.value;
    setDependsOn(newDependsOn);
    
    // Reset condition and value when field changes
    const newSelectedField = availableFields.find(f => f.order === parseInt(newDependsOn));
    if (newSelectedField) {
      const availableConditions = getAvailableConditions(newSelectedField.type);
      setCondition(availableConditions[0].value);
      setValue('');
    }
  };

  // Handle condition change
  const handleConditionChange = (e) => {
    setCondition(e.target.value);
    // Reset value when condition changes to avoid invalid values
    setValue('');
  };

  // Get field display name with type
  const getFieldDisplayName = (field) => {
    let typeLabel = '';
    
    switch (field.type) {
      case 'text':
        typeLabel = 'Text';
        break;
      case 'email':
        typeLabel = 'Email';
        break;
      case 'number':
        typeLabel = 'Number';
        break;
      case 'dropdown':
        typeLabel = 'Dropdown';
        break;
      case 'radio':
        typeLabel = 'Radio';
        break;
      case 'checkbox':
        typeLabel = 'Checkbox';
        break;
      case 'rating':
        typeLabel = 'Rating';
        break;
      default:
        typeLabel = field.type;
    }
    
    // Include page info if available
    if (field.pageName) {
      return `${field.label} (${typeLabel}) - Page: ${field.pageName}`;
    }
    
    return `${field.label} (${typeLabel})`;
  };

  // Render value input based on the field type
  const renderValueInput = () => {
    if (!selectedField || !shouldShowValueInput()) return null;

    switch (selectedField.type) {
      case 'dropdown':
      case 'radio':
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel>{selectedField.type === 'dropdown' ? 'Selected Option' : 'Selected Choice'}</InputLabel>
            <Select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              label={selectedField.type === 'dropdown' ? 'Selected Option' : 'Selected Choice'}
              error={isConditional && !value && value !== 0}
              required={isConditional}
            >
              {selectedField.options && selectedField.options.length > 0 ? (
                selectedField.options.map((option, idx) => (
                  <MenuItem key={idx} value={option}>
                    {option}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value="">
                  <em>No options available</em>
                </MenuItem>
              )}
            </Select>
            {isConditional && !value && (
              <Typography variant="caption" color="error">
                Please select a value
              </Typography>
            )}
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              {selectedField.type === 'dropdown' ? 'Select which dropdown option will trigger this condition' : 'Select which radio option will trigger this condition'}
            </Typography>
          </FormControl>
        );
      case 'checkbox':
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel>Value</InputLabel>
            <Select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              label="Value"
              error={isConditional && !value && value !== 'true' && value !== 'false'}
              required={isConditional}
            >
              <MenuItem value="true">Checked</MenuItem>
              <MenuItem value="false">Unchecked</MenuItem>
            </Select>
          </FormControl>
        );
      case 'number':
        return (
          <TextField
            fullWidth
            label="Value"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            margin="normal"
            error={isConditional && value === ''}
            helperText={isConditional && value === '' ? "Please enter a number" : ""}
            required={isConditional}
            InputProps={{
              inputProps: {
                min: selectedField.min,
                max: selectedField.max,
                step: selectedField.step || 1
              }
            }}
          />
        );
      case 'rating':
        return (
          <TextField
            fullWidth
            label="Value"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            margin="normal"
            error={isConditional && value === ''}
            helperText={isConditional && value === '' ? "Please enter a rating value" : ""}
            required={isConditional}
            InputProps={{
              inputProps: {
                min: 0,
                max: selectedField.max || 5,
                step: 1
              }
            }}
          />
        );
      case 'email':
        return (
          <TextField
            fullWidth
            label="Value"
            type="email"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            margin="normal"
            error={isConditional && !value && value !== 0}
            helperText={isConditional && !value && value !== 0 ? "Please enter an email value" : ""}
            required={isConditional}
            placeholder="e.g. @gmail.com or specific email"
          />
        );
      default:
        return (
          <TextField
            fullWidth
            label="Value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            margin="normal"
            error={isConditional && !value && value !== 0}
            helperText={isConditional && !value && value !== 0 ? "Please enter a value" : ""}
            required={isConditional}
          />
        );
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Conditional Logic
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Make this field appear only when certain conditions are met.
      </Typography>
      
      <Box mt={2}>
        <FormControlLabel
          control={
            <Switch
              checked={isConditional}
              onChange={handleToggleConditional}
              color="primary"
            />
          }
          label="Enable conditional logic"
        />
      </Box>
      
      {isConditional && (
        <Box mt={2}>
          {availableFields.length === 0 ? (
            <Alert severity="info">
              Conditional logic requires previous fields. This is the first field, so it cannot have conditions.
            </Alert>
          ) : (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Show this field when:
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Field</InputLabel>
                    <Select
                      value={dependsOn}
                      onChange={handleFieldChange}
                      label="Field"
                    >
                      {availableFields.map((field) => (
                        <MenuItem key={field.order} value={field.order}>
                          {getFieldDisplayName(field)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FormControl 
                    fullWidth 
                    margin="normal"
                    disabled={!dependsOn}
                  >
                    <InputLabel>Condition</InputLabel>
                    <Select
                      value={condition}
                      onChange={handleConditionChange}
                      label="Condition"
                    >
                      {selectedField && 
                        getAvailableConditions(selectedField.type).map((cond) => (
                          <MenuItem key={cond.value} value={cond.value}>
                            {cond.label}
                          </MenuItem>
                        ))
                      }
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  {dependsOn && shouldShowValueInput() && renderValueInput()}
                </Grid>
              </Grid>
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleSaveConditions}
                  startIcon={<SaveIcon />}
                >
                  Save Conditions
                </Button>
              </Box>
              
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  This field will only be visible when the condition above is met.
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
};

export default FormConditions; 
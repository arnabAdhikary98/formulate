import React, { useState, useEffect } from 'react';
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
import { DeleteOutline as DeleteIcon, AddCircleOutline as AddIcon } from '@mui/icons-material';

const FormConditions = ({ 
  currentField, 
  allFields, 
  currentFieldIndex, 
  conditional, 
  onUpdate 
}) => {
  const [isConditional, setIsConditional] = useState(conditional.isConditional);
  const [dependsOn, setDependsOn] = useState(conditional.dependsOn || '');
  const [condition, setCondition] = useState(conditional.condition || 'equals');
  const [value, setValue] = useState(conditional.value || '');
  
  // Get available fields for conditions (fields that come before this one)
  const availableFields = allFields.filter((field, index) => {
    return index < currentFieldIndex && 
           field.type !== 'file' &&
           field.type !== 'heading' &&
           field.type !== 'paragraph';
  });

  // Update the parent component when condition changes
  useEffect(() => {
    onUpdate(currentFieldIndex, {
      isConditional,
      dependsOn,
      condition,
      value
    });
  }, [isConditional, dependsOn, condition, value, currentFieldIndex, onUpdate]);

  // Get the selected field
  const selectedField = availableFields.find(f => f.order === dependsOn);

  // Get available conditions based on field type
  const getAvailableConditions = (fieldType) => {
    switch (fieldType) {
      case 'text':
      case 'email':
      case 'textarea':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'not_equals', label: 'Does not equal' },
          { value: 'contains', label: 'Contains' },
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
      case 'radio':
        return [
          { value: 'equals', label: 'Selected' },
          { value: 'not_equals', label: 'Not selected' }
        ];
      case 'checkbox':
        return [
          { value: 'equals', label: 'Checked' },
          { value: 'not_equals', label: 'Not checked' }
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

  // Render value input based on the field type
  const renderValueInput = () => {
    if (!selectedField || !shouldShowValueInput()) return null;

    switch (selectedField.type) {
      case 'dropdown':
      case 'radio':
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel>Value</InputLabel>
            <Select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              label="Value"
            >
              {selectedField.options.map((option, idx) => (
                <MenuItem key={idx} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
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
            >
              <MenuItem value="true">Checked</MenuItem>
              <MenuItem value="false">Unchecked</MenuItem>
            </Select>
          </FormControl>
        );
      case 'number':
      case 'rating':
        return (
          <TextField
            fullWidth
            label="Value"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            margin="normal"
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
                      onChange={(e) => setDependsOn(e.target.value)}
                      label="Field"
                    >
                      {availableFields.map((field) => (
                        <MenuItem key={field.order} value={field.order}>
                          {field.label}
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
                      onChange={(e) => setCondition(e.target.value)}
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
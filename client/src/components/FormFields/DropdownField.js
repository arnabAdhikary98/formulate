import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Chip
} from '@mui/material';
import { DeleteOutline as DeleteIcon } from '@mui/icons-material';

const DropdownField = ({ field, isSelected, isDragging, onClick, onDelete }) => {
  return (
    <Box 
      onClick={onClick}
      sx={{ 
        position: 'relative',
        p: 1,
        cursor: 'pointer',
        backgroundColor: isDragging ? '#f5f5f5' : 'transparent',
        '&:hover': {
          backgroundColor: '#f9f9f9'
        }
      }}
    >
      <Box mb={1}>
        <Typography variant="subtitle1" component="label" fontWeight={field.required ? 'bold' : 'normal'}>
          {field.label}
          {field.required && <span style={{ color: 'red' }}> *</span>}
        </Typography>
        {field.helpText && (
          <Typography variant="caption" display="block" color="textSecondary">
            {field.helpText}
          </Typography>
        )}
      </Box>

      <FormControl fullWidth size="small">
        <InputLabel>{field.placeholder || "Select an option"}</InputLabel>
        <Select
          value=""
          label={field.placeholder || "Select an option"}
          disabled
          readOnly
        >
          {field.options && field.options.map((option, index) => (
            <MenuItem key={index} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box mt={1} display="flex" flexWrap="wrap" gap={0.5}>
        {field.options && field.options.map((option, index) => (
          <Chip 
            key={index} 
            label={option} 
            size="small" 
            variant="outlined"
            sx={{ m: 0.25 }}
          />
        ))}
      </Box>

      {isSelected && (
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            m: 0.5
          }}
        >
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default DropdownField; 
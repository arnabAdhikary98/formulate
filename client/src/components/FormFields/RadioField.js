import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  IconButton
} from '@mui/material';
import { DeleteOutline as DeleteIcon } from '@mui/icons-material';

const RadioField = ({ field, isSelected, isDragging, onClick, onDelete }) => {
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

      <FormControl component="fieldset">
        <RadioGroup>
          {field.options && field.options.map((option, index) => (
            <FormControlLabel
              key={index}
              value={option}
              control={<Radio disabled />}
              label={option}
            />
          ))}
        </RadioGroup>
      </FormControl>

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

export default RadioField; 
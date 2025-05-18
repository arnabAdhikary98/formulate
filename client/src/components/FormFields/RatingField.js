import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Rating
} from '@mui/material';
import { DeleteOutline as DeleteIcon } from '@mui/icons-material';

const RatingField = ({ field, isSelected, isDragging, onClick, onDelete }) => {
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

      <Box display="flex" alignItems="center">
        <Rating
          name={`rating-preview-${field.order}`}
          value={0}
          max={field.max || 5}
          readOnly
        />
        <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
          (0/{field.max || 5})
        </Typography>
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

export default RatingField; 
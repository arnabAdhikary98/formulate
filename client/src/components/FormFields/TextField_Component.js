import React from 'react';
import {
  Box,
  TextField,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { DeleteOutline as DeleteIcon } from '@mui/icons-material';

const TextField_Component = ({ field, isSelected, isDragging, onClick, onDelete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box 
      onClick={onClick}
      sx={{ 
        position: 'relative',
        p: isMobile ? 0.5 : 1,
        cursor: 'pointer',
        backgroundColor: isDragging ? '#f5f5f5' : 'transparent',
        '&:hover': {
          backgroundColor: '#f9f9f9'
        }
      }}
    >
      <Box mb={isMobile ? 0.5 : 1}>
        <Typography 
          variant={isMobile ? "body2" : "subtitle1"} 
          component="label" 
          fontWeight={field.required ? 'bold' : 'normal'}
          sx={{ fontSize: isMobile ? '0.85rem' : 'inherit' }}
        >
          {field.label}
          {field.required && <span style={{ color: 'red' }}> *</span>}
        </Typography>
        {field.helpText && (
          <Typography 
            variant="caption" 
            display="block" 
            color="textSecondary"
            sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}
          >
            {field.helpText}
          </Typography>
        )}
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder={field.placeholder || ''}
        disabled
        size="small"
        InputProps={{
          readOnly: true,
          style: { fontSize: isMobile ? '0.85rem' : 'inherit' }
        }}
        sx={{ '& .MuiOutlinedInput-root': { 
          padding: isMobile ? '8px 10px' : 'inherit' 
        }}}
      />

      {isSelected && (
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            m: isMobile ? 0.25 : 0.5
          }}
        >
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            sx={{ padding: isMobile ? '4px' : '8px' }}
          >
            <DeleteIcon fontSize={isMobile ? "small" : "small"} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default TextField_Component; 
import React from 'react';
import { TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import CustomDateFnsAdapter from '../utils/dateAdapter';

// Simplified DateTimePicker component to handle compatibility issues
const DateTimePicker = ({ label, value, onChange, minDateTime, ...props }) => {
  return (
    <LocalizationProvider dateAdapter={CustomDateFnsAdapter}>
      <MuiDateTimePicker
        label={label}
        value={value}
        onChange={onChange}
        minDateTime={minDateTime}
        slotProps={{ 
          textField: { 
            fullWidth: true,
            variant: 'outlined'
          } 
        }}
        {...props}
      />
    </LocalizationProvider>
  );
};

export default DateTimePicker; 
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parse, isValid, getHours, getMinutes, getSeconds } from 'date-fns';

// Custom adapter to work around compatibility issues
class CustomDateFnsAdapter extends AdapterDateFns {
  // Add any custom overrides if needed
  constructor({ locale } = {}) {
    super({ locale });
  }
}

export default CustomDateFnsAdapter; 
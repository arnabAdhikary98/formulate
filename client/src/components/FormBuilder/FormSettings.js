import React from 'react';
import {
  Box,
  TextField,
  Switch,
  FormControlLabel,
  Typography,
  Divider,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  IconButton,
  Paper
} from '@mui/material';
import { HelpOutline as HelpIcon } from '@mui/icons-material';

const FormSettings = ({ settings, onUpdate }) => {
  // Helper function to handle settings updates
  const handleChange = (property, value) => {
    onUpdate({
      ...settings,
      [property]: value
    });
  };

  return (
    <Box py={2}>
      <Typography variant="h6" gutterBottom>
        Form Configuration
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Response Collection
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.collectEmail}
                onChange={(e) => handleChange('collectEmail', e.target.checked)}
                color="primary"
              />
            }
            label="Collect respondent email"
          />
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', ml: 4, mt: -1, mb: 1 }}>
            When enabled, respondents will be asked for their email address
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.preventDuplicateSubmissions}
                onChange={(e) => handleChange('preventDuplicateSubmissions', e.target.checked)}
                color="primary"
              />
            }
            label="Prevent duplicate submissions"
          />
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', ml: 4, mt: -1, mb: 1 }}>
            Prevents the same user/device from submitting the form multiple times using cookies and IP tracking
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.allowSavingDrafts}
                onChange={(e) => handleChange('allowSavingDrafts', e.target.checked)}
                color="primary"
              />
            }
            label="Allow saving incomplete responses as drafts"
          />
          
          <TextField
            label="Submit Button Text"
            fullWidth
            margin="normal"
            value={settings.submitButtonText}
            onChange={(e) => handleChange('submitButtonText', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Form Display
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.showProgressBar}
                onChange={(e) => handleChange('showProgressBar', e.target.checked)}
                color="primary"
              />
            }
            label="Show progress bar"
          />
          
          <Box mt={2}>
            <FormControl fullWidth disabled={!settings.showProgressBar}>
              <InputLabel>Progress Bar Style</InputLabel>
              <Select
                value={settings.progressBarStyle}
                onChange={(e) => handleChange('progressBarStyle', e.target.value)}
                label="Progress Bar Style"
              >
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="numbered">Numbered</MenuItem>
                <MenuItem value="percentage">Percentage</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            After Submission
          </Typography>
          
          <TextField
            label="Redirect URL (Optional)"
            helperText="Where to send respondents after form submission"
            fullWidth
            margin="normal"
            value={settings.redirectUrl || ''}
            onChange={(e) => handleChange('redirectUrl', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom display="flex" alignItems="center">
            Integrations & Automations
            <Tooltip title="Set up integrations to automatically send form data to other systems">
              <IconButton size="small" sx={{ ml: 1 }}>
                <HelpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          
          <Box mb={3}>
            <TextField
              label="Webhook URL (Optional)"
              placeholder="https://your-system.com/api/webhook"
              helperText="Form responses will be automatically sent to this URL when submitted"
              fullWidth
              margin="normal"
              value={settings.webhookUrl || ''}
              onChange={(e) => handleChange('webhookUrl', e.target.value)}
            />
            
            <Paper variant="outlined" sx={{ p: 2, mt: 2, backgroundColor: '#f5f5f5' }}>
              <Typography variant="subtitle2" gutterBottom>
                How webhooks work:
              </Typography>
              <Typography variant="body2">
                1. When a form is submitted, we'll send a POST request to your webhook URL
              </Typography>
              <Typography variant="body2">
                2. The request will contain form responses, respondent info, and form metadata
              </Typography>
              <Typography variant="body2">
                3. Your system can then process this data (store in database, trigger automation, etc.)
              </Typography>
              <Typography variant="body2" mt={1}>
                This allows you to integrate form responses with your CRM, email marketing, or other systems.
              </Typography>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FormSettings; 
import React, { useContext, useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { AccountCircle as ProfileIcon } from '@mui/icons-material';
import { getForms } from '../api/forms';
import { getResponseCount } from '../api/responses';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
  });
  const [message, setMessage] = useState(null);
  const [stats, setStats] = useState({
    formCount: 0,
    responseCount: 0,
    joinDate: user?.createdAt || new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);

  // Initialize form values from user data only when component mounts or user changes
  useEffect(() => {
    if (user) {
      setFormValues({
        name: user.name || '',
        email: user.email || '',
      });
      
      // Fetch user statistics
      const fetchStats = async () => {
        try {
          setLoading(true);
          
          // Get forms count
          const forms = await getForms();
          
          // Get total response count across all forms
          let totalResponses = 0;
          if (forms && forms.length > 0) {
            try {
              const responsePromises = forms.map(form => 
                getResponseCount(form._id)
                  .then(res => res.count || 0)
                  .catch(() => 0)
              );
              
              const responseCounts = await Promise.all(responsePromises);
              totalResponses = responseCounts.reduce((sum, count) => sum + count, 0);
            } catch (error) {
              console.error("Error fetching response counts:", error);
              // Continue with totalResponses = 0
            }
          }
          
          setStats({
            formCount: forms ? forms.length : 0,
            responseCount: totalResponses,
            joinDate: user.createdAt || new Date().toISOString()
          });
          
          setLoading(false);
        } catch (error) {
          console.error("Error fetching user statistics:", error);
          setLoading(false);
          // Set some default stats even if there was an error
          setStats({
            formCount: 0,
            responseCount: 0,
            joinDate: user?.createdAt || new Date().toISOString()
          });
        }
      };
      
      fetchStats();
    }
  }, [user]);

  // For a real implementation, you would add API calls to update the profile
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically update the user profile via API
    // For this example, we'll just show a success message
    setMessage({
      type: 'success',
      text: 'Profile updated successfully!'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  // Update the statistics section
  const renderStats = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress size={30} />
        </Box>
      );
    }
    
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              textAlign: 'center',
              backgroundColor: '#f5f8fa',
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Typography variant="h5" color="primary" gutterBottom>
              {stats.formCount}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Forms Created
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              textAlign: 'center',
              backgroundColor: '#f5f8fa',
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Typography variant="h5" color="primary" gutterBottom>
              {stats.responseCount}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Responses Received
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              textAlign: 'center',
              backgroundColor: '#f5f8fa',
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Typography variant="h5" color="primary" gutterBottom>
              {new Date(stats.joinDate).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Member Since
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  return (
    <Container maxWidth="md">
      <Box py={4}>
        <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <Box display="flex" 
            flexDirection={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'center', sm: 'flex-start' }} 
            mb={4}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: { xs: 64, md: 80 },
                height: { xs: 64, md: 80 },
                mr: { xs: 0, sm: 3 },
                mb: { xs: 2, sm: 0 }
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box textAlign={{ xs: 'center', sm: 'left' }}>
              <Typography variant="h4" gutterBottom>
                {user?.name}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {user?.email}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {message && (
            <Alert severity={message.type} sx={{ mb: 3 }}>
              {message.text}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  <ProfileIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Profile Information
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formValues.name}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formValues.email}
                  onChange={handleChange}
                  variant="outlined"
                  disabled
                  helperText="Email cannot be changed"
                />
              </Grid>
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth={isMobile}
                  sx={{ 
                    width: { xs: '100%', sm: 'auto' },
                    float: { xs: 'none', sm: 'right' }
                  }}
                >
                  Save Changes
                </Button>
              </Grid>
            </Grid>
          </form>

          <Box sx={{ mt: 5 }}>
            <Typography variant="h6" gutterBottom>
              Account Statistics
            </Typography>
            {renderStats()}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile; 
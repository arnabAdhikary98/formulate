import React from 'react';
import { Container, Typography, Box, Button, Grid, Paper, Card, CardContent, useTheme, useMediaQuery, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import { 
  Assignment as FormIcon, 
  BarChart as AnalyticsIcon, 
  Share as ShareIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Devices as DevicesIcon
} from '@mui/icons-material';

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          py: { xs: 6, md: 12 },
          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
          color: 'white',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  mb: 2
                }}
              >
                Form Building <br />Made Simple
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 4,
                  opacity: 0.9,
                  maxWidth: '600px',
                  lineHeight: 1.5
                }}
              >
                Create beautiful forms, surveys and quizzes in minutes. Collect responses, 
                analyze data, and make informed decisions.
              </Typography>
              <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large" 
                  component={Link} 
                  to="/register"
                  sx={{ 
                    fontSize: '1.1rem',
                    px: 4,
                    py: 1.5,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  Get Started — It's Free
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  component={Link} 
                  to="/login"
                  sx={{ 
                    fontSize: '1.1rem',
                    px: 4,
                    py: 1.5,
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Sign In
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Box 
                component="img"
                src="https://images.unsplash.com/photo-1581287053822-fd7bf4f4bfec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9ybXN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60"
                alt="Form Builder Preview"
                sx={{ 
                  width: '100%',
                  maxHeight: '400px',
                  objectFit: 'cover',
                  borderRadius: 2,
                  boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom color="primary">
            Key Features
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto', mb: 2 }}>
            Everything you need to create professional forms and surveys
          </Typography>
          <Divider sx={{ width: '80px', mx: 'auto', borderColor: theme.palette.primary.main, borderWidth: 2 }} />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Grid container spacing={3} sx={{ mt: 2, maxWidth: '100%', justifyContent: 'center' }}>
            {[
              {
                icon: <FormIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />,
                title: "Drag & Drop Form Builder",
                description: "Create multi-page forms with conditional logic, field validation and custom designs."
              },
              {
                icon: <AnalyticsIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />,
                title: "Advanced Analytics",
                description: "Visualize responses with charts, word clouds, and export data in CSV or XLSX format."
              },
              {
                icon: <ShareIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />,
                title: "Simple Sharing",
                description: "Share via unique URLs, embed forms, or integrate with other systems using webhooks."
              },
              {
                icon: <SecurityIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />,
                title: "Privacy & Security",
                description: "Password protection, email verification and duplicate submission prevention built-in."
              },
              {
                icon: <SpeedIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />,
                title: "Blazing Fast",
                description: "Optimized performance ensures your forms load quickly and provide a smooth experience."
              },
              {
                icon: <DevicesIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />,
                title: "Mobile Responsive",
                description: "Forms look great and function perfectly on all devices, from desktops to smartphones."
              }
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} elevation={2}>
                  <CardContent sx={{ textAlign: 'center', p: 4, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" gutterBottom fontWeight="medium">
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ flexGrow: 1 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: '#f0f7ff', py: 8 }}>
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography variant="h3" gutterBottom>
              Ready to Get Started?
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph sx={{ maxWidth: '700px', mx: 'auto', mb: 4 }}>
              Join thousands of users who are creating beautiful forms and collecting valuable data.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              component={Link} 
              to="/register"
              sx={{ 
                fontSize: '1.1rem',
                px: 4,
                py: 1.5
              }}
            >
              Create Your First Form
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Simple Footer */}
      <Box sx={{ bgcolor: '#3f51b5', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} Formulate. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 
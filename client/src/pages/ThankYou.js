import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent
} from '@mui/material';
import { CheckCircle as CheckIcon, Home as HomeIcon } from '@mui/icons-material';

const ThankYou = () => {
  const location = useLocation();
  const formTitle = location.state?.formTitle || 'Form';

  return (
    <Container maxWidth="md">
      <Box py={8} textAlign="center">
        <Card variant="outlined" sx={{ p: 2 }}>
          <CardContent>
            <CheckIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            
            <Typography variant="h4" component="h1" gutterBottom>
              Thank You!
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              Your response has been recorded
            </Typography>
            
            <Typography variant="body1" color="textSecondary" paragraph>
              Thank you for completing "{formTitle}". Your response has been successfully submitted.
            </Typography>
            
            <Box mt={4}>
              <Button 
                component={Link} 
                to="/" 
                variant="contained" 
                color="primary"
                startIcon={<HomeIcon />}
              >
                Return to Home
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default ThankYou; 
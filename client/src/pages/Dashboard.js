import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  IconButton,
  Divider,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, DeleteOutline as DeleteIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getForms, deleteForm } from '../api/forms';

const Dashboard = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const loadForms = async () => {
      try {
        const data = await getForms();
        setForms(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load forms. Please try again.');
        setLoading(false);
      }
    };

    loadForms();
  }, []);

  const handleCreateForm = () => {
    navigate('/forms/create');
  };

  const handleDeleteForm = async (id) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      try {
        await deleteForm(id);
        setForms(forms.filter(form => form._id !== id));
      } catch (err) {
        setError('Failed to delete form. Please try again.');
      }
    }
  };

  const renderFormStatusChip = (status) => {
    switch (status) {
      case 'draft':
        return <Chip label="Draft" color="default" size="small" />;
      case 'published':
        return <Chip label="Published" color="success" size="small" />;
      case 'closed':
        return <Chip label="Closed" color="error" size="small" />;
      case 'scheduled':
        return <Chip label="Scheduled" color="warning" size="small" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1">
            My Forms
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleCreateForm}
          >
            Create New Form
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {forms.length === 0 ? (
          <Box textAlign="center" py={5}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              You haven't created any forms yet
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleCreateForm}
              sx={{ mt: 2 }}
            >
              Create Your First Form
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {forms.map((form) => (
              <Grid item xs={12} sm={6} md={4} key={form._id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="h6" component="h2" noWrap>
                        {form.title}
                      </Typography>
                      {renderFormStatusChip(form.status)}
                    </Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom noWrap>
                      {form.description || 'No description'}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="textSecondary">
                        Responses: {form.responseCount}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Pages: {form.pages.length}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      component={Link} 
                      to={`/forms/${form._id}/edit`}
                      startIcon={<EditIcon />}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      component={Link} 
                      to={`/forms/${form._id}/responses`}
                    >
                      View Responses
                    </Button>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleDeleteForm(form._id)}
                      sx={{ ml: 'auto' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard; 
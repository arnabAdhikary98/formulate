import React, { useState } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  IconButton, 
  TextField, 
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';

const FormPageTabs = ({ 
  pages, 
  activePageIndex, 
  onPageChange, 
  onPageUpdate, 
  onAddPage, 
  onDeletePage 
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Open the edit dialog for a page
  const handleEditPage = (pageIndex) => {
    setEditingPage(pageIndex);
    setEditTitle(pages[pageIndex].title);
    setEditDescription(pages[pageIndex].description);
    setEditDialogOpen(true);
  };

  // Save the edited page
  const handleSavePageEdit = () => {
    if (editTitle.trim()) {
      onPageUpdate(editingPage, 'title', editTitle);
      onPageUpdate(editingPage, 'description', editDescription);
      setEditDialogOpen(false);
    }
  };

  // Handle page tab change
  const handleTabChange = (event, newValue) => {
    onPageChange(newValue);
  };

  // Confirm page deletion
  const confirmDeletePage = (pageIndex) => {
    if (pages.length > 1 && window.confirm('Are you sure you want to delete this page?')) {
      onDeletePage(pageIndex);
    }
  };

  return (
    <>
      <Paper 
        elevation={0} 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3,
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          overflow: 'hidden'
        }}
      >
        <Tabs 
          value={activePageIndex} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            flex: 1,
            '& .MuiTabs-flexContainer': {
              height: '100%'
            }
          }}
        >
          {pages.map((page, index) => (
            <Tab 
              key={index} 
              label={
                <Box display="flex" alignItems="center">
                  <span>{page.title}</span>
                  <span 
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditPage(index);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        handleEditPage(index);
                      }
                    }}
                    style={{ 
                      cursor: 'pointer', 
                      marginLeft: '8px',
                      display: 'inline-flex'
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </span>
                  {pages.length > 1 && (
                    <span 
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDeletePage(index);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          confirmDeletePage(index);
                        }
                      }}
                      style={{ 
                        cursor: 'pointer', 
                        marginLeft: '4px',
                        display: 'inline-flex'
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </span>
                  )}
                </Box>
              }
              sx={{ height: '100%' }}
            />
          ))}
        </Tabs>
        <Box 
          sx={{ 
            borderLeft: '1px solid #e0e0e0', 
            display: 'flex', 
            alignItems: 'center', 
            px: 1 
          }}
        >
          <IconButton 
            color="primary" 
            onClick={onAddPage}
            title="Add new page"
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Edit Page Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Page</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="Page Title"
              fullWidth
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              margin="normal"
              error={!editTitle.trim()}
              helperText={!editTitle.trim() ? 'Title is required' : ''}
            />
            <TextField
              label="Page Description"
              fullWidth
              multiline
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSavePageEdit} 
            variant="contained" 
            disabled={!editTitle.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FormPageTabs; 
import React, { useState, useEffect } from 'react';
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
  Typography,
  useMediaQuery,
  useTheme,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const FormPageTabs = ({ 
  pages, 
  activePageIndex, 
  onPageChange, 
  onPageUpdate, 
  onAddPage, 
  onDeletePage 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
    // Ensure newValue is within valid range
    if (newValue >= 0 && newValue < pages.length) {
      onPageChange(newValue);
    }
  };

  // Force update when pages or activePageIndex changes
  useEffect(() => {
    // Ensure activePageIndex is valid
    if (activePageIndex >= pages.length) {
      onPageChange(pages.length - 1);
    }
  }, [pages.length, activePageIndex, onPageChange]);

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
          allowScrollButtonsMobile
          sx={{ 
            flex: 1,
            '& .MuiTabs-flexContainer': {
              height: '100%'
            },
            '& .MuiTab-root': {
              minWidth: isMobile ? 80 : 120,
              padding: isMobile ? '6px 10px' : '12px 16px'
            }
          }}
        >
          {pages.map((page, index) => (
            <Tab 
              key={index} 
              label={
                <Box 
                  display="flex" 
                  alignItems="center" 
                  sx={{ 
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    flexWrap: 'nowrap'
                  }}
                >
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {page.title}
                  </span>
                  {!isMobile && (
                    <>
                      <Tooltip title="Edit page">
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
                      </Tooltip>
                      {pages.length > 1 && (
                        <Tooltip title="Delete page">
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
                        </Tooltip>
                      )}
                    </>
                  )}
                </Box>
              }
              sx={{ height: '100%' }}
              onClick={isMobile && index === activePageIndex ? () => handleEditPage(index) : undefined}
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
          <Tooltip title="Add new page">
            <IconButton 
              color="primary" 
              onClick={onAddPage}
              size={isMobile ? "small" : "medium"}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Context menu for active page on mobile */}
      {isMobile && activePageIndex !== null && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            mb: 2 
          }}
        >
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => handleEditPage(activePageIndex)}
            sx={{ mr: 1 }}
          >
            Edit Page
          </Button>
          {pages.length > 1 && (
            <Button
              size="small"
              startIcon={<DeleteIcon />}
              color="error"
              onClick={() => confirmDeletePage(activePageIndex)}
            >
              Delete
            </Button>
          )}
        </Box>
      )}

      {/* Edit Page Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        fullScreen={isMobile}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Edit Page</Typography>
            <IconButton edge="end" color="inherit" onClick={() => setEditDialogOpen(false)} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
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
        <DialogActions sx={{ p: isMobile ? 2 : 1 }}>
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
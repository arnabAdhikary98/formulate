import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Chip,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Menu,
  Card,
  CardContent,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ButtonGroup
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  FileDownload as DownloadIcon,
  FilterList as FilterIcon,
  ClearAll as ClearIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import ReactWordcloud from 'react-wordcloud';
import * as XLSX from 'xlsx';

import { getFormById } from '../api/forms';
import { getFormResponses, getResponseSummary, deleteResponse } from '../api/responses';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const FormResponses = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);

  // Load form and responses data
  useEffect(() => {
    const loadData = async () => {
      try {
        const formData = await getFormById(formId);
        setForm(formData);
        
        const responsesData = await getFormResponses(formId);
        setResponses(responsesData);
        
        const summaryData = await getResponseSummary(formId);
        setSummary(summaryData);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load form responses');
        setLoading(false);
      }
    };
    
    loadData();
  }, [formId]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Handle search
  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  // Handle opening filter menu
  const handleOpenFilterMenu = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  // Handle closing filter menu
  const handleCloseFilterMenu = () => {
    setFilterMenuAnchor(null);
  };

  // Handle setting a filter
  const handleSetFilter = (fieldId, value) => {
    setFilters({
      ...filters,
      [fieldId]: value
    });
    handleCloseFilterMenu();
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    setFilters({});
  };

  // Handle opening action menu for a response
  const handleOpenActionMenu = (event, response) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedResponse(response);
  };

  // Handle closing action menu
  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
    setSelectedResponse(null);
  };

  // Handle deleting a response
  const handleDeleteResponse = async () => {
    if (!selectedResponse) return;
    
    try {
      await deleteResponse(selectedResponse._id);
      setResponses(responses.filter(r => r._id !== selectedResponse._id));
      handleCloseActionMenu();
    } catch (err) {
      setError('Failed to delete response');
    }
  };

  // Handle exporting responses as CSV
  const handleExportCSV = () => {
    if (!responses.length) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Create header row
    const headers = ["Submission Date", "Email"];
    const allFields = form.pages.flatMap(page => page.fields);
    allFields.forEach(field => {
      headers.push(field.label);
    });
    csvContent += headers.join(",") + "\\n";
    
    // Add data rows
    responses.forEach(response => {
      const rowData = [
        new Date(response.completedAt).toLocaleString(),
        response.respondentEmail || ""
      ];
      
      allFields.forEach(field => {
        const answer = response.answers.find(a => a.fieldId === field._id);
        let value = answer ? answer.value : "";
        
        // Handle array values (checkbox)
        if (Array.isArray(value)) {
          value = `"${value.join(', ')}"`;
        } 
        // Escape values with commas
        else if (typeof value === 'string' && value.includes(',')) {
          value = `"${value}"`;
        }
        
        rowData.push(value);
      });
      
      csvContent += rowData.join(",") + "\\n";
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${form.title}_responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle exporting responses as XLSX
  const handleExportXLSX = () => {
    if (!responses.length) return;
    
    const allFields = form.pages.flatMap(page => page.fields);
    
    // Create headers
    const headers = ["Submission Date", "Email"];
    allFields.forEach(field => {
      headers.push(field.label);
    });
    
    // Create data rows
    const data = [headers];
    
    responses.forEach(response => {
      const rowData = [
        new Date(response.completedAt).toLocaleString(),
        response.respondentEmail || ""
      ];
      
      allFields.forEach(field => {
        const answer = response.answers.find(a => a.fieldId === field._id);
        let value = answer ? answer.value : "";
        
        // Handle array values (checkbox)
        if (Array.isArray(value)) {
          value = value.join(', ');
        }
        
        rowData.push(value);
      });
      
      data.push(rowData);
    });
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Responses");
    
    // Save file
    XLSX.writeFile(wb, `${form.title}_responses.xlsx`);
  };

  // Toggle export options menu
  const handleOpenExportMenu = (event) => {
    setExportMenuAnchor(event.currentTarget);
  };
  
  const handleCloseExportMenu = () => {
    setExportMenuAnchor(null);
  };

  // Filter responses based on search and filters
  const filteredResponses = responses.filter(response => {
    // Apply search filter
    if (search && !JSON.stringify(response).toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    // Apply date range filter
    if (dateRange.start && new Date(response.completedAt) < new Date(dateRange.start)) {
      return false;
    }
    
    if (dateRange.end) {
      // Add one day to include the end date fully
      const endDate = new Date(dateRange.end);
      endDate.setDate(endDate.getDate() + 1);
      if (new Date(response.completedAt) > endDate) {
        return false;
      }
    }
    
    // Apply field filters
    for (const fieldId in filters) {
      if (filters[fieldId]) {
        const answer = response.answers.find(a => a.fieldId === fieldId);
        if (!answer || !String(answer.value).includes(filters[fieldId])) {
          return false;
        }
      }
    }
    
    return true;
  });

  // Toggle date filter display
  const toggleDateFilter = () => {
    setShowDateFilter(!showDateFilter);
  };

  // Handle date range change
  const handleDateRangeChange = (field, value) => {
    setDateRange({
      ...dateRange,
      [field]: value
    });
  };

  // Clear date range
  const clearDateRange = () => {
    setDateRange({ start: '', end: '' });
  };

  // Render charts for summary data
  const renderCharts = () => {
    if (!summary || !form) return null;

    const allFields = form.pages.flatMap(page => page.fields);
    
    return (
      <Grid container spacing={3}>
        {/* Responses over time */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Responses Over Time
            </Typography>
            {summary.responseOverTime && (
              <Line
                data={{
                  labels: Object.keys(summary.responseOverTime),
                  datasets: [
                    {
                      label: 'Responses',
                      data: Object.values(summary.responseOverTime),
                      borderColor: 'rgb(75, 192, 192)',
                      tension: 0.1
                    }
                  ]
                }}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0
                      }
                    }
                  }
                }}
              />
            )}
          </Paper>
        </Grid>
        
        {/* Charts for each field */}
        {allFields.map((field) => {
          const fieldSummary = summary.fieldSummaries && summary.fieldSummaries[field._id];
          if (!fieldSummary) return null;
          
          switch (field.type) {
            case 'radio':
            case 'dropdown':
              return (
                <Grid item xs={12} md={6} key={field._id}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      {field.label}
                    </Typography>
                    <Box height={300}>
                      <Pie
                        data={{
                          labels: Object.keys(fieldSummary.counts || {}),
                          datasets: [
                            {
                              data: Object.values(fieldSummary.counts || {}),
                              backgroundColor: [
                                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                                '#FF9F40', '#8AC249', '#EA526F', '#25CCF7', '#FD7272'
                              ]
                            }
                          ]
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
              );
            
            case 'checkbox':
              return (
                <Grid item xs={12} md={6} key={field._id}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      {field.label}
                    </Typography>
                    <Box height={300}>
                      <Bar
                        data={{
                          labels: Object.keys(fieldSummary.counts || {}),
                          datasets: [
                            {
                              label: 'Responses',
                              data: Object.values(fieldSummary.counts || {}),
                              backgroundColor: '#36A2EB'
                            }
                          ]
                        }}
                        options={{
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                precision: 0
                              }
                            }
                          }
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
              );
            
            case 'number':
            case 'rating':
              return (
                <Grid item xs={12} md={6} key={field._id}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      {field.label}
                    </Typography>
                    <Box height={300}>
                      <Bar
                        data={{
                          labels: Object.keys(fieldSummary.distribution || {}),
                          datasets: [
                            {
                              label: 'Responses',
                              data: Object.values(fieldSummary.distribution || {}),
                              backgroundColor: '#4BC0C0'
                            }
                          ]
                        }}
                        options={{
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                precision: 0
                              }
                            }
                          }
                        }}
                      />
                    </Box>
                    {fieldSummary.average !== undefined && (
                      <Box mt={2}>
                        <Typography variant="body2">
                          Average: {fieldSummary.average.toFixed(2)}
                        </Typography>
                        {fieldSummary.median !== undefined && (
                          <Typography variant="body2">
                            Median: {fieldSummary.median}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Paper>
                </Grid>
              );
            
            case 'text':
            case 'textarea':
              // Check if we have wordCloud data
              if (fieldSummary.wordCloud && Object.keys(fieldSummary.wordCloud).length > 0) {
                // Convert to the format required by react-wordcloud
                const words = Object.entries(fieldSummary.wordCloud).map(([text, value]) => ({
                  text,
                  value
                }));
                
                // Only render if we have words
                if (words.length > 0) {
                  return (
                    <Grid item xs={12} md={6} key={field._id}>
                      <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                          {field.label} - Word Cloud
                        </Typography>
                        <Box height={300}>
                          <ReactWordcloud
                            words={words}
                            options={{
                              fontSizes: [10, 60],
                              rotations: 2,
                              rotationAngles: [0, 90],
                              fontFamily: 'Arial',
                              colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b']
                            }}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  );
                }
              }
              return null;
            
            default:
              return null;
          }
        })}
      </Grid>
    );
  };

  // Render table view of responses
  const renderTable = () => {
    if (!form) return null;
    
    const allFields = form.pages.flatMap(page => page.fields);
    
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <TextField
            placeholder="Search responses..."
            value={search}
            onChange={handleSearch}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="clear search"
                    onClick={() => setSearch('')}
                    edge="end"
                    size="small"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <Box>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleOpenFilterMenu}
              sx={{ mr: 1 }}
              disabled={!allFields.length}
            >
              Filter
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleOpenExportMenu}
              disabled={!responses.length}
            >
              Export
            </Button>
          </Box>
        </Box>
        
        {Object.keys(filters).length > 0 && (
          <Box display="flex" alignItems="center" mb={2} flexWrap="wrap">
            <Typography variant="body2" color="textSecondary" mr={1}>
              Active Filters:
            </Typography>
            
            {Object.entries(filters).map(([fieldId, value]) => {
              const field = allFields.find(f => f._id === fieldId);
              if (!field) return null;
              
              return (
                <Chip
                  key={fieldId}
                  label={`${field.label}: ${value}`}
                  onDelete={() => setFilters({ ...filters, [fieldId]: '' })}
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
              );
            })}
            
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              sx={{ mb: 1 }}
            >
              Clear All
            </Button>
          </Box>
        )}
        
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Email</TableCell>
                {allFields.map(field => (
                  <TableCell key={field._id}>{field.label}</TableCell>
                ))}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredResponses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={allFields.length + 3} align="center">
                    No responses found
                  </TableCell>
                </TableRow>
              ) : (
                filteredResponses.map(response => (
                  <TableRow key={response._id}>
                    <TableCell>
                      {new Date(response.completedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {response.respondentEmail || '—'}
                    </TableCell>
                    
                    {allFields.map(field => {
                      const answer = response.answers.find(a => a.fieldId === field._id);
                      
                      return (
                        <TableCell key={field._id}>
                          {answer ? (
                            Array.isArray(answer.value) 
                              ? answer.value.join(', ')
                              : String(answer.value)
                          ) : '—'}
                        </TableCell>
                      );
                    })}
                    
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenActionMenu(e, response)}
                      >
                        <MoreIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box py={4}>
          <Alert severity="error">{error}</Alert>
          <Button
            component={Link}
            to="/dashboard"
            startIcon={<ArrowBackIcon />}
            sx={{ mt: 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Button
              component={Link}
              to="/dashboard"
              startIcon={<ArrowBackIcon />}
              sx={{ mb: 1 }}
            >
              Back to Dashboard
            </Button>
            <Typography variant="h4" component="h1">
              {form?.title || 'Form Responses'}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {responses.length} {responses.length === 1 ? 'response' : 'responses'} received
            </Typography>
          </Box>
          <Box>
            <Button
              variant="outlined"
              component={Link}
              to={`/forms/${formId}/edit`}
              sx={{ mr: 1 }}
            >
              Edit Form
            </Button>
            <Button
              variant="outlined"
              component={Link}
              to={`/forms/${formId}/preview`}
              startIcon={<ViewIcon />}
            >
              Preview Form
            </Button>
          </Box>
        </Box>

        <Paper sx={{ mb: 4 }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="Summary" />
            <Tab label="All Responses" />
          </Tabs>
          <Divider />
          
          <Box p={3}>
            {currentTab === 0 && (
              responses.length === 0 ? (
                <Box py={4} textAlign="center">
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No responses yet
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Share your form to start collecting responses
                  </Typography>
                </Box>
              ) : (
                renderCharts()
              )
            )}
            
            {currentTab === 1 && renderTable()}
          </Box>
        </Paper>
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={handleCloseFilterMenu}
      >
        {form && form.pages.flatMap(page => page.fields).map(field => (
          <MenuItem 
            key={field._id} 
            onClick={() => setSelectedField(field)}
            dense
          >
            {field.label}
          </MenuItem>
        ))}
      </Menu>

      {/* Filter Dialog */}
      {selectedField && (
        <Dialog
          open={!!selectedField}
          onClose={() => setSelectedField(null)}
          maxWidth="xs"
          fullWidth
        >
          <Box p={2}>
            <Typography variant="h6" gutterBottom>
              Filter by {selectedField.label}
            </Typography>
            
            {selectedField.type === 'dropdown' || selectedField.type === 'radio' ? (
              <FormControl fullWidth>
                <InputLabel>Select Value</InputLabel>
                <Select
                  value={filters[selectedField._id] || ''}
                  onChange={(e) => handleSetFilter(selectedField._id, e.target.value)}
                >
                  <MenuItem value="">Any</MenuItem>
                  {selectedField.options && selectedField.options.map((option, idx) => (
                    <MenuItem key={idx} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                fullWidth
                label="Filter Value"
                value={filters[selectedField._id] || ''}
                onChange={(e) => handleSetFilter(selectedField._id, e.target.value)}
              />
            )}
            
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button onClick={() => setSelectedField(null)}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={() => setSelectedField(null)}
                sx={{ ml: 1 }}
              >
                Apply
              </Button>
            </Box>
          </Box>
        </Dialog>
      )}

      {/* Response Actions Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleCloseActionMenu}
      >
        <MenuItem 
          onClick={handleDeleteResponse}
          dense
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Response
        </MenuItem>
      </Menu>

      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleCloseExportMenu}
      >
        <MenuItem 
          onClick={() => {
            handleExportCSV();
            handleCloseExportMenu();
          }}
          dense
        >
          Export as CSV
        </MenuItem>
        <MenuItem 
          onClick={() => {
            handleExportXLSX();
            handleCloseExportMenu();
          }}
          dense
        >
          Export as Excel (XLSX)
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default FormResponses; 
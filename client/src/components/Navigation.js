import React, { useState, useContext } from 'react';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  IconButton, 
  Typography, 
  Menu, 
  Container, 
  Avatar, 
  Button, 
  Tooltip, 
  MenuItem,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  BarChart as BarChartIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navigation = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleToggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleCloseMobileDrawer = () => {
    setMobileDrawerOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleCloseUserMenu();
    handleCloseMobileDrawer();
  };
  
  const navigateToHome = () => {
    navigate('/');
    handleCloseMobileDrawer();
  };

  const mobileDrawer = (
    <Drawer
      anchor="left"
      open={mobileDrawerOpen}
      onClose={handleCloseMobileDrawer}
      sx={{
        '& .MuiDrawer-paper': { 
          width: 250,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.default
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <BarChartIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
          FORMULATE
        </Typography>
      </Box>
      <Divider />
      
      {isAuthenticated && (
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 2, backgroundColor: theme.palette.primary.main }}>
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle1">{user?.name}</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
              {user?.email}
            </Typography>
          </Box>
        </Box>
      )}
      
      <List>
        <ListItem button onClick={navigateToHome}>
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        
        {isAuthenticated ? (
          <>
            <ListItem button component={Link} to="/dashboard" onClick={handleCloseMobileDrawer}>
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button component={Link} to="/forms/create" onClick={handleCloseMobileDrawer}>
              <ListItemIcon><AddIcon /></ListItemIcon>
              <ListItemText primary="Create Form" />
            </ListItem>
            <ListItem button component={Link} to="/profile" onClick={handleCloseMobileDrawer}>
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem button component={Link} to="/login" onClick={handleCloseMobileDrawer}>
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem button component={Link} to="/register" onClick={handleCloseMobileDrawer}>
              <ListItemIcon><AddIcon /></ListItemIcon>
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
      </List>
    </Drawer>
  );

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ display: 'flex', flexWrap: 'nowrap' }}>
          {/* Menu button for mobile */}
          <IconButton
            aria-label="open drawer"
            edge="start"
            onClick={handleToggleMobileDrawer}
            color="inherit"
            sx={{ mr: 1, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Logo and brand */}
          <IconButton
            onClick={navigateToHome}
            sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}
            color="inherit"
          >
            <BarChartIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="a"
            onClick={navigateToHome}
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              cursor: 'pointer',
              flexGrow: { xs: 1, md: 0 }
            }}
          >
            FORMULATE
          </Typography>
          
          {/* Desktop navigation links */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Button
              onClick={navigateToHome}
              sx={{ color: 'white', display: 'block' }}
            >
              Home
            </Button>
            
            {isAuthenticated && (
              <>
                <Button
                  component={Link}
                  to="/dashboard"
                  sx={{ color: 'white', display: 'block' }}
                >
                  Dashboard
                </Button>
                <Button
                  component={Link}
                  to="/forms/create"
                  sx={{ color: 'white', display: 'block' }}
                >
                  Create Form
                </Button>
              </>
            )}
          </Box>

          {/* User menu or auth buttons - show on all screen sizes */}
          {isAuthenticated ? (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Account settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt={user?.name} sx={{ bgcolor: 'secondary.main' }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem component={Link} to="/profile" onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">Profile</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            // Login/Register buttons - Only show on desktop
            <Box sx={{ 
              display: { xs: 'none', sm: 'flex' }, 
              alignItems: 'center',
              gap: 1
            }}>
              <Button
                component={Link}
                to="/login"
                sx={{ color: 'white' }}
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="outlined"
                sx={{ color: 'white', borderColor: 'white' }}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
      {mobileDrawer}
    </AppBar>
  );
};

export default Navigation; 
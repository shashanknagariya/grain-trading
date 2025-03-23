import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  BottomNavigation,
  BottomNavigationAction,
  Paper
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { navigationItems } from './navigationConfig';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import { useNavigationState } from '../../hooks/useNavigationState';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { 
    currentRoute,
    previousRoute,
    goBack,
    getLastVisited 
  } = useNavigationState();
  
  // Get current route for bottom navigation
  const currentSection = currentRoute.split('/')[1] || 'dashboard';

  const mainNavigationItems = navigationItems.slice(0, 4); // Only show main items in bottom nav

  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeGesture({
    onSwipeRight: () => setDrawerOpen(true),
    onSwipeLeft: () => setDrawerOpen(false),
  });

  return (
    <Box 
      component="div"
      sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <AppBar position="fixed">
        <Toolbar>
          {previousRoute && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={goBack}
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <IconButton
            color="inherit"
            edge={!previousRoute ? "start" : false}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            BPMP
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <List>
          {navigationItems.map((item) => {
            const lastVisited = getLastVisited(item.path);
            return (
              <ListItem
                button
                key={item.path}
                selected={currentRoute === item.path}
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  secondary={lastVisited && `Last visited: ${new Date(lastVisited).toLocaleDateString()}`}
                />
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          mt: 8, // Space for AppBar
          mb: 7, // Space for bottom navigation
          overflow: 'auto'
        }}
      >
        {children}
      </Box>

      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000
        }}
        elevation={3}
      >
        <BottomNavigation
          value={currentSection}
          onChange={(_, newValue) => {
            navigate(`/${newValue}`);
          }}
        >
          {mainNavigationItems.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              value={item.path.replace('/', '')}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default MobileLayout; 
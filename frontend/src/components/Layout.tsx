import React from 'react';
import type { FC } from 'react';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemText, Button, ListItemIcon } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PermissionGuard } from './PermissionGuard';
import { Permissions } from '../constants/permissions';
import {
  Dashboard as DashboardIcon,
  ShoppingCart as PurchaseIcon,
  Store as SaleIcon,
  Inventory as InventoryIcon,
  Grain as GrainIcon,
  Warehouse as WarehouseIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { usePermission } from '../hooks/usePermission';

interface LayoutProps {
  children: React.ReactNode;
}

const DRAWER_WIDTH = 240;

export const Layout: FC<LayoutProps> = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Purchases', icon: <PurchaseIcon />, path: '/purchases', permission: Permissions.MAKE_PURCHASE },
    { text: 'Sales', icon: <SaleIcon />, path: '/sales', permission: Permissions.MAKE_SALE },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory', permission: Permissions.MANAGE_INVENTORY },
    { text: 'Grains', icon: <GrainIcon />, path: '/grains', permission: Permissions.MANAGE_INVENTORY },
    { text: 'Godowns', icon: <WarehouseIcon />, path: '/godowns', permission: Permissions.MANAGE_INVENTORY },
    { text: 'Users', icon: <PeopleIcon />, path: '/users', permission: Permissions.MANAGE_USERS }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Grain Trading System</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1">
              {user?.username}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            item.permission ? (
              <PermissionGuard key={item.text} permission={item.permission}>
                <ListItem button component={Link} to={item.path}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              </PermissionGuard>
            ) : (
              <ListItem button key={item.text} component={Link} to={item.path}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            )
          ))}
        </List>
      </Drawer>
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 
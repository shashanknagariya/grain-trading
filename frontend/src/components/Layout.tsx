import React, { useState } from 'react';
import type { FC } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  Button, 
  ListItemIcon,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PermissionGuard } from './PermissionGuard';
import { Permissions } from '../constants/permissions';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import {
  Dashboard as DashboardIcon,
  ShoppingCart as PurchaseIcon,
  Store as SaleIcon,
  Inventory as InventoryIcon,
  Grain as GrainIcon,
  Warehouse as WarehouseIcon,
  People as PeopleIcon,
  Menu as MenuIcon,
  KeyboardVoice as KeyboardVoiceIcon
} from '@mui/icons-material';

interface LayoutProps {
  children: React.ReactNode;
}

const DRAWER_WIDTH = 240;

export const Layout: FC<LayoutProps> = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: t('navigation.dashboard'), icon: <DashboardIcon />, path: '/dashboard', permission: Permissions.READ_ALL },
    { text: t('navigation.purchases'), icon: <PurchaseIcon />, path: '/purchases', permission: Permissions.READ_ALL },
    { text: t('navigation.sales'), icon: <SaleIcon />, path: '/sales', permission: Permissions.MAKE_SALE },
    { text: t('navigation.inventory'), icon: <InventoryIcon />, path: '/inventory', permission: Permissions.MANAGE_INVENTORY },
    { text: t('navigation.grains'), icon: <GrainIcon />, path: '/grains', permission: Permissions.READ_ALL },
    { text: t('navigation.godowns'), icon: <WarehouseIcon />, path: '/godowns', permission: Permissions.READ_ALL },
    { text: t('navigation.users'), icon: <PeopleIcon />, path: '/users', permission: Permissions.MANAGE_USERS },
    { text: t('navigation.voice_bill'), icon: <KeyboardVoiceIcon />, path: '/voice-bill', permission: Permissions.CREATE_PURCHASE }
  ];

  const drawer = (
    <Box>
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <PermissionGuard key={item.path} permission={item.permission}>
              <ListItem 
                button 
                component={Link} 
                to={item.path}
                onClick={isMobile ? handleDrawerToggle : undefined}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            </PermissionGuard>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` }
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6">{t('common.title')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LanguageSwitcher />
            <Typography 
              variant="body1" 
              sx={{ 
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {user?.username}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              {t('common.logout')}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH 
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH 
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` }
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
import React from 'react';
import { Box } from '@mui/material';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import DesktopLayout from './DesktopLayout';
import MobileLayout from './MobileLayout';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isMobileView } = useResponsiveLayout();

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      {isMobileView ? (
        <MobileLayout>{children}</MobileLayout>
      ) : (
        <DesktopLayout>{children}</DesktopLayout>
      )}
    </Box>
  );
};

export default Layout; 
import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Collapse,
  useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  noPadding?: boolean;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultExpanded = false,
  noPadding = false
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { isMobileView } = useResponsiveLayout();
  const theme = useTheme();

  return (
    <Box 
      sx={{ 
        mb: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden'
      }}
    >
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          cursor: 'pointer',
          bgcolor: 'background.default',
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
      >
        <Typography variant={isMobileView ? 'subtitle1' : 'h6'}>
          {title}
        </Typography>
        <IconButton
          size={isMobileView ? 'small' : 'medium'}
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: theme.transitions.create('transform')
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: noPadding ? 0 : 2 }}>
          {children}
        </Box>
      </Collapse>
    </Box>
  );
}; 
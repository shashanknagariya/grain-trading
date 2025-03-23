import React from 'react';
import { Box, Skeleton, useTheme } from '@mui/material';

interface SkeletonConfig {
  type: 'text' | 'rectangular' | 'circular';
  width?: number | string;
  height?: number | string;
  repeat?: number;
}

interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'table' | 'custom';
  config?: SkeletonConfig[];
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'card',
  config,
  count = 1
}) => {
  const theme = useTheme();

  const getDefaultConfig = (): SkeletonConfig[] => {
    switch (variant) {
      case 'card':
        return [
          { type: 'rectangular', width: '100%', height: 200 },
          { type: 'text', width: '80%', height: 20 },
          { type: 'text', width: '60%', height: 20 }
        ];
      case 'list':
        return [
          { type: 'text', width: '100%', height: 40, repeat: 5 }
        ];
      case 'table':
        return [
          { type: 'rectangular', width: '100%', height: 40 },
          { type: 'rectangular', width: '100%', height: 40, repeat: 5 }
        ];
      default:
        return config || [];
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {Array(count).fill(null).map((_, index) => (
        <Box
          key={index}
          sx={{
            p: 2,
            mb: 2,
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: theme.shadows[1]
          }}
        >
          {getDefaultConfig().map((config, configIndex) => (
            <React.Fragment key={configIndex}>
              {Array(config.repeat || 1).fill(null).map((_, repeatIndex) => (
                <Skeleton
                  key={repeatIndex}
                  variant={config.type}
                  width={config.width}
                  height={config.height}
                  sx={{ mb: 1 }}
                />
              ))}
            </React.Fragment>
          ))}
        </Box>
      ))}
    </Box>
  );
}; 
import React, { useState, useRef, useEffect } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';

interface TextOverflowProps {
  text: string;
  maxWidth?: string | number;
  maxLines?: number;
  variant?: 'body1' | 'body2' | 'subtitle1' | 'subtitle2' | 'caption';
  component?: 'p' | 'span' | 'div';
}

export const TextOverflow: React.FC<TextOverflowProps> = ({
  text,
  maxWidth = '100%',
  maxLines = 1,
  variant = 'body1',
  component = 'div'
}) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      const element = textRef.current;
      if (element) {
        const isTextOverflowing = 
          element.scrollHeight > element.clientHeight ||
          element.scrollWidth > element.clientWidth;
        setIsOverflowing(isTextOverflowing);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  return (
    <Tooltip title={isOverflowing ? text : ''} arrow>
      <Box
        sx={{
          maxWidth,
          width: '100%'
        }}
      >
        <Typography
          ref={textRef}
          variant={variant}
          component={component}
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: maxLines,
            WebkitBoxOrient: 'vertical',
            wordBreak: 'break-word'
          }}
        >
          {text}
        </Typography>
      </Box>
    </Tooltip>
  );
}; 
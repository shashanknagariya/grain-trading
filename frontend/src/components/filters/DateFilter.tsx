import React from 'react';
import {
  TextField,
  IconButton,
  InputAdornment,
  Box,
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface DateFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  startLabel?: string;
  endLabel?: string;
}

export const DateFilter: React.FC<DateFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startLabel,
  endLabel,
}) => {
  const { t } = useTranslation();

  const handleClearStart = () => {
    onStartDateChange('');
  };

  const handleClearEnd = () => {
    onEndDateChange('');
  };

  return (
    <Box display="flex" gap={1}>
      <TextField
        type="date"
        size="small"
        label={startLabel || t('common.start_date')}
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: startDate ? (
            <InputAdornment position="end">
              <IconButton
                aria-label={t('common.clear')}
                onClick={handleClearStart}
                edge="end"
                size="small"
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />
      <TextField
        type="date"
        size="small"
        label={endLabel || t('common.end_date')}
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: endDate ? (
            <InputAdornment position="end">
              <IconButton
                aria-label={t('common.clear')}
                onClick={handleClearEnd}
                edge="end"
                size="small"
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />
    </Box>
  );
};

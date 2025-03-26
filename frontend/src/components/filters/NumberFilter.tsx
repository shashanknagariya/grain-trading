import React from 'react';
import {
  TextField,
  IconButton,
  InputAdornment,
  Box,
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';

interface NumberFilterProps {
  minValue: string;
  maxValue: string;
  onMinValueChange: (value: string) => void;
  onMaxValueChange: (value: string) => void;
  minLabel?: string;
  maxLabel?: string;
  debounceMs?: number;
}

export const NumberFilter: React.FC<NumberFilterProps> = ({
  minValue,
  maxValue,
  onMinValueChange,
  onMaxValueChange,
  minLabel,
  maxLabel,
  debounceMs = 300,
}) => {
  const { t } = useTranslation();
  const [localMinValue, setLocalMinValue] = React.useState(minValue);
  const [localMaxValue, setLocalMaxValue] = React.useState(maxValue);

  // Create debounced versions of change handlers
  const debouncedMinChange = React.useMemo(
    () => debounce(onMinValueChange, debounceMs),
    [onMinValueChange, debounceMs]
  );

  const debouncedMaxChange = React.useMemo(
    () => debounce(onMaxValueChange, debounceMs),
    [onMaxValueChange, debounceMs]
  );

  // Update local values when prop values change
  React.useEffect(() => {
    setLocalMinValue(minValue);
  }, [minValue]);

  React.useEffect(() => {
    setLocalMaxValue(maxValue);
  }, [maxValue]);

  // Cleanup debounce on unmount
  React.useEffect(() => {
    return () => {
      debouncedMinChange.cancel();
      debouncedMaxChange.cancel();
    };
  }, [debouncedMinChange, debouncedMaxChange]);

  const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
      setLocalMinValue(newValue);
      debouncedMinChange(newValue);
    }
  };

  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
      setLocalMaxValue(newValue);
      debouncedMaxChange(newValue);
    }
  };

  const handleClearMin = () => {
    setLocalMinValue('');
    onMinValueChange('');
  };

  const handleClearMax = () => {
    setLocalMaxValue('');
    onMaxValueChange('');
  };

  return (
    <Box display="flex" gap={1}>
      <TextField
        type="text"
        size="small"
        label={minLabel || t('common.min_value')}
        value={localMinValue}
        onChange={handleMinChange}
        InputProps={{
          endAdornment: localMinValue ? (
            <InputAdornment position="end">
              <IconButton
                aria-label={t('common.clear')}
                onClick={handleClearMin}
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
        type="text"
        size="small"
        label={maxLabel || t('common.max_value')}
        value={localMaxValue}
        onChange={handleMaxChange}
        InputProps={{
          endAdornment: localMaxValue ? (
            <InputAdornment position="end">
              <IconButton
                aria-label={t('common.clear')}
                onClick={handleClearMax}
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

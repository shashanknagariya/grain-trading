import React from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';

interface TextFilterProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  debounceMs?: number;
}

export const TextFilter: React.FC<TextFilterProps> = ({
  value,
  onChange,
  label,
  placeholder,
  debounceMs = 300,
}) => {
  const { t } = useTranslation();
  const [localValue, setLocalValue] = React.useState(value);

  // Create a debounced version of onChange
  const debouncedOnChange = React.useMemo(
    () => debounce(onChange, debounceMs),
    [onChange, debounceMs]
  );

  // Update local value when prop value changes
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Cleanup debounce on unmount
  React.useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <TextField
      fullWidth
      size="small"
      label={label}
      placeholder={placeholder || t('common.search')}
      value={localValue}
      onChange={handleChange}
      variant="outlined"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
        endAdornment: localValue ? (
          <InputAdornment position="end">
            <IconButton
              aria-label={t('common.clear')}
              onClick={handleClear}
              edge="end"
              size="small"
            >
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
    />
  );
};

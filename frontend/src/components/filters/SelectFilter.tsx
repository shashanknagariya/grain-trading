import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  SelectChangeEvent,
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Option {
  value: string;
  label: string;
}

interface SelectFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label: string;
  allowEmpty?: boolean;
  emptyOptionLabel?: string;
}

export const SelectFilter: React.FC<SelectFilterProps> = ({
  value,
  onChange,
  options,
  label,
  allowEmpty = true,
  emptyOptionLabel,
}) => {
  const { t } = useTranslation();

  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <FormControl size="small" fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        onChange={handleChange}
        label={label}
        endAdornment={
          value ? (
            <IconButton
              aria-label={t('common.clear')}
              onClick={handleClear}
              size="small"
              sx={{ mr: 2 }}
            >
              <ClearIcon />
            </IconButton>
          ) : null
        }
      >
        {allowEmpty && (
          <MenuItem value="">
            <em>{emptyOptionLabel || t('common.all')}</em>
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

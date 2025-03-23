import React from 'react';
import { Select, MenuItem, SelectChangeEvent } from '@mui/material';

interface PaymentStatus {
  value: string;
  label: string;
  color: string;
}

interface PaymentStatusDropdownProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const PAYMENT_STATUSES: PaymentStatus[] = [
  { value: 'pending', label: 'Pending', color: '#FFA500' },
  { value: 'paid', label: 'Paid', color: '#4CAF50' },
  { value: 'partial', label: 'Partial', color: '#2196F3' },
  { value: 'cancelled', label: 'Cancelled', color: '#F44336' }
];

export const PaymentStatusDropdown: React.FC<PaymentStatusDropdownProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      disabled={disabled}
      size="small"
      sx={{
        minWidth: 120,
        '& .MuiSelect-select': {
          color: PAYMENT_STATUSES.find(status => status.value === value)?.color
        }
      }}
    >
      {PAYMENT_STATUSES.map(status => (
        <MenuItem 
          key={status.value} 
          value={status.value}
          sx={{ color: status.color }}
        >
          {status.label}
        </MenuItem>
      ))}
    </Select>
  );
}; 
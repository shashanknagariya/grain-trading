import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import InputMask from 'react-input-mask';

interface MaskedTextFieldProps extends Omit<TextFieldProps, 'onChange'> {
  mask: string;
  onChange: (value: string) => void;
  value: string;
}

export const MaskedTextField: React.FC<MaskedTextFieldProps> = ({
  mask,
  onChange,
  value,
  ...props
}) => {
  return (
    <InputMask
      mask={mask}
      value={value || ''}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
    >
      {(inputProps: any) => <TextField {...props} {...inputProps} />}
    </InputMask>
  );
}; 
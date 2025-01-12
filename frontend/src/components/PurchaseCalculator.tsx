import React from 'react';
import type { FC } from 'react';
import { Box, Typography } from '@mui/material';

interface PurchaseCalculatorProps {
  numberOfBags: number;
  weightPerBag: number;
  extraWeight: number;
  ratePerKg: number;
}

export const PurchaseCalculator: FC<PurchaseCalculatorProps> = ({
  numberOfBags,
  weightPerBag,
  extraWeight,
  ratePerKg
}) => {
  const totalWeight = (numberOfBags * weightPerBag) + extraWeight;
  const totalAmount = totalWeight * ratePerKg;

  return (
    <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Typography variant="subtitle1" gutterBottom>
        Calculations
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <Typography>
          Total Weight: {totalWeight.toFixed(2)} kg
        </Typography>
        <Typography>
          Total Amount: ₹{totalAmount.toFixed(2)}
        </Typography>
      </Box>
    </Box>
  );
}; 
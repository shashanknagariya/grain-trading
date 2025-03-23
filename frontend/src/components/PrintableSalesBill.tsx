import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { formatCurrency, formatDate } from '../utils/formatters';

interface Sale {
  id: string;
  billNumber: string;
  date: Date;
  customerName: string;
  totalAmount: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface PrintableSalesBillProps {
  sale: Sale;
  companyInfo: {
    name: string;
    address: string;
    gstin: string;
    phone: string;
    email: string;
  };
}

export const PrintableSalesBill: React.FC<PrintableSalesBillProps> = ({ sale, companyInfo }) => {
  return (
    <Box sx={{ p: 3, '@media print': { p: 0 } }}>
      {/* Company Header */}
      <Typography variant="h5" align="center" gutterBottom>
        {companyInfo.name}
      </Typography>
      
      {/* Bill Details */}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Bill No.</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell align="right">Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>{sale.billNumber}</TableCell>
            <TableCell>{formatDate(sale.date)}</TableCell>
            <TableCell>{sale.customerName}</TableCell>
            <TableCell align="right">{formatCurrency(sale.totalAmount)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );
};

PrintableSalesBill.displayName = 'PrintableSalesBill'; 
import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
  Divider
} from '@mui/material';
import { formatCurrency, formatWeight } from '../utils/formatters';

interface PrintableSalesBillProps {
  sale: {
    bill_number: string;
    buyer_name: string;
    buyer_gst: string;
    transportation_mode: string;
    vehicle_number: string;
    driver_name: string;
    lr_number: string;
    po_number: string;
    grain_name: string;
    number_of_bags: number;
    weight_per_bag: number;
    rate_per_kg: number;
    total_weight: number;
    total_amount: number;
    sale_date: string;
  };
}

export const PrintableSalesBill = React.forwardRef<HTMLDivElement, PrintableSalesBillProps>(
  ({ sale }, ref) => {
    return (
      <Box ref={ref} className="printable-bill" sx={{ p: 4, bgcolor: 'white' }}>
        {/* Company Header */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} textAlign="center">
            <Typography variant="h4">Badri Prasad Mahesh Prasad Nagariya</Typography>
            <Typography>Ganj, chhatarpur, MP 471105</Typography>
            <Typography>Mobile: 7619595475</Typography>
            <Typography>GSTIN: 23AAXXXYYY8M1ZM</Typography>
            <Typography>PAN No: AAXXXYYY</Typography>
          </Grid>
        </Grid>

        <Typography variant="h5" textAlign="center" sx={{ my: 2 }}>
          BILL OF SUPPLY
        </Typography>

        {/* Bill Details Grid */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Box border={1} p={1}>
              <Typography><strong>Reverse Charge:</strong> No</Typography>
              <Typography><strong>Invoice No:</strong> {sale.bill_number}</Typography>
              <Typography><strong>State:</strong> Madhya Pradesh</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box border={1} p={1}>
              <Typography><strong>Transportation Mode:</strong> {sale.transportation_mode}</Typography>
              <Typography><strong>Vehicle No:</strong> {sale.vehicle_number}</Typography>
              <Typography><strong>Date of Supply:</strong> {new Date(sale.sale_date).toLocaleDateString()}</Typography>
              <Typography><strong>Driver:</strong> {sale.driver_name}</Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Buyer Details */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Box border={1} p={1}>
              <Typography variant="subtitle2">Details of Receiver / Billed to:</Typography>
              <Typography>Name: {sale.buyer_name}</Typography>
              <Typography>GSTIN: {sale.buyer_gst}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box border={1} p={1}>
              <Typography><strong>LR Number:</strong> {sale.lr_number}</Typography>
              <Typography><strong>PO Number:</strong> {sale.po_number}</Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Product Details Table */}
        <Table sx={{ mb: 3 }} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Sr No.</TableCell>
              <TableCell>Name of Product</TableCell>
              <TableCell>HSN/SAC</TableCell>
              <TableCell align="right">QTY</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell align="right">Rate</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>1</TableCell>
              <TableCell>{sale.grain_name}</TableCell>
              <TableCell>1001</TableCell>
              <TableCell align="right">{formatWeight(sale.total_weight)}</TableCell>
              <TableCell>QTL</TableCell>
              <TableCell align="right">{formatCurrency(sale.rate_per_kg)}/kg</TableCell>
              <TableCell align="right">{formatCurrency(sale.total_amount)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={5} />
              <TableCell align="right"><strong>Total Amount</strong></TableCell>
              <TableCell align="right">{formatCurrency(sale.total_amount)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Bank Details */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Bank Details:</Typography>
          <Typography>Bank Account Number: 50100016006894</Typography>
          <Typography>IFSC Code: HDFC0004550</Typography>
          <Typography>Bank Name: Punjab National Bank</Typography>
          <Typography>Bank Branch Name: SATNA, MADHYA NAGAR</Typography>
        </Box>

        {/* Terms and Conditions */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Terms and Conditions:</Typography>
          <Typography variant="body2">1. This is an electronically generated invoice.</Typography>
          <Typography variant="body2">2. All disputes are subject to bank jurisdiction.</Typography>
        </Box>

        {/* Signature */}
        <Box sx={{ mt: 4, textAlign: 'right' }}>
          <Typography>For, BADRI PRASAD MAHESH PRASAD NAGARIYA</Typography>
          <Box sx={{ mt: 8 }}>
            <Typography>Authorized Signatory</Typography>
          </Box>
        </Box>
      </Box>
    );
  }
);

PrintableSalesBill.displayName = 'PrintableSalesBill'; 
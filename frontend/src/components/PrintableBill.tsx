import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Divider, Grid } from '@mui/material';
import { formatCurrency, formatWeight } from '../utils/formatters';
import type { PurchaseDetail, PaymentHistory } from '../types/purchase';

interface PrintableBillProps {
  purchase: PurchaseDetail;
  payments: PaymentHistory[];
}

export const PrintableBill = React.forwardRef<HTMLDivElement, PrintableBillProps>(({ purchase, payments }, ref) => {
  return (
    <Box ref={ref} className="printable-bill" sx={{ p: 4, bgcolor: 'white' }}>
      {/* Company Header */}
      <Box textAlign="center" mb={3}>
        <Typography variant="h4">GRAIN TRADING CO.</Typography>
        <Typography>123 Business Street, City, State - 12345</Typography>
        <Typography>Phone: (123) 456-7890 | Email: info@graintrading.com</Typography>
        <Typography>GST No: XXXXXXXXXXXXX</Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Bill Details */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Bill To:</Typography>
          <Typography variant="body1">{purchase.supplier_name}</Typography>
        </Grid>
        <Grid item xs={6} textAlign="right">
          <Typography><strong>Bill No:</strong> {purchase.bill_number}</Typography>
          <Typography><strong>Date:</strong> {new Date(purchase.purchase_date).toLocaleDateString()}</Typography>
        </Grid>
      </Grid>

      {/* Purchase Details */}
      <Table sx={{ mb: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell>Description</TableCell>
            <TableCell align="right">Quantity</TableCell>
            <TableCell align="right">Rate</TableCell>
            <TableCell align="right">Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>{purchase.grain_name}</TableCell>
            <TableCell align="right">
              {purchase.number_of_bags} bags × {formatWeight(purchase.weight_per_bag)}
              {purchase.extra_weight > 0 && ` + ${formatWeight(purchase.extra_weight)} extra`}
              <br />
              Total: {formatWeight(purchase.total_weight)}
            </TableCell>
            <TableCell align="right">{formatCurrency(purchase.rate_per_kg)}/kg</TableCell>
            <TableCell align="right">{formatCurrency(purchase.total_amount)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {/* Payment Details */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>Payment Details</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                <TableCell>{payment.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Box textAlign="right" mt={2}>
          <Typography><strong>Total Amount:</strong> {formatCurrency(purchase.total_amount)}</Typography>
          <Typography><strong>Paid Amount:</strong> {formatCurrency(purchase.paid_amount)}</Typography>
          <Typography><strong>Balance:</strong> {formatCurrency(purchase.total_amount - purchase.paid_amount)}</Typography>
        </Box>
      </Box>

      {/* Terms and Signature */}
      <Box mt={4}>
        <Typography variant="subtitle2" gutterBottom>Terms & Conditions:</Typography>
        <Typography variant="body2">1. All disputes are subject to local jurisdiction</Typography>
        <Typography variant="body2">2. Payment should be made as per agreed terms</Typography>
        <Typography variant="body2">3. Quality and weight checked before delivery</Typography>
      </Box>

      <Box mt={4} display="flex" justifyContent="flex-end">
        <Box textAlign="center">
          <Typography sx={{ borderTop: '1px solid black', mt: 8, pt: 1 }}>
            Authorized Signature
          </Typography>
        </Box>
      </Box>
    </Box>
  );
});

PrintableBill.displayName = 'PrintableBill'; 
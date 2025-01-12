import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Paper,
  Chip,
  Menu,
  MenuItem,
  IconButton
} from '@mui/material';
import { Print as PrintIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { formatDate, formatCurrency } from '../utils/formatters';
import { Sale } from '../types/sale';

interface SaleDetailsProps {
  open: boolean;
  onClose: () => void;
  sale: Sale | null;
  onPrint: () => void;
  handlePaymentStatusChange: (saleId: number, newStatus: 'pending' | 'paid') => void;
}

export const SaleDetails: React.FC<SaleDetailsProps> = ({ open, onClose, sale, onPrint, handlePaymentStatusChange }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleStatusMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleStatusMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = async (newStatus: 'pending' | 'paid') => {
    if (sale) {
      await handlePaymentStatusChange(sale.id, newStatus);
      handleStatusMenuClose();
    }
  };

  if (!sale) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Sale Details</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={onPrint}
          >
            Print Bill
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Paper elevation={0} sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Bill Number</Typography>
              <Typography variant="body1">{sale.bill_number}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Date</Typography>
              <Typography variant="body1">{formatDate(new Date(sale.sale_date))}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Buyer Name</Typography>
              <Typography variant="body1">{sale.buyer_name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">GST Number</Typography>
              <Typography variant="body1">{sale.buyer_gst || '-'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Product Details</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Grain</Typography>
              <Typography variant="body1">{sale.grain_name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Number of Bags</Typography>
              <Typography variant="body1">{sale.number_of_bags}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Total Weight</Typography>
              <Typography variant="body1">{sale.total_weight} kg</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Rate per KG</Typography>
              <Typography variant="body1">{formatCurrency(sale.rate_per_kg)}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Transportation Details</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Mode</Typography>
              <Typography variant="body1">{sale.transportation_mode}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Vehicle Number</Typography>
              <Typography variant="body1">{sale.vehicle_number}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Driver Name</Typography>
              <Typography variant="body1">{sale.driver_name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">LR Number</Typography>
              <Typography variant="body1">{sale.lr_number || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">PO Number</Typography>
              <Typography variant="body1">{sale.po_number || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">Payment Status</Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <Chip
                  label={sale.payment_status === 'paid' ? 'Paid' : 'Pending'}
                  color={sale.payment_status === 'paid' ? 'success' : 'error'}
                  size="small"
                />
                <IconButton
                  size="small"
                  onClick={handleStatusMenuClick}
                >
                  <MoreVertIcon />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="h6" color="primary">
                  Total Amount: {formatCurrency(sale.total_amount)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleStatusMenuClose}
      >
        <MenuItem onClick={() => handleStatusChange('pending')}>
          <Chip 
            label="Pending" 
            color="error" 
            size="small" 
            sx={{ minWidth: 80 }}
          />
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('paid')}>
          <Chip 
            label="Paid" 
            color="success" 
            size="small"
            sx={{ minWidth: 80 }}
          />
        </MenuItem>
      </Menu>
    </Dialog>
  );
}; 
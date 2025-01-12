import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Menu,
  MenuItem,
  IconButton
} from '@mui/material';
import { Add as AddIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { SalesForm } from '../components/SalesForm';
import { useNotification } from '../contexts/NotificationContext';
import { formatDate, formatCurrency } from '../utils/formatters';
import { SaleDetails } from '../components/SaleDetails';
import { SaleBillPrint } from '../components/SaleBillPrint';
import { useReactToPrint } from 'react-to-print';
import { Sale } from '../types/sale';

export const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const { showError, showSuccess } = useNotification();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const printComponentRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);

  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    documentTitle: `Sale-${selectedSale?.bill_number || 'Bill'}`,
    onAfterPrint: () => console.log('Printed successfully')
  });

  const fetchSales = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sales', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch sales');
      const data = await response.json();
      setSales(data);
    } catch (error) {
      showError('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleCreateSuccess = () => {
    fetchSales();
    setOpenForm(false);
  };

  const handleRowClick = async (saleId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/sales/${saleId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch sale details');
      const data = await response.json();
      setSelectedSale(data);
      setDetailsOpen(true);
    } catch (error) {
      showError('Failed to load sale details');
    }
  };

  const handlePaymentStatusChange = async (saleId: number, newStatus: 'pending' | 'paid') => {
    try {
      const response = await fetch(`http://localhost:5000/api/sales/${saleId}/payment-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update payment status');
      
      // Update the local state immediately
      setSales(sales.map(sale => 
        sale.id === saleId 
          ? { ...sale, payment_status: newStatus }
          : sale
      ));

      // If this is the currently selected sale, update that too
      if (selectedSale && selectedSale.id === saleId) {
        setSelectedSale({ ...selectedSale, payment_status: newStatus });
      }
      
      showSuccess('Payment status updated successfully');
    } catch (error) {
      showError('Failed to update payment status');
    }
  };

  const handleStatusMenuClick = (event: React.MouseEvent<HTMLElement>, saleId: number) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedSaleId(saleId);
  };

  const handleStatusMenuClose = () => {
    setAnchorEl(null);
    setSelectedSaleId(null);
  };

  const handleStatusChange = async (newStatus: 'pending' | 'paid') => {
    if (selectedSaleId) {
      await handlePaymentStatusChange(selectedSaleId, newStatus);
      handleStatusMenuClose();
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Sales</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          New Sale
        </Button>
      </Box>

      <SalesForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleCreateSuccess}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Bill Number</TableCell>
              <TableCell>Grain</TableCell>
              <TableCell>Buyer</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Payment Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.map((sale) => (
              <TableRow 
                key={sale.id} 
                onClick={() => handleRowClick(sale.id)}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
              >
                <TableCell>{sale.bill_number}</TableCell>
                <TableCell>{sale.grain_name}</TableCell>
                <TableCell>{sale.buyer_name}</TableCell>
                <TableCell align="right">{formatCurrency(sale.total_amount)}</TableCell>
                <TableCell>{formatDate(new Date(sale.sale_date))}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Chip
                      label={sale.payment_status === 'paid' ? 'Paid' : 'Pending'}
                      color={sale.payment_status === 'paid' ? 'success' : 'error'}
                      size="small"
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => handleStatusMenuClick(e, sale.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {sales.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No sales found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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

      <SaleDetails
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        sale={selectedSale}
        onPrint={handlePrint}
        handlePaymentStatusChange={handlePaymentStatusChange} 
      />

      <div style={{ display: 'none' }}>
        <div ref={printComponentRef}>
          <SaleBillPrint sale={selectedSale} />
        </div>
      </div>
    </Box>
  );
}; 
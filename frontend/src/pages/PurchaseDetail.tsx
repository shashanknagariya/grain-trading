import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { PaymentStatusDropdown } from '../components/PaymentStatusDropdown';
import { formatCurrency, formatWeight } from '../utils/formatters';
import { PaymentHistory, PurchaseDetail as PurchaseDetailType } from '../types/purchase';
import { ArrowBack as ArrowBackIcon, Print as PrintIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import { PrintableBill } from '../components/PrintableBill';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';
import { useNotification } from '../contexts/NotificationContext';

interface PaymentDialogState {
  open: boolean;
  mode: 'status_change' | 'payment';
}

export const PurchaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState<PurchaseDetailType | null>(null);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentDialog, setPaymentDialog] = useState<PaymentDialogState>({
    open: false,
    mode: 'status_change'
  });
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const printComponentRef = React.useRef(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const { showSuccess, showError } = useNotification();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    fetchPurchaseDetails();
  }, [id]);

  const fetchPurchaseDetails = async () => {
    try {
      const [purchaseResponse, paymentsResponse] = await Promise.all([
        fetch(`http://localhost:5000/api/purchases/${id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`http://localhost:5000/api/purchases/${id}/payments`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (!purchaseResponse.ok || !paymentsResponse.ok) {
        throw new Error('Failed to fetch purchase details');
      }

      const purchaseData = await purchaseResponse.json();
      const paymentsData = await paymentsResponse.json();

      setPurchase(purchaseData);
      setPayments(paymentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load purchase details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: string, amount?: number, description?: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/purchases/${id}/payment-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, amount, description })
      });

      if (!response.ok) throw new Error('Failed to update payment status');

      // Refresh the purchase details and payment history
      fetchPurchaseDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment status');
    }
  };

  const handlePayment = async (amount: number, description: string) => {
    try {
      setIsProcessingPayment(true);
      if (!purchase) {
        throw new Error('Purchase details not found');
      }

      const remainingAmount = purchase.total_amount - purchase.paid_amount;
      
      if (amount > remainingAmount) {
        throw new Error(`Cannot pay more than remaining amount: ${formatCurrency(remainingAmount)}`);
      }

      let newStatus = purchase.payment_status;
      if (amount === remainingAmount) {
        newStatus = 'paid';
      } else if (purchase.payment_status === 'pending') {
        newStatus = 'partially_paid';
      }

      await handleStatusChange(newStatus, amount, description);
      setPaymentDialog({ open: false, mode: 'status_change' });
      setAmount('');
      setDescription('');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
  });

  const handlePrintWithLoading = async () => {
    try {
      setIsPrinting(true);
      await handlePrint();
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`http://localhost:5000/api/purchases/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete purchase');
      }

      showSuccess('Purchase deleted successfully');
      navigate('/purchases');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete purchase');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderPaymentSection = () => {
    if (!purchase) return null;

    return (
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
          <Typography variant="subtitle2">Payment Status</Typography>
          <Box mb={2}>
            <PaymentStatusDropdown
              purchaseId={purchase.id}
              currentStatus={purchase.payment_status}
              totalAmount={purchase.total_amount}
              paidAmount={purchase.paid_amount}
              onStatusChange={handleStatusChange}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={() => setPaymentDialog({ open: true, mode: 'payment' })}
            disabled={purchase.payment_status === 'paid'}
            fullWidth
            startIcon={isProcessingPayment ? (
              <CircularProgress size={20} color="inherit" />
            ) : undefined}
          >
            Make Additional Payment
          </Button>
        </Grid>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!purchase) {
    return <Alert severity="info">Purchase not found</Alert>;
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3} gap={2}>
        <IconButton onClick={() => navigate('/purchases')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Purchase Details</Typography>
        <Box flex={1} />
        <Button
          variant="outlined"
          color="error"
          startIcon={isDeleting ? (
            <CircularProgress size={20} color="error" />
          ) : (
            <DeleteIcon />
          )}
          onClick={() => setOpenDeleteDialog(true)}
          sx={{ mr: 2 }}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
        <Button
          variant="contained"
          startIcon={isPrinting ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <PrintIcon />
          )}
          onClick={handlePrintWithLoading}
          disabled={isPrinting}
        >
          {isPrinting ? 'Printing...' : 'Print Bill'}
        </Button>
      </Box>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Bill Number</Typography>
            <Typography variant="body1" gutterBottom>{purchase.bill_number}</Typography>

            <Typography variant="subtitle2">Supplier</Typography>
            <Typography variant="body1" gutterBottom>{purchase.supplier_name}</Typography>

            <Typography variant="subtitle2">Date</Typography>
            <Typography variant="body1" gutterBottom>
              {new Date(purchase.purchase_date).toLocaleDateString()}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            {renderPaymentSection()}

            <Typography variant="subtitle2">Total Amount</Typography>
            <Typography variant="body1" gutterBottom>{formatCurrency(purchase.total_amount)}</Typography>

            <Typography variant="subtitle2">Paid Amount</Typography>
            <Typography variant="body1" gutterBottom>{formatCurrency(purchase.paid_amount)}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>Purchase Details</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Grain</Typography>
            <Typography variant="body1" gutterBottom>{purchase.grain_name}</Typography>

            <Typography variant="subtitle2">Godown</Typography>
            <Typography variant="body1" gutterBottom>{purchase.godown_name}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Number of Bags</Typography>
            <Typography variant="body1" gutterBottom>{purchase.number_of_bags}</Typography>

            <Typography variant="subtitle2">Weight per Bag</Typography>
            <Typography variant="body1" gutterBottom>{formatWeight(purchase.weight_per_bag)}</Typography>

            <Typography variant="subtitle2">Extra Weight</Typography>
            <Typography variant="body1" gutterBottom>{formatWeight(purchase.extra_weight)}</Typography>

            <Typography variant="subtitle2">Rate per KG</Typography>
            <Typography variant="body1" gutterBottom>{formatCurrency(purchase.rate_per_kg)}</Typography>

            <Typography variant="subtitle2">Total Weight</Typography>
            <Typography variant="body1" gutterBottom>{formatWeight(purchase.total_weight)}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>Payment History</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{new Date(payment.payment_date).toLocaleString()}</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>{payment.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog 
        open={paymentDialog.open} 
        onClose={() => setPaymentDialog({ open: false, mode: 'status_change' })}
      >
        <DialogTitle>Make Payment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={!!error}
            helperText={error || `Remaining: ${formatCurrency(purchase.total_amount - purchase.paid_amount)}`}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setPaymentDialog({ open: false, mode: 'status_change' });
              setAmount('');
              setDescription('');
            }}
            disabled={isProcessingPayment}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handlePayment(parseFloat(amount), description)} 
            variant="contained"
            disabled={!amount || parseFloat(amount) <= 0 || isProcessingPayment}
            startIcon={isProcessingPayment ? (
              <CircularProgress size={20} color="inherit" />
            ) : undefined}
          >
            {isProcessingPayment ? 'Processing...' : 'Submit Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: 'none' }}>
        <PrintableBill
          ref={printComponentRef}
          purchase={purchase}
          payments={payments}
        />
      </Box>

      <DeleteConfirmationDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Purchase"
        content={`Are you sure you want to delete purchase ${purchase?.bill_number}? This action cannot be undone.`}
      />
    </Box>
  );
}; 
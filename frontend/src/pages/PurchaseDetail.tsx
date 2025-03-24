import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useNotification } from '../contexts/NotificationContext';
import { useReactToPrint } from 'react-to-print';
import PrintIcon from '@mui/icons-material/Print';
import { useTranslation } from 'react-i18next';

interface PurchaseDetail {
  id: string;
  grain_name: string;
  seller_name: string;
  number_of_bags: number;
  weight_per_bag: number;
  total_weight: number;
  rate_per_kg: number;
  total_amount: number;
  purchase_date: Date;
  godown_name: string;
  status: 'pending' | 'completed' | 'cancelled';
  bill_number: string;
}

export const PurchaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError } = useNotification();
  const [purchase, setPurchase] = useState<PurchaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchPurchaseDetail();
  }, [id]);

  const fetchPurchaseDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/purchases/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch purchase details');
      }

      const data = await response.json();
      setPurchase({
        ...data,
        purchase_date: new Date(data.purchase_date)
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      showError('Failed to load purchase details');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Purchase-${purchase?.bill_number || ''}`,
    pageStyle: `
      @media print {
        body {
          font-size: 12pt;
        }
        .MuiToolbar-root, .MuiButton-root.no-print, .no-print {
          display: none !important;
        }
        .MuiPaper-root {
          box-shadow: none !important;
          padding: 20px !important;
        }
      }
    `
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !purchase) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error || 'Purchase not found'}
      </Alert>
    );
  }

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            {t('purchases.purchase_details')}
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            className="no-print"
          >
            {t('common.print')}
          </Button>
        </Box>
        <div ref={printRef}>
          <Box mb={3} className="print-only" sx={{ display: 'none' }}>
            <Typography variant="h4" component="h1" align="center" gutterBottom>
              Purchase Receipt
            </Typography>
            <Typography variant="subtitle1" align="center" gutterBottom>
              Bill Number: {purchase?.bill_number}
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                Purchase Details
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Grain</Typography>
              <Typography>{purchase.grain_name}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Seller</Typography>
              <Typography>{purchase.seller_name}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Number of Bags</Typography>
              <Typography>{purchase.number_of_bags}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Weight per Bag</Typography>
              <Typography>{purchase.weight_per_bag} kg</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Total Weight</Typography>
              <Typography>{purchase.total_weight} kg</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Rate per KG</Typography>
              <Typography>{formatCurrency(purchase.rate_per_kg)}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Total Amount</Typography>
              <Typography>{formatCurrency(purchase.total_amount)}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Purchase Date</Typography>
              <Typography>{formatDate(purchase.purchase_date)}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Godown</Typography>
              <Typography>{purchase.godown_name}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Status</Typography>
              <Typography sx={{ textTransform: 'capitalize' }}>{purchase.status}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Button onClick={() => navigate('/purchases')}>
                Back to Purchases
              </Button>
            </Grid>
          </Grid>
        </div>
      </Paper>
    </Box>
  );
}; 
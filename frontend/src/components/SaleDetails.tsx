import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Divider,
  Box,
  Chip
} from '@mui/material';
import { Sale } from '../types/sale';
import { formatDate, formatCurrency } from '../utils/formatters';
import { useTranslation } from 'react-i18next';

interface SaleDetailsProps {
  sale: Sale | null;
  open: boolean;
  onClose: () => void;
}

export const SaleDetails: React.FC<SaleDetailsProps> = ({ sale, open, onClose }) => {
  const { t } = useTranslation();

  if (!sale) return null;

  const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <Grid container spacing={2} sx={{ py: 1 }}>
      <Grid item xs={4}>
        <Typography variant="subtitle2" color="textSecondary">
          {label}
        </Typography>
      </Grid>
      <Grid item xs={8}>
        <Typography>{value}</Typography>
      </Grid>
    </Grid>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">{t('sales.title')} - {sale.bill_number}</Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="h6" gutterBottom>{t('common.basic_info')}</Typography>
          <DetailRow label={t('sales.bill_number')} value={sale.bill_number} />
          <DetailRow label={t('sales.customer_name')} value={sale.buyer_name} />
          <DetailRow label={t('sales.grain_name')} value={sale.grain_name} />
          <DetailRow label={t('sales.sale_date')} value={formatDate(new Date(sale.sale_date))} />
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>{t('common.quantity_details')}</Typography>
          <DetailRow label={t('sales.number_of_bags')} value={sale.number_of_bags} />
          <DetailRow label={t('sales.total_weight')} value={`${sale.total_weight} kg`} />
          <DetailRow label={t('sales.rate_per_kg')} value={formatCurrency(sale.rate_per_kg)} />
          <DetailRow label={t('sales.total_amount')} value={formatCurrency(sale.total_amount)} />
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>{t('common.payment_info')}</Typography>
          <DetailRow 
            label={t('sales.payment_status')} 
            value={
              <Chip
                label={t(`common.payment_status.${sale.payment_status}`)}
                color={sale.payment_status === 'paid' ? 'success' : sale.payment_status === 'partial' ? 'warning' : 'error'}
                size="small"
              />
            }
          />
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>{t('common.transport_info')}</Typography>
          <DetailRow label={t('sales.transportation_mode')} value={sale.transportation_mode} />
          <DetailRow label={t('sales.vehicle_number')} value={sale.vehicle_number} />
          <DetailRow label={t('sales.driver_name')} value={sale.driver_name} />
          <DetailRow label={t('sales.lr_number')} value={sale.lr_number || '-'} />
          <DetailRow label={t('sales.po_number')} value={sale.po_number || '-'} />
          
          {sale.buyer_gst && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>{t('common.tax_info')}</Typography>
              <DetailRow label={t('sales.buyer_gst')} value={sale.buyer_gst} />
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
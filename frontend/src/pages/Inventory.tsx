import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { formatDate, formatWeight } from '../utils/formatters';
import { useTranslation } from 'react-i18next';

interface InventoryItem {
  id: number;
  grain_name: string;
  godown_name: string;
  total_bags: number;
  total_weight: number;
  last_updated: string;
}

export const Inventory: React.FC = () => {
  const { t } = useTranslation();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/inventory`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error(t('errors.fetch_error'));
        }

        const data = await response.json();
        setInventory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.fetch_error'));
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [t]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {t('inventory.title')}
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('inventory.grain_name')}</TableCell>
              <TableCell>{t('inventory.godown_name')}</TableCell>
              <TableCell align="right">{t('inventory.total_bags')}</TableCell>
              <TableCell align="right">{t('inventory.total_weight')}</TableCell>
              <TableCell>{t('inventory.last_updated')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.grain_name}</TableCell>
                <TableCell>{item.godown_name}</TableCell>
                <TableCell align="right">{item.total_bags}</TableCell>
                <TableCell align="right">{formatWeight(item.total_weight)}</TableCell>
                <TableCell>{formatDate(new Date(item.last_updated))}</TableCell>
              </TableRow>
            ))}
            {inventory.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
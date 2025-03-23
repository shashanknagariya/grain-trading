import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

interface Column {
  id: string;
  label: string;
  format?: (value: any) => string | number;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  data,
  onRowClick
}) => {
  const { isMobileView } = useResponsiveLayout();

  if (isMobileView) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {data.map((row, index) => (
          <Card 
            key={index}
            sx={{ 
              cursor: onRowClick ? 'pointer' : 'default',
              '&:hover': onRowClick ? { bgcolor: 'action.hover' } : {}
            }}
            onClick={() => onRowClick?.(row)}
          >
            <CardContent>
              {columns.map((column) => (
                <Box 
                  key={column.id}
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    mb: 1
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    {column.label}:
                  </Typography>
                  <Typography>
                    {column.format ? column.format(row[column.id]) : row[column.id]}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.id}>{column.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={index}
              hover={!!onRowClick}
              onClick={() => onRowClick?.(row)}
              sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((column) => (
                <TableCell key={column.id}>
                  {column.format ? column.format(row[column.id]) : row[column.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}; 
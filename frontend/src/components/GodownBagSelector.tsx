import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Grid,
  TextField,
  MenuItem,
  Button
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { GodownDetail } from '../types/inventory';

interface Godown {
  id: number;
  name: string;
  available_bags: number;
}

interface GodownBagSelectorProps {
  grainId: number;
  onChange: (details: GodownDetail[]) => void;
}

export const GodownBagSelector: React.FC<GodownBagSelectorProps> = ({
  grainId,
  onChange
}) => {
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [selectedGodowns, setSelectedGodowns] = useState<GodownDetail[]>([]);

  useEffect(() => {
    fetchGodownStock();
  }, [grainId]);

  const fetchGodownStock = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/inventory/godown-stock/${grainId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch godown stock');
      const data = await response.json();
      setGodowns(data);
    } catch (error) {
      console.error('Error fetching godown stock:', error);
    }
  };

  const addGodownSelection = () => {
    const newSelections = [...selectedGodowns, { godown_id: 0, number_of_bags: 0 }];
    setSelectedGodowns(newSelections);
    onChange(newSelections);
  };

  const removeGodownSelection = (index: number) => {
    const newSelections = selectedGodowns.filter((_, i) => i !== index);
    setSelectedGodowns(newSelections);
    onChange(newSelections);
  };

  const updateSelection = (index: number, field: keyof GodownDetail, value: number) => {
    const newSelections = [...selectedGodowns];
    newSelections[index] = { ...newSelections[index], [field]: value };
    setSelectedGodowns(newSelections);
    onChange(newSelections);
  };

  const totalSelectedBags = selectedGodowns.reduce((sum, sel) => sum + sel.number_of_bags, 0);

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Select Godowns and Bags
      </Typography>
      
      {selectedGodowns.map((selection, index) => (
        <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 2 }}>
          <Grid item xs={5}>
            <TextField
              select
              fullWidth
              label="Godown"
              value={selection.godown_id || ''}
              onChange={(e) => updateSelection(index, 'godown_id', Number(e.target.value))}
              required
            >
              <MenuItem value="">Select a Godown</MenuItem>
              {godowns.map((godown) => (
                <MenuItem 
                  key={godown.id} 
                  value={godown.id}
                  disabled={selectedGodowns.some(s => s.godown_id === godown.id && s !== selection)}
                >
                  {godown.name}
                  <Typography 
                    component="span" 
                    color="textSecondary" 
                    sx={{ ml: 1, fontSize: '0.875rem' }}
                  >
                    ({godown.available_bags} bags)
                  </Typography>
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={5}>
            <TextField
              type="number"
              fullWidth
              label="Number of Bags"
              value={selection.number_of_bags || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                updateSelection(index, 'number_of_bags', value);
              }}
              required
              inputProps={{ 
                min: 0, 
                max: godowns.find(g => g.id === selection.godown_id)?.available_bags || 0 
              }}
            />
          </Grid>
          <Grid item xs={2}>
            <IconButton onClick={() => removeGodownSelection(index)} color="error">
              <RemoveIcon />
            </IconButton>
          </Grid>
        </Grid>
      ))}

      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <Button
          startIcon={<AddIcon />}
          onClick={addGodownSelection}
        >
          Add Godown
        </Button>
        <Typography color="textSecondary">
          Total Selected: {totalSelectedBags} bags
        </Typography>
      </Box>
    </Box>
  );
}; 
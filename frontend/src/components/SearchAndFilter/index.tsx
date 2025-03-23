import React, { useState, useCallback } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Popover,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';

interface Filter {
  id: string;
  label: string;
  checked: boolean;
}

interface SearchAndFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: string[]) => void;
  filters: Filter[];
  placeholder?: string;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  onSearch,
  onFilter,
  filters,
  placeholder = 'Search...'
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Filter[]>(filters);

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = useCallback((id: string) => {
    setActiveFilters(prev => {
      const newFilters = prev.map(filter => 
        filter.id === id ? { ...filter, checked: !filter.checked } : filter
      );
      onFilter(newFilters.filter(f => f.checked).map(f => f.id));
      return newFilters;
    });
  }, [onFilter]);

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    onSearch(query);
  }, [onSearch]);

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <TextField
        size="small"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleSearch}
        InputProps={{
          startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
        }}
      />
      <IconButton onClick={handleFilterClick}>
        <FilterListIcon />
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <FormGroup sx={{ p: 2 }}>
          {activeFilters.map(filter => (
            <FormControlLabel
              key={filter.id}
              control={
                <Checkbox
                  checked={filter.checked}
                  onChange={() => handleFilterChange(filter.id)}
                />
              }
              label={filter.label}
            />
          ))}
        </FormGroup>
      </Popover>
    </Box>
  );
}; 
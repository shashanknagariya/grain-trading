import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import GrainIcon from '@mui/icons-material/Grain';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import GroupIcon from '@mui/icons-material/Group';

export const navigationItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />
  },
  {
    path: '/purchases',
    label: 'Purchases',
    icon: <ShoppingCartIcon />
  },
  {
    path: '/sales',
    label: 'Sales',
    icon: <PointOfSaleIcon />
  },
  {
    path: '/inventory',
    label: 'Inventory',
    icon: <InventoryIcon />
  },
  {
    path: '/grains',
    label: 'Grains',
    icon: <GrainIcon />
  },
  {
    path: '/godowns',
    label: 'Godowns',
    icon: <WarehouseIcon />
  },
  {
    path: '/users',
    label: 'Users',
    icon: <GroupIcon />
  }
]; 
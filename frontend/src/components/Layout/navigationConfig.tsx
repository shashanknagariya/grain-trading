import {
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as PointOfSaleIcon,
  Inventory as InventoryIcon,
  Grain as GrainIcon,
  Warehouse as WarehouseIcon,
  Group as GroupIcon,
  KeyboardVoice as KeyboardVoiceIcon
} from '@mui/icons-material';

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
  },
  {
    path: '/voice-bill',
    label: 'Voice Bill',
    icon: <KeyboardVoiceIcon />
  }
]; 
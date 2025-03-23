import React from 'react';
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Typography
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' }
];

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    handleClose();
  };

  const currentLanguage = LANGUAGES.find(lang => lang.code === i18n.language);

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label="change language"
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <TranslateIcon />
        <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
          {currentLanguage?.label}
        </Typography>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {LANGUAGES.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            selected={i18n.language === lang.code}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              {i18n.language === lang.code && <CheckIcon />}
            </ListItemIcon>
            <ListItemText primary={lang.label} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
import { useTranslation } from 'react-i18next';
import { useResponsiveLayout } from './useResponsiveLayout';

export const useResponsiveI18n = () => {
  const { t } = useTranslation();
  const { isMobileView, isTabletView } = useResponsiveLayout();

  const getResponsiveText = (key: string, options = {}) => {
    const devicePrefix = isMobileView ? 'mobile' : isTabletView ? 'tablet' : 'desktop';
    return t(`${devicePrefix}.${key}`, options);
  };

  return {
    getResponsiveText
  };
}; 
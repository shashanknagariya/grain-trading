import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

export const useFormTranslation = (formNamespace: string) => {
  const { t, i18n } = useTranslation();

  const formUtils = useMemo(() => ({
    getFieldLabel: (fieldName: string) => t(`${formNamespace}.fields.${fieldName}`),
    getPlaceholder: (fieldName: string) => t(`${formNamespace}.placeholders.${fieldName}`),
    getError: (errorKey: string) => t(`errors.${errorKey}`),
    getHelperText: (fieldName: string) => t(`${formNamespace}.helpers.${fieldName}`),
    formatDate: (date: Date) => new Intl.DateTimeFormat(i18n.language).format(date),
    formatNumber: (num: number) => new Intl.NumberFormat(i18n.language).format(num),
    formatCurrency: (amount: number) => new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }), [t, i18n.language]);

  return formUtils;
}; 
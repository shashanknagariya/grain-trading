import { format, formatDistance, formatRelative } from 'date-fns';
import { enUS, hi } from 'date-fns/locale';
import i18next from 'i18next';

const locales = {
  en: enUS,
  hi
};

export const formatters = {
  date: {
    short: (date: Date) => {
      return format(date, 'P', {
        locale: locales[i18next.language as keyof typeof locales]
      });
    },
    long: (date: Date) => {
      return format(date, 'PPP', {
        locale: locales[i18next.language as keyof typeof locales]
      });
    },
    relative: (date: Date) => {
      return formatRelative(date, new Date(), {
        locale: locales[i18next.language as keyof typeof locales]
      });
    },
    timeAgo: (date: Date) => {
      return formatDistance(date, new Date(), {
        addSuffix: true,
        locale: locales[i18next.language as keyof typeof locales]
      });
    }
  },
  number: {
    decimal: (num: number, decimals = 2) => {
      return new Intl.NumberFormat(i18next.language, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(num);
    },
    currency: (amount: number) => {
      return new Intl.NumberFormat(i18next.language, {
        style: 'currency',
        currency: 'INR'
      }).format(amount);
    },
    percentage: (value: number) => {
      return new Intl.NumberFormat(i18next.language, {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }).format(value / 100);
    },
    compact: (value: number) => {
      return new Intl.NumberFormat(i18next.language, {
        notation: 'compact',
        compactDisplay: 'short'
      }).format(value);
    }
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

export const formatWeight = (weight: number): string => {
  const formatter = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  if (weight >= 100) {
    return `${formatter.format(weight / 100)} qtl`;
  }
  return `${formatter.format(weight)} kg`;
};

// Optional: Add a function to format number of bags
export const formatBags = (bags: number): string => {
  return new Intl.NumberFormat('en-IN').format(bags) + ' bags';
}; 
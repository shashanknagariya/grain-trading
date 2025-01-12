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
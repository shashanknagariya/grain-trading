export const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}; 
import { useSnackbar, OptionsObject } from 'notistack';

export const useNotification = () => {
  const { enqueueSnackbar } = useSnackbar();

  const showSuccess = (message: string, options?: OptionsObject) => {
    enqueueSnackbar(message, { variant: 'success', ...options });
  };

  const showError = (message: string, options?: OptionsObject) => {
    enqueueSnackbar(message, { variant: 'error', ...options });
  };

  const showWarning = (message: string, options?: OptionsObject) => {
    enqueueSnackbar(message, { variant: 'warning', ...options });
  };

  const showInfo = (message: string, options?: OptionsObject) => {
    enqueueSnackbar(message, { variant: 'info', ...options });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}; 
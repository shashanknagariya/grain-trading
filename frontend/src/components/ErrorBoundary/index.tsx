import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ErrorType, AppError } from '../../utils/errorHandling';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  error: AppError | null;
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      error: error instanceof AppError ? error : new AppError({
        type: ErrorType.UNKNOWN,
        message: 'An unexpected error occurred'
      })
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

const ErrorFallback: React.FC<{ error: AppError | null }> = ({ error }) => {
  const { t } = useTranslation();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 3,
        textAlign: 'center'
      }}
    >
      <Typography variant="h5" gutterBottom>
        {t(`errors.${error?.type}.title`, { defaultValue: t('errors.unknown.title') })}
      </Typography>
      <Typography color="text.secondary" paragraph>
        {error?.message || t('errors.unknown.message')}
      </Typography>
      <Button
        variant="contained"
        onClick={handleRetry}
        sx={{ mt: 2 }}
      >
        {t('actions.retry')}
      </Button>
    </Box>
  );
}; 
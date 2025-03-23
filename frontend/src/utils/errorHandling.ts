import { AxiosError } from 'axios';
import i18next from 'i18next';

export enum ErrorType {
  API = 'api',
  VALIDATION = 'validation',
  NETWORK = 'network',
  AUTH = 'auth',
  UNKNOWN = 'unknown'
}

interface ErrorDetails {
  type: ErrorType;
  message: string;
  code?: string | number;
  field?: string;
}

export class AppError extends Error {
  public type: ErrorType;
  public code?: string | number;
  public field?: string;

  constructor({ type, message, code, field }: ErrorDetails) {
    super(message);
    this.type = type;
    this.code = code;
    this.field = field;
    this.name = 'AppError';
  }
}

export const handleApiError = (error: unknown): AppError => {
  if (error instanceof AppError) return error;

  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data;

    switch (status) {
      case 401:
        return new AppError({
          type: ErrorType.AUTH,
          message: i18next.t('errors.api.unauthorized'),
          code: status
        });
      case 403:
        return new AppError({
          type: ErrorType.AUTH,
          message: i18next.t('errors.api.forbidden'),
          code: status
        });
      case 404:
        return new AppError({
          type: ErrorType.API,
          message: i18next.t('errors.api.notFound'),
          code: status
        });
      case 422:
        return new AppError({
          type: ErrorType.VALIDATION,
          message: data?.message || i18next.t('errors.api.validation'),
          field: data?.field,
          code: status
        });
      case 500:
        return new AppError({
          type: ErrorType.API,
          message: i18next.t('errors.api.server'),
          code: status
        });
      default:
        if (!error.response) {
          return new AppError({
            type: ErrorType.NETWORK,
            message: i18next.t('errors.api.network'),
            code: 'NETWORK_ERROR'
          });
        }
    }
  }

  return new AppError({
    type: ErrorType.UNKNOWN,
    message: i18next.t('errors.unknown'),
    code: 'UNKNOWN'
  });
}; 
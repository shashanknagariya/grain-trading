import { useState, useCallback } from 'react';

interface ValidationRules {
  [key: string]: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean;
  };
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((values: Record<string, any>) => {
    const newErrors: Record<string, string> = {};

    Object.keys(rules).forEach((field) => {
      const value = values[field];
      const fieldRules = rules[field];

      if (fieldRules.required && !value) {
        newErrors[field] = 'This field is required';
      } else if (value) {
        if (fieldRules.minLength && value.length < fieldRules.minLength) {
          newErrors[field] = `Minimum length is ${fieldRules.minLength}`;
        }
        if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
          newErrors[field] = `Maximum length is ${fieldRules.maxLength}`;
        }
        if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
          newErrors[field] = 'Invalid format';
        }
        if (fieldRules.custom && !fieldRules.custom(value)) {
          newErrors[field] = 'Invalid value';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [rules]);

  return { errors, validate };
}; 
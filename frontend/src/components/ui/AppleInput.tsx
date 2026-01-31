'use client';

import { forwardRef } from 'react';
import { TextField, TextFieldProps, styled } from '@mui/material';

export interface AppleInputProps extends Omit<TextFieldProps, 'variant'> {
  helpText?: string;
}

const StyledTextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 'var(--radius-md, 12px)',
    backgroundColor: 'var(--color-background-elevated, #FFFFFF)',
    transition: 'all 200ms ease-in-out',
    
    '& fieldset': {
      borderColor: 'transparent',
      transition: 'border-color 200ms ease-in-out',
    },
    
    '&:hover fieldset': {
      borderColor: 'var(--color-text-secondary, #86868B)',
    },
    
    '&.Mui-focused fieldset': {
      borderColor: 'var(--color-primary, #007AFF)',
      borderWidth: '2px',
    },
    
    '&.Mui-focused': {
      backgroundColor: 'var(--color-background-default, #FFFFFF)',
    },
    
    '&.Mui-disabled': {
      opacity: 0.5,
      backgroundColor: 'var(--color-background-paper, #F5F5F7)',
    },
    
    '&.Mui-error fieldset': {
      borderColor: 'var(--color-error, #FF3B30)',
    },
    
    '&.Mui-error:hover fieldset': {
      borderColor: 'var(--color-error, #FF3B30)',
    },
    
    '&.Mui-error.Mui-focused fieldset': {
      borderColor: 'var(--color-error, #FF3B30)',
    },
  },
  
  '& .MuiInputBase-input': {
    color: 'var(--color-text-primary, #1D1D1F)',
    padding: '12px 16px',
    fontSize: '16px',
    
    '&::placeholder': {
      color: 'var(--color-text-disabled, #C7C7CC)',
      opacity: 1,
    },
  },
  
  '& .MuiInputLabel-root': {
    color: 'var(--color-text-primary, #1D1D1F)',
    fontSize: '14px',
    fontWeight: 500,
    
    '&.Mui-focused': {
      color: 'var(--color-primary, #007AFF)',
    },
    
    '&.Mui-error': {
      color: 'var(--color-error, #FF3B30)',
    },
    
    '&.Mui-error.Mui-focused': {
      color: 'var(--color-error, #FF3B30)',
    },
  },
  
  '& .MuiFormHelperText-root': {
    color: 'var(--color-text-secondary, #86868B)',
    fontSize: '12px',
    marginTop: '4px',
    marginLeft: 0,
    
    '&.Mui-error': {
      color: 'var(--color-error, #FF3B30)',
    },
  },
  
  '& .MuiSelect-icon': {
    color: 'var(--color-text-secondary, #86868B)',
  },
  
  '& .MuiInputBase-multiline': {
    padding: 0,
  },
}));

const AppleInput = forwardRef<HTMLDivElement, AppleInputProps>(
  ({ helpText, helperText, ...props }, ref) => {
    const finalHelperText = helperText || helpText;
    
    return (
      <StyledTextField
        ref={ref}
        helperText={finalHelperText}
        fullWidth
        {...props}
      />
    );
  }
);

AppleInput.displayName = 'AppleInput';

export { AppleInput };
export default AppleInput;

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface ToastContextType {
  showToast: (message: string, severity?: AlertColor, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

interface Toast {
  open: boolean;
  message: string;
  severity: AlertColor;
  duration: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<Toast>({
    open: false,
    message: '',
    severity: 'success',
    duration: 6000
  });

  const showToast = (message: string, severity: AlertColor = 'success', duration: number = 6000) => {
    setToast({
      open: true,
      message,
      severity,
      duration
    });
  };

  const showSuccess = (message: string, duration: number = 6000) => {
    showToast(message, 'success', duration);
  };

  const showError = (message: string, duration: number = 8000) => {
    showToast(message, 'error', duration);
  };

  const showWarning = (message: string, duration: number = 7000) => {
    showToast(message, 'warning', duration);
  };

  const showInfo = (message: string, duration: number = 6000) => {
    showToast(message, 'info', duration);
  };

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setToast(prev => ({ ...prev, open: false }));
  };

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={toast.duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 8 }}
      >
        <Alert 
          onClose={handleClose} 
          severity={toast.severity} 
          sx={{ width: '100%', fontSize: '1rem' }}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
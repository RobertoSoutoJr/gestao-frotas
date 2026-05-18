import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, description, variant = 'default' }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const success = useCallback((title, description) => {
    toast({ title, description, variant: 'success' });
  }, [toast]);

  const error = useCallback((title, description) => {
    toast({ title, description, variant: 'error' });
  }, [toast]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Compat shim for components using addToast(message, variant) style
  const addToast = useCallback((message, variant = 'default') => {
    toast({ title: message, variant });
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, dismiss, addToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext must be used within ToastProvider');
  return ctx;
}

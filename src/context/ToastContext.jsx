import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import ToastContainer from '../components/common/ToastContainer';

const ToastContext = createContext(null);
const DURATION = 4000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const nextId = useRef(1);

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, type) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
    timers.current.set(id, setTimeout(() => dismiss(id), DURATION));
  }, [dismiss]);


  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((t) => clearTimeout(t));
  }, []);

  const toast = useMemo(
    () => ({
      success: (msg) => show(msg, 'success'),
      error: (msg) => show(msg, 'error'),
      info: (msg) => show(msg, 'info'),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast нужно использовать внутри <ToastProvider>');
  }
  return ctx;
}
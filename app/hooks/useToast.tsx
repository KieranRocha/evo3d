import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ToastContainer } from '../components/ui/Toast';

/**
 * Hook para gerenciar toast notifications na aplicação
 */
export function useToast() {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = uuidv4();
        const newToast = { id, message, type, duration };

        setToasts(prevToasts => [...prevToasts, newToast]);

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, []);

    // Métodos de conveniência
    const success = useCallback((message, duration) => {
        return addToast(message, 'success', duration);
    }, [addToast]);

    const error = useCallback((message, duration) => {
        return addToast(message, 'error', duration);
    }, [addToast]);

    const warning = useCallback((message, duration) => {
        return addToast(message, 'warning', duration);
    }, [addToast]);

    const info = useCallback((message, duration) => {
        return addToast(message, 'info', duration);
    }, [addToast]);

    // Componente para renderizar os toasts
    const Toasts = useCallback(() => {
        return <ToastContainer toasts={toasts} removeToast={removeToast} />;
    }, [toasts, removeToast]);

    return {
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
        Toasts,
    };
}
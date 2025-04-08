"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Toast } from '../components/ui/Toast';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

// Tipagem para o contexto
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration: number;
}

interface Dialog {
    id: string;
    title: string;
    content: ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    type?: 'info' | 'warning' | 'error' | 'confirmation';
}

interface UIContextProps {
    // Estado de loading global
    loading: boolean;
    setLoading: (isLoading: boolean) => void;

    // Toasts (notificações)
    toasts: Toast[];
    showToast: (message: string, type?: ToastType, duration?: number) => string;
    dismissToast: (id: string) => void;

    // Métodos de conveniência para toast
    success: (message: string, duration?: number) => string;
    error: (message: string, duration?: number) => string;
    warning: (message: string, duration?: number) => string;
    info: (message: string, duration?: number) => string;

    // Diálogos e modais
    currentDialog: Dialog | null;
    showDialog: (dialog: Omit<Dialog, 'id'>) => string;
    closeDialog: () => void;

    // Gerenciamento de tema
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

// Criação do contexto com valor padrão
const UIContext = createContext<UIContextProps | undefined>(undefined);

/**
 * Provedor de contexto para gerenciar estados globais de UI
 */
export function UIProvider({ children }: { children: ReactNode }) {
    // Estados
    const [loading, setLoading] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [currentDialog, setCurrentDialog] = useState<Dialog | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Gerenciamento de toasts
    const showToast = useCallback((message: string, type: ToastType = 'info', duration = 5000) => {
        const id = uuidv4();
        const newToast = { id, message, type, duration };

        setToasts(prev => [...prev, newToast]);

        // Auto-dismiss
        if (duration > 0) {
            setTimeout(() => {
                dismissToast(id);
            }, duration);
        }

        return id;
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    // Métodos de conveniência para toast
    const success = useCallback((message: string, duration?: number) => {
        return showToast(message, 'success', duration);
    }, [showToast]);

    const error = useCallback((message: string, duration?: number) => {
        return showToast(message, 'error', duration);
    }, [showToast]);

    const warning = useCallback((message: string, duration?: number) => {
        return showToast(message, 'warning', duration);
    }, [showToast]);

    const info = useCallback((message: string, duration?: number) => {
        return showToast(message, 'info', duration);
    }, [showToast]);

    // Gerenciamento de diálogos
    const showDialog = useCallback((dialog: Omit<Dialog, 'id'>) => {
        const id = uuidv4();
        setCurrentDialog({ ...dialog, id });
        return id;
    }, []);

    const closeDialog = useCallback(() => {
        setCurrentDialog(null);
    }, []);

    // Gerenciamento de tema
    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => {
            const newMode = !prev;

            // Atualiza o elemento HTML com a classe dark quando necessário
            if (newMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }

            // Salva a preferência no localStorage
            localStorage.setItem('darkMode', newMode ? 'true' : 'false');

            return newMode;
        });
    }, []);

    // Efeito para carregar o tema do localStorage
    React.useEffect(() => {
        // Verifica se o usuario tem preferência salva
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';

        // Se não tiver, verifica a preferência do sistema
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const initialDarkMode = savedDarkMode || prefersDarkMode;

        setIsDarkMode(initialDarkMode);

        if (initialDarkMode) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    // Memoiza o valor do contexto para evitar re-renderizações desnecessárias
    const contextValue = useMemo(() => ({
        loading,
        setLoading,
        toasts,
        showToast,
        dismissToast,
        success,
        error,
        warning,
        info,
        currentDialog,
        showDialog,
        closeDialog,
        isDarkMode,
        toggleDarkMode,
    }), [
        loading,
        toasts,
        showToast,
        dismissToast,
        success,
        error,
        warning,
        info,
        currentDialog,
        showDialog,
        closeDialog,
        isDarkMode,
        toggleDarkMode
    ]);

    return (
        <UIContext.Provider value={contextValue}>
            {children}

            {/* Renderiza o componente global de loading */}
            {loading && (
                <div className="fixed inset-0 bg-white opacity-90 flex items-center justify-center z-50">
                    <div className=" p-6 rounded-lg flex flex-col items-center ">
                        <LoadingSpinner size="lg" className="text-primary" />
                    </div>
                </div>
            )}

            {/* Renderiza os toasts */}
            <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-40">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        id={toast.id}
                        type={toast.type}
                        message={toast.message}
                        onClose={dismissToast}
                    />
                ))}
            </div>

            {/* Renderiza o modal de diálogo atual */}
            {currentDialog && (
                <Modal
                    isOpen={!!currentDialog}
                    onClose={() => {
                        closeDialog();
                        currentDialog.onCancel?.();
                    }}
                    title={currentDialog.title}
                >
                    <div className="mb-6">
                        {typeof currentDialog.content === 'string' ? (
                            <p>{currentDialog.content}</p>
                        ) : (
                            currentDialog.content
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        {(currentDialog.onCancel || currentDialog.cancelText) && (
                            <button
                                onClick={() => {
                                    closeDialog();
                                    currentDialog.onCancel?.();
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                {currentDialog.cancelText || 'Cancelar'}
                            </button>
                        )}

                        {(currentDialog.onConfirm || currentDialog.confirmText) && (
                            <button
                                onClick={() => {
                                    closeDialog();
                                    currentDialog.onConfirm?.();
                                }}
                                className={`px-4 py-2 rounded-lg text-white ${currentDialog.type === 'error'
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : currentDialog.type === 'warning'
                                        ? 'bg-yellow-600 hover:bg-yellow-700'
                                        : 'bg-primary hover:bg-primary-hover'
                                    }`}
                            >
                                {currentDialog.confirmText || 'Confirmar'}
                            </button>
                        )}
                    </div>
                </Modal>
            )}
        </UIContext.Provider>
    );
}

/**
 * Hook para acessar o contexto UI
 */
export function useUI() {
    const context = useContext(UIContext);

    if (context === undefined) {
        throw new Error('useUI deve ser usado dentro de um UIProvider');
    }

    return context;
}
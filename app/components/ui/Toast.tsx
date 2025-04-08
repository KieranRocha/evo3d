"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

type ToastProps = {
    id: string;
    type: "success" | "error" | "warning" | "info";
    message: string;
    duration?: number;
    onClose: (id: string) => void;
};

/**
 * Sistema de toast individualizado
 */
export function Toast({ id, type, message, duration = 3000, onClose }: ToastProps) {
    // Cores e ícones com base no tipo
    const typeConfig = {
        success: {
            bgColor: "bg-green-50",
            borderColor: "border-green-400",
            textColor: "text-green-800",
            icon: "✓",
        },
        error: {
            bgColor: "bg-red-50",
            borderColor: "border-red-400",
            textColor: "text-red-800",
            icon: "X",
        },
        warning: {
            bgColor: "bg-yellow-50",
            borderColor: "border-yellow-400",
            textColor: "text-yellow-800",
            icon: "⚠️",
        },
        info: {
            bgColor: "bg-blue-50",
            borderColor: "border-blue-400",
            textColor: "text-blue-800",
            icon: "ℹ️",
        },
    };

    // Auto-fechar após a duração definida
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose(id);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, id, onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`${typeConfig[type].bgColor} border ${typeConfig[type].borderColor} ${typeConfig[type].textColor} p-4 rounded-lg shadow-md flex items-start max-w-sm w-full`}
        >
            <span className="text-lg mr-2">{typeConfig[type].icon}</span>
            <span className="flex-1">{message}</span>
            <button
                onClick={() => onClose(id)}
                className="text-gray-500 hover:text-gray-800 transition-colors ml-2"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
}

// Sistema de notificações toast com gerenciamento de múltiplas mensagens
export function ToastContainer({ toasts, removeToast }: {
    toasts: ToastProps[];
    removeToast: (id: string) => void;
}) {
    if (typeof window === 'undefined') return null;

    return createPortal(
        <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <Toast key={toast.id} {...toast} onClose={removeToast} />
                ))}
            </AnimatePresence>
        </div>,
        document.body
    );
}
"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "loading";

interface Toast {
    id: string;
    message: string;
    description?: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    toast: (props: Omit<Toast, "id">) => void;
    dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback(({ message, description, type = "info", duration = 4000 }: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, description, type, duration }]);

        if (duration > 0) {
            setTimeout(() => dismiss(id), duration);
        }
    }, [dismiss]);

    return (
        <ToastContext.Provider value={{ toast, dismiss }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none p-4 md:p-0">
                <AnimatePresence mode="popLayout">
                    {toasts.map((t) => (
                        <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
    const icons = {
        success: <CheckCircle className="h-5 w-5 text-green-500" />,
        error: <AlertCircle className="h-5 w-5 text-red-500" />,
        info: <Info className="h-5 w-5 text-blue-500" />,
        loading: <Loader2 className="h-5 w-5 text-[rgb(var(--primary))] animate-spin" />,
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={cn(
                "pointer-events-auto relative flex items-start gap-3 p-4 rounded-xl shadow-lg border border-[rgb(var(--border-subtle))]",
                "bg-[rgb(var(--bg-card))] backdrop-blur-md"
            )}
        >
            <div className="mt-0.5 shrink-0">{icons[toast.type]}</div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{toast.message}</p>
                {toast.description && (
                    <p className="text-xs text-[rgb(var(--text-secondary))] mt-1">{toast.description}</p>
                )}
            </div>
            <button
                onClick={onDismiss}
                className="shrink-0 p-1 rounded-md text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-surface))] transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
        </motion.div>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

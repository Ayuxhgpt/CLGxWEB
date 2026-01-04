"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    className,
}: ModalProps) {
    // Lock body scroll when open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onKeyDown={(e) => e.key === "Escape" && onClose()}
                            className={cn(
                                "w-full max-w-lg overflow-hidden rounded-xl border border-text/10 bg-surface shadow-2xl pointer-events-auto",
                                className
                            )}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-text/5">
                                <div>
                                    {title && <h2 className="text-lg font-semibold text-text">{title}</h2>}
                                    {description && <p className="text-sm text-text-secondary mt-1">{description}</p>}
                                </div>
                                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="p-6">
                                {children}
                            </div>

                            {footer && (
                                <div className="bg-surface-2/50 p-6 flex justify-end gap-2 border-t border-text/5">
                                    {footer}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

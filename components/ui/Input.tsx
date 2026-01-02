"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, icon, ...props }, ref) => {
        return (
            <div className="w-full relative group">
                {label && (
                    <label className="text-xs text-[var(--text-secondary)] font-medium mb-1.5 block uppercase tracking-wider pl-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-primary)] transition-colors">
                            {icon}
                        </div>
                    )}
                    <input
                        type={type}
                        className={cn(
                            "flex h-11 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
                            "focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            icon && "pl-10",
                            error && "border-red-500 focus:ring-red-500",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="text-xs text-red-500 mt-1 pl-1 font-medium animate-in slide-in-from-top-1 fade-in">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

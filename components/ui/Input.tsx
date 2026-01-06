import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

import { motion } from "framer-motion";

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, icon, ...props }, ref) => {
        return (
            <div className="space-y-2 w-full">
                {label && (
                    <label className="text-sm font-medium leading-none text-[rgb(var(--text-secondary))] peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {label} <span className="text-red-500/80">{props.required ? '*' : ''}</span>
                    </label>
                )}
                <motion.div
                    className="relative group"
                    animate={error ? { x: [0, -10, 10, -5, 5, 0] } : {}}
                    transition={{ duration: 0.4, type: "spring" }}
                >
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] transition-colors group-focus-within:text-[rgb(var(--primary))]">
                            {icon}
                        </div>
                    )}
                    <input
                        type={type}
                        className={cn(
                            "flex h-12 w-full saas-input px-4 py-3 text-sm placeholder:text-[rgb(var(--text-muted))] file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50",
                            icon && "pl-11",
                            error && "border-red-500/50 focus:border-red-500 text-red-500 rounded-xl",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                </motion.div>
                {error && (
                    <p className="text-xs font-medium text-red-400 animate-in slide-in-from-top-1 fade-in">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };

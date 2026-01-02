"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "destructive" | "glass";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

// Combine Framer Motion props with Button props
type MotionButtonProps = ButtonProps & HTMLMotionProps<"button">;

export const Button = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

        const variants = {
            primary: "bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)] shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-transparent",
            secondary: "bg-[var(--bg-surface-2)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]",
            ghost: "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5",
            destructive: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
            glass: "bg-[var(--bg-glass)] backdrop-blur-md border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-white/10"
        };

        const sizes = {
            sm: "h-9 px-3 text-sm",
            md: "h-11 px-6 text-base",
            lg: "h-14 px-8 text-lg"
        };

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={isLoading}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </motion.button>
        );
    }
);

Button.displayName = "Button";

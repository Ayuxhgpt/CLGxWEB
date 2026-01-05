"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--primary))] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
    {
        variants: {
            variant: {
                default: "bg-[rgb(var(--primary))] text-white hover:bg-[rgb(var(--primary-hover))] shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.6)] border border-transparent",
                destructive: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20",
                outline: "border border-[rgb(var(--border-subtle))] bg-transparent hover:bg-[rgb(var(--bg-surface))] text-[rgb(var(--text-primary))]",
                secondary: "bg-[rgb(var(--bg-surface))] text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-subtle))]",
                ghost: "hover:bg-[rgb(var(--bg-surface))] text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]",
                link: "text-[rgb(var(--primary))] underline-offset-4 hover:underline",
            },
            size: {
                default: "h-11 px-5 py-2.5",
                sm: "h-9 rounded-md px-3",
                lg: "h-12 rounded-xl px-8 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, isLoading, children, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";

        const Content = (
            <>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </>
        );

        if (asChild) {
            return (
                <Comp
                    className={cn(buttonVariants({ variant, size, className }))}
                    ref={ref}
                    {...props}
                >
                    {Content}
                </Comp>
            );
        }

        return (
            <motion.button
                whileTap={{ scale: 0.98 }}
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={isLoading || props.disabled}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                {...props as any}
            >
                {Content}
            </motion.button>
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };

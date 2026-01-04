"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20",
                destructive: "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20",
                outline: "border border-text/20 bg-transparent hover:bg-surface hover:text-text",
                secondary: "bg-surface text-text hover:bg-surface/80 border border-text/10",
                ghost: "hover:bg-surface hover:text-text",
                link: "text-primary underline-offset-4 hover:underline",
                glass: "glass-input hover:bg-white/10 text-text",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
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

        // Wrap content in motion for subtle click effect if it's a regular button
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
                {...props as any} // Cast to any to avoid motion/react types conflict if strictly typed
            >
                {Content}
            </motion.button>
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };

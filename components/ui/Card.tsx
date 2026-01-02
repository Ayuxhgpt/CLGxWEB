"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface CardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, hoverEffect = false, ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                initial={hoverEffect ? { y: 0 } : undefined}
                whileHover={hoverEffect ? { y: -5 } : undefined}
                transition={{ type: "spring", stiffness: 300 }}
                className={cn(
                    "glass-panel rounded-xl p-6 relative overflow-hidden group",
                    className
                )}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

Card.displayName = "Card";

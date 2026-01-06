"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ThemeSelect() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-[100px] h-[32px] bg-bg-surface rounded-full animate-pulse" />;
    }

    const options = [
        { value: "system", label: "System", icon: Monitor },
        { value: "light", label: "Light", icon: Sun },
        { value: "dark", label: "Dark", icon: Moon },
    ];

    return (
        <div className="flex items-center gap-1 p-1 rounded-full bg-bg-surface border border-border-subtle">
            {options.map((option) => {
                const isActive = theme === option.value;
                return (
                    <button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={cn(
                            "relative flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors z-10",
                            isActive ? "text-text-primary" : "text-text-muted hover:text-text-secondary"
                        )}
                        aria-label={`Switch to ${option.label} theme`}
                        title={option.label}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="theme-indicator"
                                className="absolute inset-0 bg-bg-card rounded-full border border-border-subtle shadow-sm z-[-1]"
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30
                                }}
                            />
                        )}
                        <option.icon className="w-4 h-4" />
                    </button>
                );
            })}
        </div>
    );
}

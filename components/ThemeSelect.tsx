"use client";

import * as React from "react";
import { Monitor, Moon, Sun, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function ThemeSelect() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        setMounted(true);
        // Handle click outside
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!mounted) {
        return <div className="w-32 h-9 bg-[var(--bg-surface)] rounded-md animate-pulse" />;
    }

    const options = [
        { value: "light", label: "Light", icon: Sun },
        { value: "dark", label: "Dark", icon: Moon },
        { value: "system", label: "System", icon: Monitor },
    ];

    const currentOption = options.find((opt) => opt.value === theme) || options[2];

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium transition-all duration-200",
                    "bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)]",
                    "hover:border-[var(--border-highlight)] hover:text-[var(--text-primary)]"
                )}
                aria-label="Select theme"
            >
                <currentOption.icon className="w-4 h-4" />
                <span>{currentOption.label}</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: -40 }} // Pop UP because it's in the footer
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.1 }}
                        className="absolute bottom-full left-0 mb-2 w-36 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-lg p-1 z-50 overflow-hidden"
                    >
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    setTheme(option.value);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors",
                                    theme === option.value
                                        ? "bg-[var(--bg-surface)] text-[var(--text-primary)] font-medium"
                                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <option.icon className="w-4 h-4" />
                                    <span>{option.label}</span>
                                </div>
                                {theme === option.value && <Check className="w-3 h-3 text-[var(--primary)]" />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

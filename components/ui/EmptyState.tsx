"use client";

import { LucideIcon, PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { ReactNode } from "react";

interface EmptyStateProps {
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    icon?: LucideIcon;
    className?: string;
    children?: ReactNode;
}

export function EmptyState({ title, description, action, icon: Icon = PackageOpen, className, children }: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface-2)]/30", className)}>
            <div className="bg-[var(--bg-main)] p-4 rounded-full mb-4">
                <Icon className="h-8 w-8 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-xs mb-6">{description}</p>
            {action && (
                <Button onClick={action.onClick} variant="secondary" size="sm">
                    {action.label}
                </Button>
            )}
            {children}
        </div>
    );
}

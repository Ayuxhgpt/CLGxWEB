import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 uppercase tracking-wide",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-[rgb(var(--primary))] text-white shadow hover:bg-[rgb(var(--primary))/0.8]",
                secondary:
                    "border-transparent bg-[rgb(var(--bg-surface))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-surface))/0.8]",
                destructive:
                    "border-transparent bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20",
                outline: "text-[rgb(var(--text-primary))]",
                verified: "border-transparent bg-green-500/10 text-green-500 border-green-500/20", // The "Gold Checkmark" equivalent
                pending: "border-transparent bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }

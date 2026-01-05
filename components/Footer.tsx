import Link from "next/link";
import { ThemeSelect } from "./ThemeSelect";

export default function Footer() {
    return (
        <footer className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-page)] transition-colors duration-300">
            <div className="container mx-auto px-4 md:px-6 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                            PharmaElevate
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                            &copy; {new Date().getFullYear()} Satyadev College. All rights reserved.
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                            <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
                                Privacy
                            </Link>
                            <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">
                                Terms
                            </Link>
                        </div>

                        <div className="h-4 w-px bg-[var(--border-subtle)]" />

                        <ThemeSelect />
                    </div>
                </div>
            </div>
        </footer>
    );
}

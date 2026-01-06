"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, LayoutDashboard, Settings } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ThemeSelect } from "@/components/ThemeSelect";

export default function Navbar() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/college", label: "College" },
        { href: "/faculty", label: "Faculty" },
        { href: "/about", label: "About" },
        { href: "/albums", label: "Gallery" },
        { href: "/pharma", label: "Knowledge" },
        { href: "/notes", label: "Notes" },
        { href: "/resources", label: "Resources" },
    ];

    const isActive = (path: string) => {
        if (path === "/" && pathname !== "/") return false;
        return pathname?.startsWith(path);
    };

    return (
        <header
            className={cn(
                "fixed top-0 w-full z-50 border-b transition-all duration-300",
                "bg-[rgb(var(--bg-surface))] border-[rgb(var(--border-subtle))] py-3"
            )}
        >
            <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                {/* Brand */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-[var(--border-subtle)] shadow-lg group-hover:scale-105 transition-transform bg-[var(--bg-surface)]">
                        <Image src="/assets/scp.jpg" alt="Logo" width={40} height={40} className="object-contain h-full w-full" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-muted)] group-hover:to-[var(--accent-primary)] transition-all">
                            PharmaElevate
                        </h1>
                        <p className="text-[10px] text-[var(--text-muted)] font-medium tracking-wide uppercase">
                            Satyadev College
                        </p>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "text-sm font-medium transition-colors",
                                    isActive(link.href)
                                        ? "text-[var(--text-primary)] bg-[var(--bg-surface)]"
                                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                )}
                            >
                                {link.label}
                            </Button>
                        </Link>
                    ))}
                </nav>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <ThemeSelect />
                    {session ? (
                        <div className="flex items-center gap-3 pl-4 border-l border-[var(--border-subtle)]">
                            <Link href="/dashboard">
                                <Button
                                    variant={isActive('/dashboard') ? "secondary" : "ghost"}
                                    size="sm"
                                    className="hidden lg:flex"
                                >
                                    <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                                </Button>
                            </Link>

                            {/* Profile Dropdown */}
                            <div className="relative group" onMouseEnter={() => setIsProfileOpen(true)} onMouseLeave={() => setIsProfileOpen(false)}>
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] cursor-pointer hover:shadow-lg hover:shadow-purple-500/20 transition-all">
                                    <div className="h-full w-full rounded-full bg-[var(--bg-page)] flex items-center justify-center overflow-hidden">
                                        {session.user?.image ? (
                                            <Image
                                                src={session.user.image}
                                                alt="User"
                                                width={36}
                                                height={36}
                                                className="h-full w-full object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <span className="font-bold text-xs">{session.user?.name?.[0]?.toUpperCase()}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Dropdown Menu */}
                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl overflow-hidden p-2"
                                        >
                                            <div className="px-3 py-2 border-b border-[var(--border-subtle)] mb-2">
                                                <p className="text-sm font-bold text-[var(--text-primary)] truncate">{session.user?.name}</p>
                                                <p className="text-xs text-[var(--text-secondary)] truncate">{session.user?.email}</p>
                                            </div>

                                            <Link href="/profile" onClick={() => setIsProfileOpen(false)}>
                                                <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--bg-surface)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                                                    <User className="h-4 w-4" /> My Profile
                                                </div>
                                            </Link>
                                            <Link href="/settings" onClick={() => setIsProfileOpen(false)}>
                                                <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--bg-surface)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                                                    <Settings className="h-4 w-4" /> Settings
                                                </div>
                                            </Link>
                                            <div className="h-px bg-[var(--border-subtle)] my-2" />
                                            <button
                                                onClick={() => signOut({ callbackUrl: '/login' })}
                                                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-red-500/10 text-sm text-red-400 hover:text-red-300 transition-colors cursor-pointer text-left"
                                            >
                                                <LogOut className="h-4 w-4" /> Sign Out
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button>
                                Login
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-[var(--text-primary)]"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-[var(--bg-main)] border-b border-[var(--border-subtle)] overflow-hidden"
                    >
                        <div className="p-4 space-y-4">
                            {navLinks.map((link) => (
                                <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}>
                                    <div className={cn(
                                        "block p-3 rounded-xl hover:bg-[var(--bg-surface)] font-medium transition-colors",
                                        isActive(link.href)
                                            ? "text-[var(--text-primary)] bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
                                            : "text-[var(--text-secondary)]"
                                    )}>
                                        {link.label}
                                    </div>
                                </Link>
                            ))}
                            <div className="h-px bg-[var(--border-subtle)] my-2" />
                            {session ? (
                                <>
                                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                                        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                                            <LayoutDashboard className="h-5 w-5" /> Dashboard
                                        </div>
                                    </Link>
                                    <Link href="/profile" onClick={() => setIsOpen(false)}>
                                        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                                            <User className="h-5 w-5" /> Profile
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/login' })}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors text-left"
                                    >
                                        <LogOut className="h-5 w-5" /> Sign Out
                                    </button>
                                </>
                            ) : (
                                <Link href="/login" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full">Login</Button>
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header >
    );
}

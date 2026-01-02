"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, LayoutDashboard, Image as ImageIcon, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function Navbar() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/pharma", label: "Knowledge" },
        { href: "/notes", label: "Notes" },
        { href: "/resources", label: "Resources" },
    ];

    return (
        <header
            className={cn(
                "fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent",
                scrolled ? "bg-[var(--bg-main)]/80 backdrop-blur-md border-[var(--border-subtle)] py-3" : "bg-transparent py-5"
            )}
        >
            <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                {/* Brand */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 shadow-lg group-hover:scale-105 transition-transform">
                        <img src="/assists/scp.jpg" alt="Logo" className="object-cover h-full w-full" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-[var(--accent-primary)] transition-all">
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
                            <Button variant="ghost" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                                {link.label}
                            </Button>
                        </Link>
                    ))}
                </nav>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-4">
                    {session ? (
                        <div className="flex items-center gap-3 pl-4 border-l border-[var(--border-subtle)]">
                            <Link href="/dashboard">
                                <Button variant="secondary" size="sm" className="hidden lg:flex">
                                    <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                                </Button>
                            </Link>

                            <div className="relative group">
                                <Link href="/profile">
                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] cursor-pointer hover:shadow-lg hover:shadow-purple-500/20 transition-all">
                                        <div className="h-full w-full rounded-full bg-[var(--bg-main)] flex items-center justify-center overflow-hidden">
                                            {session.user?.image ? (
                                                <img src={session.user.image} alt="User" className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="font-bold text-xs">{session.user?.name?.[0]?.toUpperCase()}</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button className="bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-black border-transparent shadow-[0_0_20px_rgba(6,182,212,0.3)]">
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
                                    <div className="block p-3 rounded-xl hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition-colors">
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
                                        onClick={() => signOut()}
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
        </header>
    );
}

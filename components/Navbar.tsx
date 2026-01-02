'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Navbar() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="nav-glass" id="site-header" role="banner">
            <div className="nav-inner container">
                <Link href="/" className="brand" aria-label="PharmaElevate home">
                    <img src="/assists/scp.jpg" alt="Logo" className="brand-logo" />
                    <div className="brand-text">
                        <div className="brand-title">PharmaElevate</div>
                        <div className="brand-sub">Satyadev College of Pharmacy</div>
                    </div>
                </Link>

                <nav className={`nav-links ${isOpen ? 'flex flex-col absolute top-[70px] right-5 bg-black/90 p-4 rounded-xl' : 'hidden md:flex'}`}>
                    <Link href="/" className="hover:text-accent transition">Home</Link>
                    <Link href="/pharma" className="hover:text-accent transition">Knowledge</Link>
                    <Link href="/notes" className="hover:text-accent transition">Notes</Link>
                    <Link href="/resources" className="hover:text-accent transition">Resources</Link>
                    {session ? (
                        <>
                            <Link href="/dashboard" className="hover:text-accent transition">Dashboard</Link>
                            <Link href="/albums" className="hover:text-accent transition">Albums</Link>
                            <Link href="/profile" className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600 hover:border-accent ml-2">
                                <span className="text-sm font-bold">{session.user?.name?.[0]?.toUpperCase() || 'U'}</span>
                            </Link>
                        </>
                    ) : (
                        <Link href="/login" className="text-accent font-bold">Login</Link>
                    )}
                </nav>

                <button
                    id="menuBtn"
                    className="menu-btn md:hidden"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <i className="fa fa-bars"></i>
                </button>
            </div>
        </header>
    );
}

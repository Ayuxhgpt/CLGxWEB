"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
    Search, User, Shield, ShieldOff, Ban, CheckCircle,
    MoreVertical, ChevronLeft, ChevronRight, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface UserData {
    _id: string;
    name: string;
    email: string;
    role: 'student' | 'admin';
    year: string;
    isBlocked: boolean;
    createdAt: string;
    lastLogin?: string;
}

export default function UserManagementPage() {
    const { data: session } = useSession();
    const router = useRouter();

    // Data State
    const [users, setUsers] = useState<UserData[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Modal State
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [modalAction, setModalAction] = useState<'PROMOTE' | 'DEMOTE' | 'BLOCK' | 'UNBLOCK' | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Access Check
    useEffect(() => {
        if (session && session.user.role !== "admin") {
            router.push("/dashboard");
        }
    }, [session]);

    // Data Fetching
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const query = new URLSearchParams({
                    page: page.toString(),
                    limit: "10",
                    search,
                    role: roleFilter,
                    status: statusFilter
                });

                const res = await fetch(`/api/admin/users?${query}`);
                const data = await res.json();

                if (res.ok) {
                    setUsers(data.users);
                    setTotalUsers(data.totalUsers);
                    setTotalPages(data.totalPages);
                }
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchUsers, 300);
        return () => clearTimeout(debounce);
    }, [page, search, roleFilter, statusFilter]);

    // Action Handler
    const handleAction = async () => {
        if (!selectedUser || !modalAction) return;
        setIsProcessing(true);

        try {
            const res = await fetch(`/api/admin/users/${selectedUser._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: modalAction }),
            });

            const data = await res.json();

            if (res.ok) {
                // Refresh local state 
                setUsers(users.map(u => u._id === selectedUser._id ? { ...u, ...data.user } : u));
                closeModal();
                alert(data.message); // Simple feedback, can be toasted
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
            alert("Action failed.");
        } finally {
            setIsProcessing(false);
        }
    };

    const closeModal = () => {
        setSelectedUser(null);
        setModalAction(null);
    };

    const confirmAction = (user: UserData, action: typeof modalAction) => {
        setSelectedUser(user);
        setModalAction(action);
    };

    const getModalContent = () => {
        switch (modalAction) {
            case 'PROMOTE': return { title: "Promote to Admin", desc: "This user will have full access to manage content and users.", color: "text-blue-500", icon: Shield };
            case 'DEMOTE': return { title: "Demote to Student", desc: "This user will lose all admin privileges immediately.", color: "text-orange-500", icon: ShieldOff };
            case 'BLOCK': return { title: "Block User", desc: "This user will be logged out and prevented from accessing the platform.", color: "text-red-500", icon: Ban };
            case 'UNBLOCK': return { title: "Unblock User", desc: "This user will regain access to their account.", color: "text-green-500", icon: CheckCircle };
            default: return { title: "Confirm Action", desc: "Are you sure?", color: "text-gray-500", icon: AlertTriangle };
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            <Navbar />

            <main className="container mx-auto px-4 pt-24 pb-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)]">User Management</h1>
                        <p className="text-[var(--text-secondary)]">Total Users: {totalUsers}</p>
                    </div>
                    <Button onClick={() => router.push('/admin')} variant="ghost">
                        <ChevronLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                    </Button>
                </div>

                {/* Filters */}
                <Card className="mb-6 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <Input
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                icon={<Search className="h-4 w-4" />}
                            />
                        </div>
                        <select
                            className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                            value={roleFilter}
                            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                        >
                            <option value="all">All Roles</option>
                            <option value="student">Student</option>
                            <option value="admin">Admin</option>
                        </select>
                        <select
                            className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="blocked">Blocked</option>
                        </select>
                    </div>
                </Card>

                {/* Table */}
                <Card className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[var(--bg-surface-2)] text-[var(--text-secondary)] text-xs uppercase tracking-wider text-left">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Year</th>
                                    <th className="px-6 py-4">Joined</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-subtle)]">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-[var(--text-secondary)]">Loading users...</td></tr>
                                ) : users.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center text-[var(--text-secondary)]">No users found.</td></tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user._id} className="hover:bg-[var(--bg-surface-2)]/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[1px] mr-3">
                                                        <div className="h-full w-full rounded-full bg-[var(--bg-main)] flex items-center justify-center text-xs font-bold">
                                                            {user.name[0].toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-[var(--text-primary)]">{user.name}</div>
                                                        <div className="text-sm text-[var(--text-secondary)]">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2 py-1 text-xs rounded-full font-medium border",
                                                    user.role === 'admin'
                                                        ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                                        : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                )}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.isBlocked ? (
                                                    <span className="flex items-center text-red-400 text-xs font-medium">
                                                        <Ban className="h-3 w-3 mr-1" /> Blocked
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-green-400 text-xs font-medium">
                                                        <CheckCircle className="h-3 w-3 mr-1" /> Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{user.year}</td>
                                            <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {user.role === 'student' ? (
                                                        <Button size="sm" variant="secondary" onClick={() => confirmAction(user, 'PROMOTE')} className="h-8 w-8 p-0" title="Promote to Admin">
                                                            <Shield className="h-4 w-4 text-blue-400" />
                                                        </Button>
                                                    ) : (
                                                        <Button size="sm" variant="secondary" onClick={() => confirmAction(user, 'DEMOTE')} className="h-8 w-8 p-0" title="Demote to Student">
                                                            <ShieldOff className="h-4 w-4 text-orange-400" />
                                                        </Button>
                                                    )}

                                                    {user.isBlocked ? (
                                                        <Button size="sm" variant="secondary" onClick={() => confirmAction(user, 'UNBLOCK')} className="h-8 w-8 p-0" title="Unblock User">
                                                            <CheckCircle className="h-4 w-4 text-green-400" />
                                                        </Button>
                                                    ) : (
                                                        <Button size="sm" variant="secondary" onClick={() => confirmAction(user, 'BLOCK')} className="h-8 w-8 p-0 bg-red-500/10 hover:bg-red-500/20 border-red-500/20" title="Block User">
                                                            <Ban className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-[var(--border-subtle)] flex justify-between items-center">
                        <Button variant="ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)} size="sm">
                            <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                        </Button>
                        <span className="text-sm text-[var(--text-secondary)]">Page {page} of {totalPages}</span>
                        <Button variant="ghost" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} size="sm">
                            Next <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </Card>
            </main>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {modalAction && selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] w-full max-w-md p-6 rounded-2xl shadow-2xl"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`p-3 rounded-full bg-opacity-10 ${getModalContent().color.replace('text', 'bg')}`}>
                                    {(() => {
                                        const Icon = getModalContent().icon;
                                        return <Icon className={`h-6 w-6 ${getModalContent().color}`} />;
                                    })()}
                                </div>
                                <h2 className="text-xl font-bold text-[var(--text-primary)]">{getModalContent().title}</h2>
                            </div>

                            <p className="text-[var(--text-secondary)] mb-6">
                                {getModalContent().desc}
                            </p>

                            <div className="bg-[var(--bg-main)] p-4 rounded-xl mb-6 border border-[var(--border-subtle)]">
                                <p className="text-xs text-[var(--text-muted)] uppercase font-bold mb-1">Target User</p>
                                <p className="font-bold text-[var(--text-primary)]">{selectedUser.name}</p>
                                <p className="text-sm text-[var(--text-secondary)]">{selectedUser.email}</p>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <Button variant="ghost" onClick={closeModal} disabled={isProcessing}>Cancel</Button>
                                <Button
                                    className={`${modalAction === 'BLOCK' || modalAction === 'DEMOTE' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
                                    onClick={handleAction}
                                    isLoading={isProcessing}
                                >
                                    Confirm
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

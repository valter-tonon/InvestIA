"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    PieChart,
    BrainCircuit,
    Bell,
    LogOut,
    Menu,
    ChevronRight,
    X,
    TrendingUp,
    Calculator
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/useAuth";
import { useState, useEffect } from "react";

const sidebarLinks = [
    { name: "Visão Geral", href: "/dashboard", icon: LayoutDashboard },
    { name: "Minha Carteira", href: "/dashboard/wallet", icon: PieChart },
    { name: "Mercado", href: "/dashboard/market", icon: LayoutDashboard },
    { name: "Ranking", href: "/dashboard/ranking", icon: TrendingUp },
    { name: "Filosofias", href: "/dashboard/philosophies", icon: BrainCircuit },
    { name: "Alertas", href: "/dashboard/alerts", icon: Bell },
    { name: "Simuladores", href: "/dashboard/simuladores", icon: Calculator },
];

interface AppSidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

export function AppSidebar({ collapsed, setCollapsed }: AppSidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    // collapsed state lifted up
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // Close mobile menu on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMobileOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="fixed top-4 left-4 z-40 lg:hidden p-2 rounded-md bg-sidebar border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
                aria-label="Abrir menu"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
                    // Mobile: drawer that slides in
                    "lg:translate-x-0",
                    mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                    // Desktop: collapsible
                    collapsed ? "lg:w-16" : "lg:w-64",
                    // Mobile: always full width when open
                    "w-64"
                )}
            >
                {/* Header / Logo */}
                <div className="flex h-16 items-center border-b border-sidebar-border px-4 justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <BrainCircuit className="size-5" />
                        </div>
                        <span
                            className={cn(
                                "font-display text-lg font-bold tracking-tight transition-all duration-300",
                                collapsed ? "lg:w-0 lg:opacity-0" : "lg:w-auto lg:opacity-100"
                            )}
                        >
                            InvestCopilot
                        </span>
                    </Link>

                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden p-1 rounded-md hover:bg-sidebar-accent"
                        aria-label="Fechar menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="grid gap-1 px-2">
                        {sidebarLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                        isActive && "bg-sidebar-accent text-primary shadow-[inset_3px_0_0_0_var(--sidebar-primary)]"
                                    )}
                                    title={collapsed ? link.name : undefined}
                                >
                                    <link.icon className={cn("size-4 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                    <span
                                        className={cn(
                                            "truncate transition-all duration-300",
                                            collapsed ? "lg:w-0 lg:opacity-0" : "lg:w-auto lg:opacity-100"
                                        )}
                                    >
                                        {link.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer / User Profile */}
                <div className="border-t border-sidebar-border p-2">
                    <div
                        className={cn(
                            "flex items-center gap-3 overflow-hidden rounded-md p-2 hover:bg-sidebar-accent transition-colors",
                            collapsed ? "lg:justify-center" : ""
                        )}
                    >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-600 text-[10px] font-bold text-white uppercase shadow-lg shadow-primary/20">
                            {user?.name?.slice(0, 2) || "U"}
                        </div>

                        <div
                            className={cn(
                                "flex flex-1 flex-col overflow-hidden transition-all duration-300",
                                collapsed ? "lg:w-0 lg:opacity-0 lg:hidden" : "lg:w-auto lg:opacity-100"
                            )}
                        >
                            <span className="truncate text-sm font-medium">{user?.name}</span>
                            <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive", collapsed && "lg:hidden")}
                            onClick={logout}
                            title="Sair"
                        >
                            <LogOut className="size-4" />
                        </Button>
                    </div>

                    {/* Collapse Toggle - Desktop Only */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden lg:flex w-full mt-2 h-6 text-muted-foreground hover:text-foreground"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        {collapsed ? <ChevronRight className="size-4" /> : <div className="flex items-center text-xs gap-2"><Menu className="size-3" /> <span className="sr-only">Recolher</span></div>}
                    </Button>
                </div>
            </aside>
        </>
    );
}

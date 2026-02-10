"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Activity,
    BarChart3,
    LogOut,
    Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/useAuth";

const adminLinks = [
    { name: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
    { name: "Usuários", href: "/super-admin/users", icon: Users },
    { name: "Assinaturas", href: "/super-admin/subscriptions", icon: CreditCard },
    { name: "Analytics", href: "/super-admin/analytics", icon: BarChart3 },
    { name: "Logs de Atividade", href: "/super-admin/activity-logs", icon: Activity },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <aside className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-border bg-card text-card-foreground">
            {/* Header */}
            <div className="flex h-16 items-center border-b border-border px-4">
                <Link href="/super-admin" className="flex items-center gap-2">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Shield className="size-5" />
                    </div>
                    <span className="font-display text-lg font-bold tracking-tight">
                        Admin Panel
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="grid gap-1 px-2">
                    {adminLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                    isActive && "bg-accent text-primary shadow-[inset_3px_0_0_0_var(--primary)]"
                                )}
                            >
                                <link.icon className={cn("size-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                                <span>{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Footer */}
            <div className="border-t border-border p-4">
                <div className="flex items-center gap-3 rounded-md p-2 bg-muted/50">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-600 text-[10px] font-bold text-white uppercase">
                        {user?.name?.slice(0, 2) || "SA"}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium">{user?.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{user?.role}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={logout}
                        title="Sair"
                    >
                        <LogOut className="size-4" />
                    </Button>
                </div>
            </div>
        </aside>
    );
}

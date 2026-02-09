"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { AppSidebar } from "@/components/app-sidebar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    const [collapsed, setCollapsed] = useState(false);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <LoadingSpinner className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!user) {
        return null; // Redirect handled in useEffect
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar */}
            <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

            {/* Main Content Area */}
            <main
                className={`flex-1 transition-all duration-300 ${collapsed ? "lg:ml-16" : "lg:ml-64"} p-4 sm:p-6 lg:p-8 overflow-y-auto h-screen scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent pt-16 lg:pt-8`}
            >
                <div className="mx-auto max-w-7xl animate-in fade-in zoom-in-95 duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
}

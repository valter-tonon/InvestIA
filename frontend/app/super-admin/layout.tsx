"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || user.role !== 'SUPER_ADMIN')) {
            router.push("/dashboard");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <LoadingSpinner className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!user || user.role !== 'SUPER_ADMIN') {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <AdminSidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                <div className="mx-auto max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
}

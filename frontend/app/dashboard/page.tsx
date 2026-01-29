'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Carregando...</p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <header className="border-b bg-white dark:bg-slate-800">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <h1 className="text-2xl font-bold">InvestIA</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{user.name}</span>
                        <Button onClick={logout} variant="outline" size="sm">
                            Sair
                        </Button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto p-6">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">Bem-vindo ao InvestIA, {user.name}!</p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ativos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">0</div>
                            <p className="text-sm text-muted-foreground">ativos cadastrados</p>
                            <Button
                                className="mt-4 w-full"
                                onClick={() => router.push('/dashboard/assets')}
                            >
                                Ver Ativos
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Filosofias</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">0</div>
                            <p className="text-sm text-muted-foreground">filosofias uploadadas</p>
                            <Button
                                className="mt-4 w-full"
                                onClick={() => router.push('/dashboard/philosophies')}
                            >
                                Ver Filosofias
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Carteira</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">R$ 0</div>
                            <p className="text-sm text-muted-foreground">valor total</p>
                            <Button
                                className="mt-4 w-full"
                                onClick={() => router.push('/dashboard/wallet')}
                                variant="outline"
                            >
                                Ver Carteira
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

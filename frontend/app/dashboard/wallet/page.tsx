'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function WalletPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) return <div>Carregando...</div>;
    if (!user) return null;

    return (
        <main className="container mx-auto p-6">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Minha Carteira</h2>
                    <p className="text-muted-foreground">Gerencie seus ativos em carteira</p>
                </div>
                <Button onClick={() => router.push('/dashboard/market')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Ativo
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Seus Ativos</CardTitle>
                    <CardDescription>
                        Você ainda não possui ativos na sua carteira. Vá ao Mercado para adicionar.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center py-12">
                        <Button variant="outline" onClick={() => router.push('/dashboard/market')}>
                            Ir para o Mercado
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}

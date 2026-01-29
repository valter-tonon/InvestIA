'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { assetsApi, Asset } from '@/lib/api/assets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

export default function AssetsPage() {
    const { user, loading: authLoading, logout } = useAuth();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            loadAssets();
        }
    }, [user]);

    const loadAssets = async () => {
        try {
            const data = await assetsApi.list();
            setAssets(data);
        } catch (error: any) {
            toast.error('Erro ao carregar ativos');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <header className="border-b bg-white dark:bg-slate-800">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <h1 className="text-2xl font-bold cursor-pointer" onClick={() => router.push('/dashboard')}>
                        InvestIA
                    </h1>
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
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Ativos</h2>
                        <p className="text-muted-foreground">Gerencie seus ativos financeiros</p>
                    </div>
                    <Button onClick={() => router.push('/dashboard')}>Voltar ao Dashboard</Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Ativos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p>Carregando ativos...</p>
                        ) : assets.length === 0 ? (
                            <p className="text-muted-foreground">Nenhum ativo cadastrado ainda.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ticker</TableHead>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Setor</TableHead>
                                        <TableHead className="text-right">Preço</TableHead>
                                        <TableHead className="text-right">P/L</TableHead>
                                        <TableHead className="text-right">DY</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assets.map((asset) => (
                                        <TableRow key={asset.id}>
                                            <TableCell className="font-medium">{asset.ticker}</TableCell>
                                            <TableCell>{asset.name}</TableCell>
                                            <TableCell>{asset.type}</TableCell>
                                            <TableCell>{asset.sector || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                {asset.currentPrice
                                                    ? `R$ ${asset.currentPrice.toFixed(2)}`
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {asset.indicators?.pl?.toFixed(2) || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {asset.indicators?.dy
                                                    ? `${(asset.indicators.dy * 100).toFixed(2)}%`
                                                    : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

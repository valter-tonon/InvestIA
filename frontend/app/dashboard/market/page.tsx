'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { assetsApi } from '@/lib/api/assets';
import type { Asset, AssetFilters } from '@/lib/types/asset';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { AssetSkeleton } from '@/components/assets/AssetSkeleton';
import { AssetTypeBadge } from '@/components/assets/IndicatorBadge';
import { toast } from 'sonner';
import { Plus, Search, Trash2, Eye } from 'lucide-react';

export default function AssetsPage() {
    const { user, loading: authLoading } = useAuth();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<AssetFilters>({ page: 1, perPage: 10 });
    const [totalPages, setTotalPages] = useState(1);
    const router = useRouter();

    const loadAssets = useCallback(async () => {
        try {
            setLoading(true);
            const response = await assetsApi.list(filters);
            setAssets(response.data);
            setTotalPages(response.meta.lastPage);
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao carregar ativos';
            toast.error(message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            loadAssets();
        }
    }, [user, loadAssets]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (user) loadAssets();
        }, 300);
        return () => clearTimeout(timer);
    }, [filters, user, loadAssets]);

    const handleDelete = async (id: string, ticker: string) => {
        if (!confirm(`Tem certeza que deseja remover o ativo ${ticker}?`)) return;

        try {
            await assetsApi.delete(id);
            toast.success('Ativo removido com sucesso!');
            loadAssets();
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao remover ativo';
            toast.error(message);
        }
    };

    const handleSearch = (search: string) => {
        setFilters({ ...filters, search, page: 1 });
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setFilters({ ...filters, page: newPage });
        }
    };

    if (authLoading) {
        return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
    }

    if (!user) return null;

    return (


        <>
            <main className="container mx-auto p-6">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Mercado de Ativos</h2>
                        <p className="text-muted-foreground">Explore e monitore todos os ativos disponíveis</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => router.push('/dashboard')} variant="outline">
                            Voltar ao Dashboard
                        </Button>
                        <Button onClick={() => router.push('/dashboard/market/new')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Ativo
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Todos os Ativos (Brapi)</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar ticker ou nome..."
                                    className="pl-10"
                                    value={filters.search || ''}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <AssetSkeleton />
                        ) : assets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <p className="text-lg text-muted-foreground mb-4">
                                    {filters.search ? 'Nenhum ativo encontrado' : 'Nenhum ativo cadastrado ainda.'}
                                </p>
                                {!filters.search && (
                                    <Button onClick={() => router.push('/dashboard/market/new')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Adicionar primeiro ativo
                                    </Button>
                                )}
                            </div>
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
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assets.map((asset) => (
                                        <TableRow key={asset.id}>
                                            <TableCell className="font-medium">{asset.ticker}</TableCell>
                                            <TableCell>{asset.name}</TableCell>
                                            <TableCell>
                                                <AssetTypeBadge type={asset.type} />
                                            </TableCell>
                                            <TableCell>{asset.sector || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                {asset.currentPrice
                                                    ? formatCurrency(asset.currentPrice)
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {asset.peRatio?.toFixed(2) || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {asset.dividendYield
                                                    ? `${asset.dividendYield.toFixed(2).replace('.', ',')}%`
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.push(`/dashboard/market/${asset.id}`)}
                                                        title="Ver detalhes"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDelete(asset.id, asset.ticker)}
                                                        title="Remover"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {totalPages > 1 && (
                    <div className="flex justify-center mt-4 gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange((filters.page || 1) - 1)}
                            disabled={(filters.page || 1) <= 1 || loading}
                        >
                            Anterior
                        </Button>
                        <div className="flex items-center px-4 text-sm">
                            Página {filters.page || 1} de {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange((filters.page || 1) + 1)}
                            disabled={(filters.page || 1) >= totalPages || loading}
                        >
                            Próxima
                        </Button>
                    </div>
                )}
            </main>
        </>
    );
}

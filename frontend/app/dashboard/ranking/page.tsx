'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { rankingApi } from '@/lib/api/ranking';
import type { RankedAsset, RankingStrategy } from '@/lib/types/ranking';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { TrendingUp, ArrowLeft } from 'lucide-react';

export default function RankingPage() {
    const { user, loading: authLoading } = useAuth();
    const [assets, setAssets] = useState<RankedAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [strategy, setStrategy] = useState<RankingStrategy>('COMPOSITE' as RankingStrategy);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            loadRanking();
        }
    }, [user, strategy]);

    const loadRanking = async () => {
        try {
            setLoading(true);
            const data = await rankingApi.getRanking(strategy, 20);
            setAssets(data);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao carregar ranking');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number): string => {
        if (score >= 0.5) return 'bg-green-500';
        if (score >= 0.2) return 'bg-yellow-500';
        if (score >= 0) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const formatUpside = (upside: number): string => {
        if (upside === -1) return 'N/A';
        return new Intl.NumberFormat('pt-BR', {
            style: 'percent',
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
        }).format(upside);
    };

    if (authLoading) {
        return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
    }

    if (!user) return null;

    return (
        <main className="container mx-auto p-6">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Ranking de Ativos</h2>
                    <p className="text-muted-foreground">Oportunidades de investimento baseadas em Value Investing</p>
                </div>
                <Button onClick={() => router.push('/dashboard')} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar ao Dashboard
                </Button>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Top Oportunidades</CardTitle>
                            <CardDescription>Ativos ordenados por potencial de valorização</CardDescription>
                        </div>
                        <div className="w-48">
                            <Select value={strategy} onValueChange={(val) => setStrategy(val as RankingStrategy)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="COMPOSITE">Composto</SelectItem>
                                    <SelectItem value="GRAHAM">Graham (Value)</SelectItem>
                                    <SelectItem value="BAZIN">Bazin (Dividendos)</SelectItem>
                                    <SelectItem value="BARSI">Barsi (Consistência)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">Carregando ranking...</div>
                    ) : assets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <p className="text-lg text-muted-foreground mb-4">
                                Nenhum ativo disponível para ranking.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Importe ativos primeiro para visualizar o ranking.
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16">#</TableHead>
                                    <TableHead>Ticker</TableHead>
                                    <TableHead>Setor</TableHead>
                                    <TableHead className="text-right">Preço</TableHead>
                                    <TableHead className="text-right">Graham</TableHead>
                                    <TableHead className="text-right">Bazin</TableHead>
                                    <TableHead className="text-right">Barsi</TableHead>
                                    <TableHead className="text-right">Score</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assets.map((asset) => (
                                    <TableRow key={asset.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/dashboard/assets/${asset.id}`)}>
                                        <TableCell className="font-medium">
                                            <Badge variant="outline">{asset.rank}</Badge>
                                        </TableCell>
                                        <TableCell className="font-bold">{asset.ticker}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{asset.sector}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(asset.currentPrice)}</TableCell>
                                        <TableCell className="text-right">
                                            <span className={asset.scores.grahamUpside >= 0 ? 'text-green-600 font-semibold' : 'text-muted-foreground'}>
                                                {formatUpside(asset.scores.grahamUpside)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className={asset.scores.bazinUpside >= 0 ? 'text-green-600 font-semibold' : 'text-muted-foreground'}>
                                                {formatUpside(asset.scores.bazinUpside)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className={asset.scores.barsiUpside >= 0 ? 'text-green-600 font-semibold' : 'text-muted-foreground'}>
                                                {formatUpside(asset.scores.barsiUpside)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge className={getScoreColor(asset.scores.compositeScore)}>
                                                <TrendingUp className="mr-1 h-3 w-3" />
                                                {formatUpside(asset.scores.compositeScore)}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { assetsApi } from '@/lib/api/assets';
import type { Asset } from '@/lib/types/asset';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AssetTypeBadge, IndicatorBadge } from '@/components/assets/IndicatorBadge';
import { toast } from 'sonner';
import { Trash2, ChevronDown, Plus } from 'lucide-react';
import { dividendsApi } from '@/lib/api/dividendsApi';
import { formatCurrency } from '@/lib/utils';
import { Dividend } from '@/types/dividend';
import DividendSummary from '@/components/dividends/DividendSummary';
import DividendChart from '@/components/dividends/DividendChart';
import DividendDataTable from '@/components/dividends/DividendDataTable';
import { fairPriceApi, FairPriceResponse } from '@/lib/api/fairPriceApi';
import FairPriceCard from '@/components/assets/FairPriceCard';

export default function AssetDetailsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const [asset, setAsset] = useState<Asset | null>(null);
    const [loading, setLoading] = useState(true);
    const [dividends, setDividends] = useState<Dividend[]>([]);
    const [loadingDividends, setLoadingDividends] = useState(true);
    const [syncingDividends, setSyncingDividends] = useState(false);
    const [dividendsExpanded, setDividendsExpanded] = useState(false);
    const [fairPrice, setFairPrice] = useState<FairPriceResponse | null>(null);
    const [loadingFairPrice, setLoadingFairPrice] = useState(true);

    const loadAsset = useCallback(async () => {
        try {
            setLoading(true);
            const data = await assetsApi.getById(params.id as string);
            setAsset(data);
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao carregar ativo';
            toast.error(message);
            router.push('/dashboard/market');
        } finally {
            setLoading(false);
        }
    }, [params.id, router]);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        if (params.id) {
            loadAsset();
        }
    }, [user, params.id, router, loadAsset]);

    const handleDelete = async () => {
        if (!asset) return;
        if (!confirm(`Tem certeza que deseja remover o ativo ${asset.ticker}?`)) return;

        try {
            await assetsApi.delete(asset.id);
            toast.success('Ativo removido com sucesso!');
            router.push('/dashboard/market');
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao remover ativo';
            toast.error(message);
        }
    };

    const loadDividends = useCallback(async () => {
        if (!asset) return;
        try {
            setLoadingDividends(true);
            const data = await dividendsApi.getDividendHistory(asset.ticker);
            setDividends(data);
        } catch (error) {
            console.error('Error loading dividends:', error);
        } finally {
            setLoadingDividends(false);
        }
    }, [asset]);

    const loadFairPrice = useCallback(async () => {
        if (!asset) return;
        try {
            setLoadingFairPrice(true);
            const data = await fairPriceApi.getFairPrice(asset.id);
            setFairPrice(data);
        } catch (error) {
            console.error('Error loading fair price:', error);
        } finally {
            setLoadingFairPrice(false);
        }
    }, [asset]);

    useEffect(() => {
        if (asset) {
            loadDividends();
            loadFairPrice();
        }
    }, [asset, loadDividends, loadFairPrice]);

    const handleSyncDividends = async () => {
        if (!asset) return;
        try {
            setSyncingDividends(true);
            const data = await dividendsApi.syncDividends(asset.ticker);
            setDividends(data);
            toast.success('Dividendos sincronizados com sucesso!');
            await loadFairPrice(); // Recalculate fair price after sync
        } catch {
            toast.error('Erro ao sincronizar dividendos');
        } finally {
            setSyncingDividends(false);
        }
    };

    if (!user) return null;

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Carregando...</p>
            </div>
        );
    }

    if (!asset) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Ativo não encontrado</p>
            </div>
        );
    }

    return (

        <main className="container mx-auto p-6 max-w-4xl">
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <h2 className="text-4xl font-bold tracking-tight">{asset.ticker}</h2>
                        <AssetTypeBadge type={asset.type} />
                    </div>
                    <p className="text-xl text-muted-foreground">{asset.name}</p>
                    {asset.sector && (
                        <p className="text-sm text-muted-foreground mt-1">Setor: {asset.sector}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => toast.info('Funcionalidade em desenvolvimento: Adicionar à Carteira')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar à Carteira
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover do Sistema
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Preços */}
                <Card>
                    <CardHeader>
                        <CardTitle>Preços</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Preço Atual</p>
                            <p className="text-3xl font-bold text-green-600">
                                {asset.currentPrice ? formatCurrency(asset.currentPrice) : 'Não disponível'}
                            </p>
                        </div>
                        {asset.targetPrice && (
                            <div>
                                <p className="text-sm text-muted-foreground">Preço Alvo</p>
                                <p className="text-2xl font-semibold">{formatCurrency(asset.targetPrice)}</p>
                                {asset.currentPrice && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Potencial: {(((asset.targetPrice - asset.currentPrice) / asset.currentPrice) * 100).toFixed(2).replace('.', ',')}%
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Indicadores Fundamentalistas */}
                <Card>
                    <CardHeader>
                        <CardTitle>Indicadores Fundamentalistas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {asset.peRatio ? (
                            <IndicatorBadge label="P/L" value={asset.peRatio.toFixed(2).replace('.', ',')} />
                        ) : (
                            <p className="text-sm text-muted-foreground">P/L: Não disponível</p>
                        )}
                        {asset.roe ? (
                            <IndicatorBadge label="ROE" value={`${asset.roe.toFixed(2).replace('.', ',')}%`} />
                        ) : (
                            <p className="text-sm text-muted-foreground">ROE: Não disponível</p>
                        )}
                        {asset.dividendYield ? (
                            <IndicatorBadge label="Dividend Yield" value={`${asset.dividendYield.toFixed(2).replace('.', ',')}%`} />
                        ) : (
                            <p className="text-sm text-muted-foreground">DY: Não disponível</p>
                        )}
                        {!asset.peRatio && !asset.roe && !asset.dividendYield && (
                            <p className="text-sm text-muted-foreground italic">
                                Nenhum indicador cadastrado ainda
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Informações Adicionais */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Informações Adicionais</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Data de Cadastro</p>
                            <p className="font-medium">
                                {new Date(asset.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Última Atualização</p>
                            <p className="font-medium">
                                {new Date(asset.updatedAt).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Fair Price Section */}
            {
                loadingFairPrice ? (
                    <div className="animate-pulse">
                        <div className="h-64 bg-gray-800 rounded-lg"></div>
                    </div>
                ) : fairPrice && (
                    <FairPriceCard fairPrice={fairPrice} />
                )
            }

            {/* Seção de Dividendos com Accordion */}
            <div className="mt-8">
                <Card className="border-gray-700">
                    <div className="flex items-center justify-between p-6 border-b border-gray-700">
                        <button
                            onClick={() => setDividendsExpanded(!dividendsExpanded)}
                            className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                        >
                            <h3 className="text-2xl font-bold">Histórico de Dividendos</h3>
                            {!loadingDividends && dividends.length > 0 && (
                                <span className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full">
                                    {dividends.length} {dividends.length === 1 ? 'registro' : 'registros'}
                                </span>
                            )}
                            <ChevronDown
                                className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${dividendsExpanded ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>
                        <Button
                            onClick={handleSyncDividends}
                            disabled={syncingDividends}
                            variant="outline"
                            size="sm"
                        >
                            {syncingDividends ? 'Sincronizando...' : 'Atualizar Dados'}
                        </Button>
                    </div>

                    {dividendsExpanded && (
                        <div className="p-6 pt-0 space-y-6 border-t border-gray-700">
                            {loadingDividends ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-400">Carregando dividendos...</p>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <DividendSummary dividends={dividends} />
                                    </div>

                                    <Card className="bg-gray-800/30">
                                        <CardHeader>
                                            <CardTitle>Dividendos por Ano</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <DividendChart dividends={dividends} />
                                        </CardContent>
                                    </Card>

                                    <div>
                                        <h4 className="text-lg font-semibold mb-4">Histórico Detalhado</h4>
                                        <DividendDataTable dividends={dividends} />
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </main >
    );
}

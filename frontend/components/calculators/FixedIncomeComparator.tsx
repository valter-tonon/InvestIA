'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowRightLeft, Info, ChevronDown } from 'lucide-react';
import { calculateFixedIncome, calculateFixedIncomeWithContributions, FixedIncomeResult, FixedIncomeResultWithContributions, AssetType, IndexerType, ContributionConfig } from '@/lib/calculators/fixed-income';
import { indicatorsApi } from '@/lib/api/indicators';
import { formatCurrency } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export default function FixedIncomeComparator() {
    const [loading, setLoading] = useState(true);
    const [cdi, setCdi] = useState(10.0);
    const [ipca, setIpca] = useState(4.5);

    // Inputs
    const [amount, setAmount] = useState(10000);
    const [period, setPeriod] = useState(12);
    const [periodUnit, setPeriodUnit] = useState<'months' | 'years' | 'days'>('months');

    // Contribution mode
    const [contributionMode, setContributionMode] = useState<'single' | 'recurring'>('single');
    const [advancedOpen, setAdvancedOpen] = useState(false);

    // Contribution Configuration
    const [contributionConfig, setContributionConfig] = useState<ContributionConfig>({
        enabled: false,
        amount: 500,
        frequencyMonths: 1,
        increaseType: 'none',
        increaseAmount: 0,
        increaseFrequencyMonths: 12
    });

    // Asset A (Taxable default)
    const [assetA, setAssetA] = useState<{ type: AssetType; indexer: IndexerType; rate: number }>({
        type: 'CDB',
        indexer: 'CDI',
        rate: 100
    });

    // Asset B (Exempt default)
    const [assetB, setAssetB] = useState<{ type: AssetType; indexer: IndexerType; rate: number }>({
        type: 'LCI',
        indexer: 'CDI',
        rate: 90
    });

    const [resultA, setResultA] = useState<FixedIncomeResult | FixedIncomeResultWithContributions | null>(null);
    const [resultB, setResultB] = useState<FixedIncomeResult | FixedIncomeResultWithContributions | null>(null);

    // Fetch Indicators
    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await indicatorsApi.getIndicators();
                if (data.CDI) setCdi(data.CDI);
                if (data.IPCA) setIpca(data.IPCA);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    // Calculate
    useEffect(() => {
        let days = period;
        if (periodUnit === 'months') days = period * 30;
        if (periodUnit === 'years') days = period * 365;

        // Prevent calculating for 0 days
        if (days <= 0) return;

        const updatedConfig = { ...contributionConfig, enabled: contributionMode === 'recurring' };

        if (contributionMode === 'recurring') {
            const resA = calculateFixedIncomeWithContributions(
                amount,
                days,
                updatedConfig,
                assetA.type,
                assetA.indexer,
                assetA.rate,
                { cdi, ipca }
            );
            setResultA(resA);

            const resB = calculateFixedIncomeWithContributions(
                amount,
                days,
                updatedConfig,
                assetB.type,
                assetB.indexer,
                assetB.rate,
                { cdi, ipca }
            );
            setResultB(resB);
        } else {
            const resA = calculateFixedIncome(
                amount,
                days,
                assetA.type,
                assetA.indexer,
                assetA.rate,
                { cdi, ipca }
            );
            setResultA(resA);

            const resB = calculateFixedIncome(
                amount,
                days,
                assetB.type,
                assetB.indexer,
                assetB.rate,
                { cdi, ipca }
            );
            setResultB(resB);
        }

    }, [amount, period, periodUnit, assetA, assetB, cdi, ipca, contributionMode, contributionConfig]);

    if (loading) return <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />;

    const isContributionResult = (res: FixedIncomeResult | FixedIncomeResultWithContributions | null): res is FixedIncomeResultWithContributions => {
        return !!(res && 'contributionCount' in res);
    };

    const renderResultCard = (title: string, res: FixedIncomeResult | FixedIncomeResultWithContributions | null, asset: { type: AssetType, rate: number, indexer: string }) => {
        if (!res) return null;
        return (
            <Card className="border-l-4 border-l-primary/50 relative overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex justify-between items-center">
                        {title}
                        <span className="text-xs font-normal px-2 py-1 bg-primary/10 rounded-full text-primary">
                            {asset.type} {asset.rate}% {asset.indexer}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-end border-b pb-2 border-white/5">
                        <span className="text-muted-foreground text-sm">Valor Bruto</span>
                        <span className="font-mono text-lg">{formatCurrency(res.grossTotal)}</span>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-red-400/80">
                            <span>Imp. Renda ({res.irRate}%)</span>
                            <span>- {formatCurrency(res.irTax)}</span>
                        </div>
                        {res.iofTax > 0 && (
                            <div className="flex justify-between text-xs text-red-400/80">
                                <span>IOF ({res.iofRate}%)</span>
                                <span>- {formatCurrency(res.iofTax)}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-end pt-2">
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Valor Líquido</span>
                            <span className="text-[10px] text-green-500 mb-[-2px]">
                                Equiv. CDB: {((res.netYield / (res.grossYield / (asset.rate / 100))) * 100).toFixed(1)}% CDI approx?
                                {/* Simplification: We need a dedicated equivalent function, but for now showing Net */}
                            </span>
                        </div>
                        <span className="text-2xl font-bold text-green-500">{formatCurrency(res.netTotal)}</span>
                    </div>

                    {isContributionResult(res) && (
                        <div className="pt-4 border-t border-white/10 space-y-2 text-xs text-muted-foreground">
                            <div className="flex justify-between">
                                <span>Aportes Realizados</span>
                                <span className="font-mono text-foreground">{res.contributionCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Prazo Médio</span>
                                <span className="font-mono text-foreground">{Math.round(res.averageHoldingPeriod)} dias</span>
                            </div>
                            <div className="flex justify-between">
                                <span>IR Médio</span>
                                <span className="font-mono text-foreground">{res.averageIRRate.toFixed(2)}%</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="grid lg:grid-cols-12 gap-8">
            {/* Controls */}
            <div className="lg:col-span-4 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Configuração</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Contribution Mode Selection */}
                        <div className="space-y-2">
                            <Label>Tipo de Investimento</Label>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 p-3 border border-white/10 rounded-lg cursor-pointer hover:bg-white/5"
                                    onClick={() => setContributionMode('single')}>
                                    <input
                                        type="radio"
                                        id="mode-single"
                                        name="contribution-mode"
                                        checked={contributionMode === 'single'}
                                        onChange={() => setContributionMode('single')}
                                        className="cursor-pointer"
                                    />
                                    <Label htmlFor="mode-single" className="cursor-pointer flex-1 mb-0">
                                        Aporte Único
                                    </Label>
                                </div>
                                <div className="flex items-center gap-3 p-3 border border-white/10 rounded-lg cursor-pointer hover:bg-white/5"
                                    onClick={() => setContributionMode('recurring')}>
                                    <input
                                        type="radio"
                                        id="mode-recurring"
                                        name="contribution-mode"
                                        checked={contributionMode === 'recurring'}
                                        onChange={() => setContributionMode('recurring')}
                                        className="cursor-pointer"
                                    />
                                    <Label htmlFor="mode-recurring" className="cursor-pointer flex-1 mb-0">
                                        Aportes Recorrentes
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Valor Inicial</Label>
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                            />
                        </div>

                        {contributionMode === 'recurring' && (
                            <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                                <div className="space-y-2">
                                    <Label>Valor do Aporte Recorrente</Label>
                                    <Input
                                        type="number"
                                        value={contributionConfig.amount}
                                        onChange={(e) => setContributionConfig({
                                            ...contributionConfig,
                                            amount: Number(e.target.value)
                                        })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Frequência de Aportes</Label>
                                    <Select
                                        value={String(contributionConfig.frequencyMonths)}
                                        onValueChange={(v) => setContributionConfig({
                                            ...contributionConfig,
                                            frequencyMonths: Number(v)
                                        })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Mensal</SelectItem>
                                            <SelectItem value="3">Trimestral</SelectItem>
                                            <SelectItem value="6">Semestral</SelectItem>
                                            <SelectItem value="12">Anual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Collapsible Advanced Settings */}
                                <div className="pt-4 border-t border-white/10">
                                    <button
                                        onClick={() => setAdvancedOpen(!advancedOpen)}
                                        className="flex items-center justify-between w-full text-sm font-medium hover:text-primary transition-colors"
                                    >
                                        <span>Configurações Avançadas</span>
                                        <ChevronDown
                                            className={`h-4 w-4 transition-transform ${advancedOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    {advancedOpen && (
                                        <div className="mt-4 space-y-4 pl-4 border-l-2 border-primary/20">
                                            <div className="space-y-2">
                                                <Label>Aumentar Aportes</Label>
                                                <Select
                                                    value={contributionConfig.increaseType}
                                                    onValueChange={(v: string) => setContributionConfig({
                                                        ...contributionConfig,
                                                        increaseType: v as 'none' | 'percentage' | 'fixed'
                                                    })}
                                                >
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">Não aumentar</SelectItem>
                                                        <SelectItem value="percentage">Por percentual (%)</SelectItem>
                                                        <SelectItem value="fixed">Valor fixo (R$)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {contributionConfig.increaseType === 'percentage' && (
                                                <div className="space-y-2">
                                                    <Label>Aumento de Aportes</Label>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            value={contributionConfig.increaseAmount}
                                                            onChange={(e) => setContributionConfig({
                                                                ...contributionConfig,
                                                                increaseAmount: Number(e.target.value)
                                                            })}
                                                            className="pr-12"
                                                        />
                                                        <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">%</span>
                                                    </div>
                                                </div>
                                            )}

                                            {contributionConfig.increaseType === 'fixed' && (
                                                <div className="space-y-2">
                                                    <Label>Aumento de Aportes</Label>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            value={contributionConfig.increaseAmount}
                                                            onChange={(e) => setContributionConfig({
                                                                ...contributionConfig,
                                                                increaseAmount: Number(e.target.value)
                                                            })}
                                                            className="pl-6"
                                                        />
                                                        <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">R$</span>
                                                    </div>
                                                </div>
                                            )}

                                            {contributionConfig.increaseType !== 'none' && (
                                                <div className="space-y-2">
                                                    <Label>Frequência de Aumento</Label>
                                                    <Select
                                                        value={String(contributionConfig.increaseFrequencyMonths)}
                                                        onValueChange={(v) => setContributionConfig({
                                                            ...contributionConfig,
                                                            increaseFrequencyMonths: Number(v)
                                                        })}
                                                    >
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="3">A cada 3 meses</SelectItem>
                                                            <SelectItem value="6">A cada 6 meses</SelectItem>
                                                            <SelectItem value="12">Anualmente</SelectItem>
                                                            <SelectItem value="24">A cada 2 anos</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <div className="flex-1 space-y-2">
                                <Label>Prazo</Label>
                                <Input
                                    type="number"
                                    value={period}
                                    onChange={(e) => setPeriod(Number(e.target.value))}
                                />
                            </div>
                            <div className="w-[120px] space-y-2">
                                <Label>Unidade</Label>
                                <Select value={periodUnit} onValueChange={(v: 'months' | 'years' | 'days') => setPeriodUnit(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="days">Dias</SelectItem>
                                        <SelectItem value="months">Meses</SelectItem>
                                        <SelectItem value="years">Anos</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10 space-y-4">
                            <Label className="flex items-center gap-2">
                                Ativo A (Referência)
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger><Info className="h-3 w-3 text-muted-foreground" /></TooltipTrigger>
                                        <TooltipContent>Geralmente um ativo tributável como CDB.</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Select value={assetA.type} onValueChange={(v: AssetType) => setAssetA({ ...assetA, type: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CDB">CDB</SelectItem>
                                        <SelectItem value="TESOURO">Tesouro</SelectItem>
                                        <SelectItem value="LC">LC</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="relative">
                                    <Input
                                        type="number" value={assetA.rate}
                                        onChange={e => setAssetA({ ...assetA, rate: Number(e.target.value) })}
                                        className="pr-12"
                                    />
                                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">% CDI</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10 space-y-4">
                            <Label className="flex items-center gap-2">
                                Ativo B (Comparação)
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger><Info className="h-3 w-3 text-muted-foreground" /></TooltipTrigger>
                                        <TooltipContent>Geralmente um ativo isento como LCI/LCA.</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Select value={assetB.type} onValueChange={(v: AssetType) => setAssetB({ ...assetB, type: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LCI">LCI</SelectItem>
                                        <SelectItem value="LCA">LCA</SelectItem>
                                        <SelectItem value="CRI">CRI</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="relative">
                                    <Input
                                        type="number" value={assetB.rate}
                                        onChange={e => setAssetB({ ...assetB, rate: Number(e.target.value) })}
                                        className="pr-12"
                                    />
                                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">% CDI</span>
                                </div>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>

            {/* Results */}
            <div className="lg:col-span-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    {renderResultCard("Ativo A", resultA, assetA)}
                    {renderResultCard("Ativo B", resultB, assetB)}
                </div>

                {/* Vencedor */}
                {resultA && resultB && (
                    <Card className={`border-l-4 ${resultB.netTotal > resultA.netTotal ? 'border-l-green-500 bg-green-500/5' : 'border-l-blue-500 bg-blue-500/5'}`}>
                        <CardContent className="pt-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold">
                                    O {resultB.netTotal > resultA.netTotal ? 'Ativo B' : 'Ativo A'} rende mais!
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    Diferença de <span className="font-bold text-foreground">{formatCurrency(Math.abs(resultA.netTotal - resultB.netTotal))}</span> no período.
                                </p>
                            </div>
                            <Button variant="outline" className="gap-2">
                                Ver Detalhes <ArrowRightLeft className="w-4 h-4" />
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Info */}
                <Card>
                    <CardContent className="pt-6 text-sm text-muted-foreground space-y-2">
                        <p>Considerando: CDI {cdi}% a.a., IPCA {ipca}% a.a.</p>
                        <p>IR Regressivo aplicado automaticamente para ativos tributáveis.</p>
                        <p>IOF aplicado para prazos inferiores a 30 dias.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

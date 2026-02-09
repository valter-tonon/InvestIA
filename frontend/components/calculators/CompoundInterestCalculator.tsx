'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { CalculatorIcon, Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { calculateCompoundInterest, CalculatorResult } from '@/lib/calculators/compound-interest';
import { indicatorsApi } from '@/lib/api/indicators';
import { formatCurrency } from '@/lib/utils';
import ResultsChart from './ResultsChart';

export default function CompoundInterestCalculator() {
    const [loading, setLoading] = useState(true);
    const [initial, setInitial] = useState(5000);
    const [monthly, setMonthly] = useState(500);
    const [years, setYears] = useState(10);
    const [rate, setRate] = useState(10.0); // Default placeholder
    const [inflation, setInflation] = useState(0);
    const [useInflation, setUseInflation] = useState(false);

    const [results, setResults] = useState<CalculatorResult[]>([]);

    // Fetch initial indicators
    useEffect(() => {
        const fetchIndicators = async () => {
            try {
                const data = await indicatorsApi.getIndicators();
                // Set default rate to CDI (or Selic) if available
                if (data.CDI) setRate(data.CDI);
                else if (data.SELIC) setRate(data.SELIC);

                if (data.IPCA) setInflation(data.IPCA);
            } catch (error) {
                console.error("Failed to fetch indicators", error);
                toast.error("Não foi possível carregar taxas atualizadas. Usando valores padrão.");
            } finally {
                setLoading(false);
            }
        };
        fetchIndicators();
    }, []);

    // Recalculate on any change
    useEffect(() => {
        const res = calculateCompoundInterest(
            initial,
            monthly,
            rate,
            years,
            useInflation ? inflation : 0
        );
        setResults(res);
    }, [initial, monthly, years, rate, inflation, useInflation]);

    // Prepare data for display (handle inflation toggle)
    const displayData = results.map(r => ({
        ...r,
        total: useInflation ? (r.realTotal || r.total) : r.total,
        interest: useInflation ? ((r.realTotal || r.total) - r.invested) : r.interest,
    }));

    const finalResult = displayData[displayData.length - 1] || { total: 0, invested: 0, interest: 0 };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="grid lg:grid-cols-12 gap-8">
            {/* Input Section */}
            <Card className="lg:col-span-4 h-fit">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalculatorIcon className="w-5 h-5 text-primary" />
                        Parâmetros
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Valor Inicial</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                            <Input
                                type="number"
                                value={initial}
                                onChange={(e) => setInitial(Number(e.target.value))}
                                className="pl-9"
                            />
                        </div>
                        <Slider
                            value={[initial]}
                            max={100000}
                            step={100}
                            onValueChange={(v) => setInitial(v[0])}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Aporte Mensal</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                            <Input
                                type="number"
                                value={monthly}
                                onChange={(e) => setMonthly(Number(e.target.value))}
                                className="pl-9"
                            />
                        </div>
                        <Slider
                            value={[monthly]}
                            max={5000}
                            step={50}
                            onValueChange={(v) => setMonthly(v[0])}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex justify-between">
                            Taxa de Juros (Anual)
                            <span className="text-muted-foreground font-normal text-xs mt-1">CDI Hoje: {rate}%</span>
                        </Label>
                        <div className="relative">
                            <Input
                                type="number"
                                value={rate}
                                onChange={(e) => setRate(Number(e.target.value))}
                                className="pr-8"
                            />
                            <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Período (Anos)</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                value={years}
                                onChange={(e) => setYears(Number(e.target.value))}
                                className="pl-3"
                            />
                        </div>
                        <Slider
                            value={[years]}
                            min={1}
                            max={50}
                            step={1}
                            onValueChange={(v) => setYears(v[0])}
                        />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                        <Label className="cursor-pointer" htmlFor="inflation-switch">
                            Descontar Inflação (IPCA: {inflation}%)
                        </Label>
                        <Switch
                            id="inflation-switch"
                            checked={useInflation}
                            onCheckedChange={setUseInflation}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Results Section */}
            <div className="lg:col-span-8 space-y-6">
                {/* Cards Summary */}
                <div className="grid sm:grid-cols-3 gap-4">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-sm text-muted-foreground">
                                    Valor Final {useInflation ? '(Real)' : '(Bruto)'}
                                </span>
                                <span className="text-2xl font-bold text-primary">{formatCurrency(finalResult.total)}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-sm text-muted-foreground">Total Investido</span>
                                <span className="text-2xl font-bold">{formatCurrency(finalResult.invested)}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-sm text-muted-foreground">
                                    Total em Juros {useInflation ? '(Real)' : ''}
                                </span>
                                <span className="text-2xl font-bold text-green-500 flex items-center gap-1">
                                    <TrendingUp className="w-4 h-4" />
                                    {formatCurrency(finalResult.interest)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Chart */}
                <Card className="flex-1 min-h-[450px]">
                    <CardHeader>
                        <CardTitle>Evolução Patrimonial {useInflation && '(Descontada a Inflação)'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResultsChart data={displayData} />
                    </CardContent>
                </Card>

                {/* Call to Action */}
                <div className="bg-gradient-to-r from-primary/20 to-transparent p-6 rounded-lg border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold">Gostou da simulação?</h3>
                        <p className="text-muted-foreground text-sm">
                            Crie sua carteira real no InvestCopilot e acompanhe sua evolução com dados de mercado.
                        </p>
                    </div>
                    <Button size="lg" className="w-full md:w-auto">
                        Começar Agora
                    </Button>
                </div>
            </div>
        </div>
    );
}

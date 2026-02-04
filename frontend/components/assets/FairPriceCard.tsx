'use client';

import { FairPriceResponse } from '@/lib/api/fairPriceApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import YoCBadge from './YoCBadge';

interface FairPriceCardProps {
    fairPrice: FairPriceResponse;
}

export default function FairPriceCard({ fairPrice }: FairPriceCardProps) {
    const { calculations, currentPrice, recommendation, lowestPrice, highestPrice } = fairPrice;

    const getRecommendationColor = (rec: string) => {
        switch (rec) {
            case 'COMPRA':
                return 'bg-green-500/20 text-green-500 border-green-500/50';
            case 'VENDA':
                return 'bg-red-500/20 text-red-500 border-red-500/50';
            default:
                return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
        }
    };

    const getRecommendationIcon = (rec: string) => {
        switch (rec) {
            case 'COMPRA':
                return <TrendingUp className="h-6 w-6" />;
            case 'VENDA':
                return <TrendingDown className="h-6 w-6" />;
            default:
                return <Minus className="h-6 w-6" />;
        }
    };

    const getRecommendationText = () => {
        if (!currentPrice) return 'Preço atual não disponível';

        if (recommendation === 'COMPRA') {
            return `Preço atual (R$ ${currentPrice.toFixed(2)}) abaixo de todos os métodos`;
        } else if (recommendation === 'VENDA') {
            return `Preço atual (R$ ${currentPrice.toFixed(2)}) acima de todos os métodos`;
        } else {
            return `Preço atual (R$ ${currentPrice.toFixed(2)}) dentro da faixa`;
        }
    };

    return (
        <Card className="border-gray-700">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Preço Justo / Teto
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Métodos de Cálculo */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Bazin */}
                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/20 transition-all">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <p className="text-sm text-gray-400">Bazin</p>
                            <div className="group relative">
                                <Info className="h-3 w-3 text-gray-500 cursor-help" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-xs text-gray-300 rounded shadow-lg border border-gray-700 z-10">
                                    Conservador - DY 6% sobre último ano
                                </div>
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-blue-400">
                            {calculations.bazin.price > 0 ? `R$ ${calculations.bazin.price.toFixed(2)}` : 'N/A'}
                        </p>
                        <Badge variant="outline" className="mt-2 text-xs border-blue-500/30">
                            Conservador
                        </Badge>
                    </div>

                    {/* Barsi */}
                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 hover:shadow-lg hover:shadow-green-500/20 transition-all">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <p className="text-sm text-gray-400">Barsi</p>
                            <div className="group relative">
                                <Info className="h-3 w-3 text-gray-500 cursor-help" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-xs text-gray-300 rounded shadow-lg border border-gray-700 z-10">
                                    Moderado - DY 6% sobre média 5 anos
                                </div>
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-green-400">
                            {calculations.barsi.price > 0 ? `R$ ${calculations.barsi.price.toFixed(2)}` : 'N/A'}
                        </p>
                        <Badge variant="outline" className="mt-2 text-xs border-green-500/30">
                            Moderado
                        </Badge>
                    </div>

                    {/* Graham */}
                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 hover:shadow-lg hover:shadow-purple-500/20 transition-all">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <p className="text-sm text-gray-400">Graham</p>
                            <div className="group relative">
                                <Info className="h-3 w-3 text-gray-500 cursor-help" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-xs text-gray-300 rounded shadow-lg border border-gray-700 z-10">
                                    Value - Fórmula de Benjamin Graham
                                </div>
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-purple-400">
                            {calculations.graham.price > 0 ? `R$ ${calculations.graham.price.toFixed(2)}` : 'N/A'}
                        </p>
                        <Badge variant="outline" className="mt-2 text-xs border-purple-500/30">
                            Value
                        </Badge>
                    </div>
                </div>

                {/* Recomendação */}
                <div className={`p-4 rounded-lg border ${getRecommendationColor(recommendation)}`}>
                    <div className="flex items-center justify-center gap-3">
                        {getRecommendationIcon(recommendation)}
                        <div className="text-center">
                            <p className="text-2xl font-bold">{recommendation}</p>
                            <p className="text-sm mt-1 opacity-80">{getRecommendationText()}</p>
                        </div>
                    </div>
                </div>

                {/* Yield on Cost */}
                <div className="flex justify-center">
                    <YoCBadge
                        yieldOnCost={fairPrice.yieldOnCost}
                        averagePurchasePrice={fairPrice.averagePurchasePrice}
                    />
                </div>

                {/* Faixa de Preço */}
                {lowestPrice > 0 && highestPrice > 0 && (
                    <div className="text-center text-sm text-gray-400">
                        <p>
                            Faixa: <span className="font-semibold text-gray-300">R$ {lowestPrice.toFixed(2)}</span> a{' '}
                            <span className="font-semibold text-gray-300">R$ {highestPrice.toFixed(2)}</span>
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

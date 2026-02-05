'use client';

import { Info } from 'lucide-react';

interface YoCBadgeProps {
    yieldOnCost: number | null;
    averagePurchasePrice?: number | null;
}

export default function YoCBadge({ yieldOnCost, averagePurchasePrice }: YoCBadgeProps) {
    if (!yieldOnCost || !averagePurchasePrice) {
        return (
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>YoC: N/A</span>
                <div className="group relative">
                    <Info className="h-4 w-4 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-xs text-gray-300 rounded shadow-lg border border-gray-700 z-10">
                        <p className="font-semibold mb-1">Yield on Cost (YoC)</p>
                        <p>Retorno dos dividendos sobre o preço médio de compra.</p>
                        <p className="mt-2 text-yellow-400">Configure o preço médio de compra para calcular o YoC.</p>
                    </div>
                </div>
            </div>
        );
    }

    const getYoCColor = (yoc: number) => {
        if (yoc >= 10) return 'text-green-500';
        if (yoc >= 6) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getYoCBgColor = (yoc: number) => {
        if (yoc >= 10) return 'bg-green-500/10 border-green-500/30';
        if (yoc >= 6) return 'bg-yellow-500/10 border-yellow-500/30';
        return 'bg-red-500/10 border-red-500/30';
    };

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getYoCBgColor(yieldOnCost)}`}>
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">YoC:</span>
                <span className={`text-lg font-bold ${getYoCColor(yieldOnCost)}`}>
                    {yieldOnCost.toFixed(2)}%
                </span>
            </div>
            <div className="group relative">
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-xs text-gray-300 rounded shadow-lg border border-gray-700 z-10">
                    <p className="font-semibold mb-1">Yield on Cost (YoC)</p>
                    <p>Retorno dos dividendos sobre seu preço de compra.</p>
                    <p className="mt-2">
                        Preço médio: <span className="font-semibold text-white">R$ {averagePurchasePrice.toFixed(2)}</span>
                    </p>
                    <div className="mt-2 pt-2 border-t border-gray-700">
                        <p className="text-green-400">≥ 10%: Excelente</p>
                        <p className="text-yellow-400">6-10%: Bom</p>
                        <p className="text-red-400">&lt; 6%: Abaixo do esperado</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

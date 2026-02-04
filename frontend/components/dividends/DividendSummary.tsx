'use client';

import { Dividend } from '@/types/dividend';
import { useMemo } from 'react';
import { Info } from 'lucide-react';

interface DividendSummaryProps {
    dividends: Dividend[];
}

export default function DividendSummary({ dividends }: DividendSummaryProps) {
    const summary = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const twelveMonthsAgo = new Date(now.setFullYear(now.getFullYear() - 1));

        const totalCurrentYear = dividends
            .filter((d) => new Date(d.paymentDate).getFullYear() === currentYear)
            .reduce((sum, d) => sum + d.value, 0);

        const totalLast12Months = dividends
            .filter((d) => new Date(d.paymentDate) >= twelveMonthsAgo)
            .reduce((sum, d) => sum + d.value, 0);

        const yearlyTotals = dividends.reduce((acc, d) => {
            const year = new Date(d.paymentDate).getFullYear();
            acc[year] = (acc[year] || 0) + d.value;
            return acc;
        }, {} as Record<number, number>);

        const years = Object.keys(yearlyTotals).length;
        const averageYield = years > 0 ? Object.values(yearlyTotals).reduce((a, b) => a + b, 0) / years : 0;

        // Calcular frequência de pagamento
        const paymentsPerYear = dividends.length / Math.max(years, 1);
        let frequency = 'Irregular';
        if (paymentsPerYear >= 11) frequency = 'Mensal';
        else if (paymentsPerYear >= 3) frequency = 'Trimestral';
        else if (paymentsPerYear >= 1.5) frequency = 'Semestral';
        else if (paymentsPerYear >= 0.8) frequency = 'Anual';

        return {
            totalCurrentYear,
            totalLast12Months,
            averageYield,
            frequency,
        };
    }, [dividends]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Ano Atual */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-md border border-blue-200 hover:shadow-lg transition-shadow relative overflow-visible">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-blue-700">Total {new Date().getFullYear()}</h3>
                    <div className="group relative">
                        <Info className="h-4 w-4 text-blue-500 cursor-help" />
                        <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50 pointer-events-none">
                            <p className="font-semibold mb-1">Dividendos do Ano Atual</p>
                            <p>Soma de todos os dividendos e JCP pagos por ação no ano de {new Date().getFullYear()}.</p>
                        </div>
                    </div>
                </div>
                <p className="text-3xl font-bold text-blue-900">
                    R$ {summary.totalCurrentYear.toFixed(4)}
                </p>
                <p className="text-xs text-blue-600 mt-1">por ação</p>
            </div>

            {/* Últimos 12 Meses */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-md border border-green-200 hover:shadow-lg transition-shadow relative overflow-visible">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-green-700">Últimos 12 Meses</h3>
                    <div className="group relative">
                        <Info className="h-4 w-4 text-green-500 cursor-help" />
                        <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50 pointer-events-none">
                            <p className="font-semibold mb-1">Dividendos dos Últimos 12 Meses</p>
                            <p>Total de dividendos e JCP pagos por ação nos últimos 12 meses. Útil para calcular o Dividend Yield atual.</p>
                        </div>
                    </div>
                </div>
                <p className="text-3xl font-bold text-green-900">
                    R$ {summary.totalLast12Months.toFixed(4)}
                </p>
                <p className="text-xs text-green-600 mt-1">por ação</p>
            </div>

            {/* Média Anual */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-md border border-purple-200 hover:shadow-lg transition-shadow relative overflow-visible">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-purple-700">Média Anual</h3>
                    <div className="group relative">
                        <Info className="h-4 w-4 text-purple-500 cursor-help" />
                        <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50 pointer-events-none">
                            <p className="font-semibold mb-1">Média Anual de Dividendos</p>
                            <p>Média dos dividendos pagos por ação ao longo dos anos disponíveis no histórico.</p>
                        </div>
                    </div>
                </div>
                <p className="text-3xl font-bold text-purple-900">
                    R$ {summary.averageYield.toFixed(4)}
                </p>
                <p className="text-xs text-purple-600 mt-1">por ação/ano</p>
            </div>

            {/* Frequência */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-md border border-orange-200 hover:shadow-lg transition-shadow relative overflow-visible">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-orange-700">Frequência</h3>
                    <div className="group relative">
                        <Info className="h-4 w-4 text-orange-500 cursor-help" />
                        <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50 pointer-events-none">
                            <p className="font-semibold mb-1">Frequência de Pagamento</p>
                            <p>Com que frequência a empresa paga dividendos: Mensal, Trimestral, Semestral, Anual ou Irregular.</p>
                        </div>
                    </div>
                </div>
                <p className="text-3xl font-bold text-orange-900">{summary.frequency}</p>
                <p className="text-xs text-orange-600 mt-1">pagamentos</p>
            </div>
        </div>
    );
}

'use client';

import { Dividend } from '@/types/dividend';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DividendChartProps {
    dividends: Dividend[];
}

export default function DividendChart({ dividends }: DividendChartProps) {
    const chartData = useMemo(() => {
        // Agrupar dividendos por ano
        const yearlyData = dividends.reduce((acc, dividend) => {
            const year = new Date(dividend.paymentDate).getFullYear();

            if (!acc[year]) {
                acc[year] = { year, dividends: 0, jcp: 0, total: 0 };
            }

            if (dividend.type === 'DIVIDEND') {
                acc[year].dividends += dividend.value;
            } else {
                acc[year].jcp += dividend.value;
            }
            acc[year].total += dividend.value;

            return acc;
        }, {} as Record<number, { year: number; dividends: number; jcp: number; total: number }>);

        // Converter para array e ordenar por ano
        return Object.values(yearlyData).sort((a, b) => a.year - b.year);
    }, [dividends]);

    if (chartData.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                Nenhum dado disponível para o gráfico
            </div>
        );
    }

    return (
        <div className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip
                        formatter={(value) => `R$ ${typeof value === 'number' ? value.toFixed(2) : '0.00'}`}
                        labelFormatter={(label) => `Ano: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="dividends" name="Dividendos" fill="#10b981" stackId="a" />
                    <Bar dataKey="jcp" name="JCP" fill="#3b82f6" stackId="a" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { CalculatorResult } from '@/lib/calculators/compound-interest';

interface ResultsChartProps {
    data: CalculatorResult[];
}

export default function ResultsChart({ data }: ResultsChartProps) {
    if (!data || data.length === 0) return null;

    return (
        <div className="h-[400px] w-full mt-8">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                    <XAxis
                        dataKey="year"
                        stroke="#888"
                        label={{ value: 'Anos', position: 'insideBottomRight', offset: -10 }}
                    />
                    <YAxis
                        tickFormatter={(value) =>
                            new Intl.NumberFormat('pt-BR', { notation: "compact", maximumFractionDigits: 1 }).format(value)
                        }
                        stroke="#888"
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => `Ano ${label}`}
                    />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="total"
                        name="Patrimônio Total"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                        strokeWidth={2}
                    />
                    <Area
                        type="monotone"
                        dataKey="invested"
                        name="Total Investido"
                        stroke="#6366f1"
                        fillOpacity={1}
                        fill="url(#colorInvested)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

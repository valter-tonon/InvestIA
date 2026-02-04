import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { PerformanceDataPoint } from '@/lib/types/dashboard';

interface PortfolioPerformanceChartProps {
    data: PerformanceDataPoint[];
}

export const PortfolioPerformanceChart: React.FC<PortfolioPerformanceChartProps> = ({ data }) => {
    const hasData = data && data.length > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Performance da Carteira</CardTitle>
                <CardDescription>Evolução do valor ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
                {hasData ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => {
                                    const date = new Date(value);
                                    return `${date.getDate()}/${date.getMonth() + 1}`;
                                }}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                formatter={(value: number | undefined) => [
                                    `R$ ${value?.toFixed(2) ?? '0.00'}`,
                                    'Valor',
                                ]}
                                labelFormatter={(label) => {
                                    const date = new Date(label);
                                    return date.toLocaleDateString('pt-BR');
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#8884d8"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        <p>Sem dados de performance disponíveis</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

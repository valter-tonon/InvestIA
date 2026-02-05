import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { TopAsset } from '@/lib/types/dashboard';

interface TopAssetsChartProps {
    data: TopAsset[];
}

export const TopAssetsChart: React.FC<TopAssetsChartProps> = ({ data }) => {
    const hasData = data && data.length > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Top 5 Ativos</CardTitle>
                <CardDescription>Ativos com maior valor</CardDescription>
            </CardHeader>
            <CardContent>
                {hasData ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" tick={{ fontSize: 12 }} />
                            <YAxis
                                dataKey="ticker"
                                type="category"
                                tick={{ fontSize: 12 }}
                                width={80}
                            />
                            <Tooltip
                                formatter={(value) => [
                                    `R$ ${typeof value === 'number' ? value.toFixed(2) : '0.00'}`,
                                    'Valor',
                                ]}
                            />
                            <Bar dataKey="value" fill="#8884d8">
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.change >= 0 ? '#22c55e' : '#ef4444'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        <p>Nenhum ativo disponível</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

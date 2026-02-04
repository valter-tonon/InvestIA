import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { SectorDistribution } from '@/lib/types/dashboard';

interface SectorDistributionChartProps {
    data: SectorDistribution[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const SectorDistributionChart: React.FC<SectorDistributionChartProps> = ({ data }) => {
    const hasData = data && data.length > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Distribuição por Setor</CardTitle>
                <CardDescription>Alocação de ativos por setor</CardDescription>
            </CardHeader>
            <CardContent>
                {hasData ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry: any) => `${entry.sector}: ${entry.percentage}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        <p>Nenhum ativo com setor definido</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

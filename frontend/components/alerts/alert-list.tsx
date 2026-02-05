import React from 'react';
import { PriceAlert, AlertCondition } from '@/lib/types/alerts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Bell, BellOff, ArrowUp, ArrowDown, Equal } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AlertListProps {
    alerts: PriceAlert[];
    onDelete: (id: string) => void;
    onToggle: (id: string) => void;
}

export function AlertList({ alerts, onDelete, onToggle }: AlertListProps) {
    if (alerts.length === 0) {
        return (
            <div className="text-center py-10 border rounded-lg bg-card text-muted-foreground">
                <BellOff className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>Nenhum alerta configurado.</p>
            </div>
        );
    }

    const getConditionIcon = (condition: AlertCondition) => {
        switch (condition) {
            case AlertCondition.ABOVE: return <ArrowUp className="w-4 h-4 text-green-500 inline mr-1" />;
            case AlertCondition.BELOW: return <ArrowDown className="w-4 h-4 text-red-500 inline mr-1" />;
            case AlertCondition.EQUAL: return <Equal className="w-4 h-4 text-blue-500 inline mr-1" />;
            default: return null;
        }
    };

    const getConditionText = (condition: AlertCondition) => {
        switch (condition) {
            case AlertCondition.ABOVE: return 'Acima de';
            case AlertCondition.BELOW: return 'Abaixo de';
            case AlertCondition.EQUAL: return 'Igual a';
            default: return condition;
        }
    };

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Ativo</TableHead>
                        <TableHead>Condição</TableHead>
                        <TableHead>Alvo</TableHead>
                        <TableHead>Preço Atual</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Criado em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {alerts.map((alert) => (
                        <TableRow key={alert.id}>
                            <TableCell className="font-medium">
                                <span className="font-bold">{alert.asset?.ticker}</span>
                                <span className="text-xs text-muted-foreground block">{alert.asset?.name}</span>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center">
                                    {getConditionIcon(alert.condition)}
                                    {getConditionText(alert.condition)}
                                </div>
                            </TableCell>
                            <TableCell className="font-mono">R$ {alert.targetPrice.toFixed(2)}</TableCell>
                            <TableCell className="font-mono text-muted-foreground">
                                {alert.asset?.currentPrice != null
                                    ? `R$ ${Number(alert.asset.currentPrice).toFixed(2)}`
                                    : 'N/A'}
                            </TableCell>
                            <TableCell>
                                {alert.isActive ? (
                                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">Ativo</Badge>
                                ) : alert.triggeredAt ? (
                                    <Badge variant="secondary">Disparado</Badge>
                                ) : (
                                    <Badge variant="outline">Inativo</Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                                {format(new Date(alert.createdAt), "d MMM yyyy", { locale: ptBR })}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onToggle(alert.id)}
                                    title={alert.isActive ? "Desativar" : "Ativar"}
                                >
                                    {alert.isActive ? <Bell className="h-4 w-4 text-green-600" /> : <BellOff className="h-4 w-4" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive/90"
                                    onClick={() => onDelete(alert.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

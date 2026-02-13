'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/types/payments";
import { formatCurrency } from "@/lib/stripe/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TransactionHistoryProps {
    transactions: Transaction[];
    isLoading?: boolean;
}

export function TransactionHistory({ transactions, isLoading }: TransactionHistoryProps) {
    if (isLoading) {
        return <div className="p-4 text-center text-muted-foreground">Carregando histórico...</div>;
    }

    if (transactions.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">Nenhuma transação encontrada.</div>;
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SUCCEEDED': return <Badge className="bg-green-500 hover:bg-green-600">Sucesso</Badge>;
            case 'PENDING': return <Badge variant="secondary">Pendente</Badge>;
            case 'FAILED': return <Badge variant="destructive">Falha</Badge>;
            case 'PROCESSING': return <Badge variant="outline">Processando</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getTypeName = (type: string) => {
        switch (type) {
            case 'SUBSCRIPTION_CREATE': return 'Nova Assinatura';
            case 'SUBSCRIPTION_RENEW': return 'Renovação';
            case 'SUBSCRIPTION_CANCEL': return 'Cancelamento';
            default: return type.replace(/_/g, ' ');
        }
    };

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                            <TableCell>
                                {format(new Date(tx.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                            </TableCell>
                            <TableCell>{getTypeName(tx.type)}</TableCell>
                            <TableCell>{formatCurrency(tx.amount)}</TableCell>
                            <TableCell>{getStatusBadge(tx.status)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

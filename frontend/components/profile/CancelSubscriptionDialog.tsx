'use client';

import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface CancelSubscriptionDialogProps {
    onConfirm: (reason: string) => Promise<void>;
    isLoading?: boolean;
}

export function CancelSubscriptionDialog({ onConfirm, isLoading }: CancelSubscriptionDialogProps) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState('');

    const handleConfirm = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            await onConfirm(reason);
            setOpen(false);
            setReason('');
        } catch (error) {
            // Erro já tratado pelo componente pai
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto">
                    Cancelar Assinatura
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Cancelar Assinatura Premium
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                        <p>
                            Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos recursos premium ao final do período atual.
                        </p>
                        <p className="font-medium text-foreground">
                            Esta ação não pode ser desfeita.
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-2 space-y-2">
                    <Label htmlFor="reason">Motivo do cancelamento (opcional)</Label>
                    <Input
                        id="reason"
                        placeholder="Ex: Valor muito alto, não estou usando..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Manter Assinatura</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Cancelando...
                            </>
                        ) : (
                            'Confirmar Cancelamento'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

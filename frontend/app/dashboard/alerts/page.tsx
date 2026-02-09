'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { PriceAlert, CreateAlertDto } from '@/lib/types/alerts';
import { alertsApi } from '@/lib/api/alerts';
import { AlertList } from '@/components/alerts/alert-list';
import { AlertForm } from '@/components/alerts/alert-form';
import { Bell, Plus, AlertCircle } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AlertsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [alerts, setAlerts] = useState<PriceAlert[]>([]);
    const [loadingAlerts, setLoadingAlerts] = useState(true);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [alertToDelete, setAlertToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            loadAlerts();
        }
    }, [user]);

    const loadAlerts = async () => {
        setLoadingAlerts(true);
        try {
            const data = await alertsApi.findAll();
            setAlerts(data);
        } catch (error) {
            console.error('Failed to load alerts', error);
            toast.error('Erro ao carregar alertas');
        } finally {
            setLoadingAlerts(false);
        }
    };

    const handleCreateAlert = async (data: CreateAlertDto) => {
        try {
            await alertsApi.create(data);
            toast.success('Alerta criado com sucesso');
            loadAlerts(); // Refresh list
        } catch (error) {
            console.error('Failed to create alert', error);
            toast.error('Erro ao criar alerta');
            throw error;
        }
    };

    const handleDeleteClick = (id: string) => {
        setAlertToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!alertToDelete) return;

        try {
            await alertsApi.delete(alertToDelete);
            toast.success('Alerta removido com sucesso');
            setAlerts(alerts.filter(a => a.id !== alertToDelete));
        } catch (error) {
            console.error('Failed to delete alert', error);
            toast.error('Erro ao remover alerta');
        } finally {
            setDeleteConfirmOpen(false);
            setAlertToDelete(null);
        }
    };

    const handleToggleAlert = async (id: string) => {
        try {
            const updated = await alertsApi.toggle(id);
            setAlerts(alerts.map(a => a.id === id ? updated : a));
            toast.success(updated.isActive ? 'Alerta ativado' : 'Alerta desativado');
        } catch (error) {
            console.error('Failed to toggle alert', error);
            toast.error('Erro ao atualizar alerta');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Carregando...</p>
            </div>
        );
    }

    if (!user) return null;

    return (


        <>
            <main className="container mx-auto p-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Bell className="h-8 w-8 text-primary" />
                            Alertas de Preço
                        </h2>
                        <p className="text-muted-foreground">Gerencie seus monitores de preço para oportunidades.</p>
                    </div>
                    <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Alerta
                    </Button>
                </div>

                {loadingAlerts ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="border rounded-lg p-6 animate-pulse">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                                        <div className="h-3 bg-gray-800 rounded w-1/3"></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="h-8 w-8 bg-gray-700 rounded"></div>
                                        <div className="h-8 w-8 bg-gray-700 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="text-center py-16 border rounded-lg bg-gradient-to-br from-gray-900 to-gray-800">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                            <Bell className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Nenhum alerta configurado</h3>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">
                            Crie alertas de preço para ser notificado quando seus ativos atingirem valores específicos.
                        </p>
                        <Button onClick={() => setShowCreateDialog(true)} size="lg">
                            <Plus className="mr-2 h-5 w-5" />
                            Criar Primeiro Alerta
                        </Button>
                    </div>
                ) : (
                    <AlertList
                        alerts={alerts}
                        onDelete={handleDeleteClick}
                        onToggle={handleToggleAlert}
                    />
                )}
            </main>

            <AlertForm
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onSubmit={handleCreateAlert}
            />

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            Confirmar Exclusão
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir este alerta? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Toaster />
        </>
    );
}

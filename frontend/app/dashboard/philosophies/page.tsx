'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { philosophiesApi } from '@/lib/api/philosophies';
import type { Philosophy } from '@/lib/types/philosophy';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PhilosophyCard } from '@/components/philosophies/PhilosophyCard';
import { toast } from 'sonner';
import { Plus, FileText } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function PhilosophiesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [philosophies, setPhilosophies] = useState<Philosophy[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPhilosophy, setSelectedPhilosophy] = useState<Philosophy | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            loadPhilosophies();
        }
    }, [user]);

    const loadPhilosophies = async () => {
        try {
            setLoading(true);
            const data = await philosophiesApi.list();
            setPhilosophies(data);
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao carregar filosofias';
            toast.error(message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover esta filosofia?')) return;

        try {
            await philosophiesApi.delete(id);
            toast.success('Filosofia removida com sucesso!');
            loadPhilosophies();
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao remover filosofia';
            toast.error(message);
        }
    };

    const handleViewRules = (philosophy: Philosophy) => {
        setSelectedPhilosophy(philosophy);
    };

    if (authLoading) {
        return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
    }

    if (!user) return null;

    return (


        <>
            <main className="container mx-auto p-6">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Filosofias de Investimento</h2>
                        <p className="text-muted-foreground">Gerencie suas filosofias e regras de investimento</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => router.push('/dashboard')} variant="outline">
                            Voltar ao Dashboard
                        </Button>
                        <Button onClick={() => router.push('/dashboard/philosophies/upload')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Filosofia
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Minhas Filosofias</CardTitle>
                        <CardDescription>
                            {philosophies.length} {philosophies.length === 1 ? 'filosofia cadastrada' : 'filosofias cadastradas'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">Carregando...</div>
                        ) : philosophies.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                                <p className="text-lg text-muted-foreground mb-4">
                                    Nenhuma filosofia cadastrada ainda.
                                </p>
                                <Button onClick={() => router.push('/dashboard/philosophies/upload')}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Adicionar primeira filosofia
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {philosophies.map((philosophy) => (
                                    <PhilosophyCard
                                        key={philosophy.id}
                                        philosophy={philosophy}
                                        onDelete={handleDelete}
                                        onViewRules={handleViewRules}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            <Dialog open={!!selectedPhilosophy} onOpenChange={() => setSelectedPhilosophy(null)}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedPhilosophy?.title}</DialogTitle>
                        <DialogDescription>
                            {selectedPhilosophy?.description || 'Regras extraídas pela IA'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">Regras Extraídas ({selectedPhilosophy?.rules.length})</h3>
                            <ul className="space-y-2">
                                {selectedPhilosophy?.rules.map((rule, index) => (
                                    <li key={index} className="flex gap-2">
                                        <span className="font-mono text-sm text-muted-foreground">{index + 1}.</span>
                                        <span className="text-sm">{rule}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

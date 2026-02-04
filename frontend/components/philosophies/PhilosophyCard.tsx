'use client';

import { Philosophy } from '@/lib/types/philosophy';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Trash2, Calendar, List } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PhilosophyCardProps {
    philosophy: Philosophy;
    onDelete: (id: string) => void;
    onViewRules: (philosophy: Philosophy) => void;
}

export function PhilosophyCard({ philosophy, onDelete, onViewRules }: PhilosophyCardProps) {
    const formatDate = (date: string) => {
        return formatDistanceToNow(new Date(date), {
            addSuffix: true,
            locale: ptBR,
        });
    };

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-lg">{philosophy.title}</CardTitle>
                            {philosophy.description && (
                                <CardDescription className="mt-1">
                                    {philosophy.description}
                                </CardDescription>
                            )}
                        </div>
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(philosophy.id)}
                        title="Remover filosofia"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Criado {formatDate(philosophy.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <List className="h-3 w-3" />
                            {philosophy.rules.length} {philosophy.rules.length === 1 ? 'regra' : 'regras'} extraídas
                        </Badge>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => onViewRules(philosophy)}
                    >
                        <List className="mr-2 h-4 w-4" />
                        Ver Regras Extraídas
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

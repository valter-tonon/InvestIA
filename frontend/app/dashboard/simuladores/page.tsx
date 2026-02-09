'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SimulatorsDashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Simuladores</h2>
                <p className="text-muted-foreground">
                    Ferramentas avançadas para projetar sua liberdade financeira.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Juros Compostos Card */}
                <Card className="flex flex-col h-full hover:border-primary/50 transition-colors group">
                    <CardHeader>
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                            <Calculator className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle>Juros Compostos</CardTitle>
                        <CardDescription>
                            Simule o crescimento do seu patrimônio com aportes mensais e o poder dos juros sobre juros.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto pt-0">
                        <Link href="/dashboard/simuladores/juros-compostos">
                            <Button className="w-full gap-2 group-hover:bg-primary/90">
                                Começar Simulação
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Renda Fixa Card */}
                <Card className="flex flex-col h-full hover:border-blue-500/50 transition-colors group">
                    <CardHeader>
                        <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                            <TrendingUp className="w-6 h-6 text-blue-500" />
                        </div>
                        <CardTitle>Comparador Renda Fixa</CardTitle>
                        <CardDescription>
                            Descubra qual ativo rende mais (CDB, LCI/LCA) considerando prazos e imposto de renda.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto pt-0">
                        <Link href="/dashboard/simuladores/renda-fixa">
                            <Button variant="outline" className="w-full gap-2 border-blue-500/20 hover:bg-blue-500/10 hover:text-blue-500">
                                Comparar Ativos
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

'use client';

import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#030712] p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] opacity-20 pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] opacity-20 pointer-events-none" />

            <Card className="w-full max-w-md border-white/10 bg-black/50 backdrop-blur-xl shadow-2xl relative z-10">
                <CardHeader className="space-y-2 text-center">
                    <div className="flex justify-center mb-2">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <BrainCircuit className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight font-display">Bem-vindo ao InvestCopilot</CardTitle>
                    <CardDescription>Comece sua jornada rumo à liberdade financeira</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center space-y-4 py-8">
                        <div className="p-3 bg-yellow-500/10 rounded-full w-fit mx-auto border border-yellow-500/20">
                            <BrainCircuit className="h-8 w-8 text-yellow-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-white">Cadastros Temporariamente Pausados</h3>
                            <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
                                Estamos atualizando nossa infraestrutura para melhor atendê-lo. Por favor, tente novamente mais tarde.
                            </p>
                        </div>
                        <Button asChild className="w-full mt-4" variant="outline">
                            <Link href="/login">Voltar para o Login</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

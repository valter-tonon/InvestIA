'use client';

import { Metadata } from 'next';
import CompoundInterestCalculator from '@/components/calculators/CompoundInterestCalculator';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CompoundInterestPage() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
            <div className="flex items-center gap-4">
                <Link href="/simuladores">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                        Calculadora de Juros Compostos
                    </h1>
                </div>
            </div>

            <div className="text-center mb-12 space-y-4">
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Simule o poder dos juros compostos ao longo do tempo. Descubra quanto seu dinheiro pode render com aportes mensais e taxas reais.
                </p>
            </div>

            <CompoundInterestCalculator />

            {/* SEO Content (Bottom) */}
            <div className="mt-24 grid md:grid-cols-2 gap-12 text-muted-foreground">
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground">Como funciona?</h2>
                    <p>
                        Juros compostos são juros sobre juros. Quando você investe, o rendimento gera novos rendimentos no período seguinte, criando um efeito "bola de neve" exponencial.
                    </p>
                    <p>
                        Nossa calculadora utiliza a taxa Selic e o IPCA atuais para entregar simulações realistas, permitindo que você projete sua liberdade financeira.
                    </p>
                </div>
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground">Por que investir mensalmente?</h2>
                    <p>
                        A constância é mais importante que a quantia. Pequenos aportes recorrentes, aliados ao tempo e a uma boa taxa de retorno, superam grandes aportes esporádicos.
                    </p>
                </div>
            </div>
        </div>
    );
}

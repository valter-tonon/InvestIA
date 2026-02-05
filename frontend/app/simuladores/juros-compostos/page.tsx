'use client';

import CompoundInterestCalculator from '@/components/calculators/CompoundInterestCalculator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CompoundInterestPage() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/simuladores">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Calculadora de Juros Compostos</h1>
                    <p className="text-muted-foreground">
                        Simule o poder dos juros sobre seus investimentos ao longo do tempo.
                    </p>
                </div>
            </div>

            <CompoundInterestCalculator />
        </div>
    );
}

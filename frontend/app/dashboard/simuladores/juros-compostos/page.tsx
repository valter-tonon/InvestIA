'use client';

import CompoundInterestCalculator from '@/components/calculators/CompoundInterestCalculator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CompoundInterestDashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/simuladores">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Calculadora de Juros Compostos</h2>
                    <p className="text-muted-foreground">
                        Projete seus ganhos futuros com base em aportes e rentabilidade.
                    </p>
                </div>
            </div>

            <CompoundInterestCalculator />
        </div>
    );
}

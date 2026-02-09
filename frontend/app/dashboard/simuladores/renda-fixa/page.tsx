'use client';

import FixedIncomeComparator from '@/components/calculators/FixedIncomeComparator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function FixedIncomeDashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/simuladores">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Comparador de Renda Fixa</h2>
                    <p className="text-muted-foreground">
                        Compare diferentes títulos de renda fixa e encontre a melhor rentabilidade líquida.
                    </p>
                </div>
            </div>

            <FixedIncomeComparator />
        </div>
    );
}

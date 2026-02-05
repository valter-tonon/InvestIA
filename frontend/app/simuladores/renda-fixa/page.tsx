'use client';

import FixedIncomeComparator from '@/components/calculators/FixedIncomeComparator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function FixedIncomePage() {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/simuladores">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Comparador de Renda Fixa</h1>
                    <p className="text-muted-foreground">
                        Compare CDBs, LCIs, LCAs e descubra qual rende mais no seu bolso (já descontando o IR).
                    </p>
                </div>
            </div>

            <FixedIncomeComparator />
        </div>
    );
}

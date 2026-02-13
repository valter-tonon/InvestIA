'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import confetti from 'canvas-confetti';

export default function CheckoutSuccessPage() {
    const router = useRouter();

    useEffect(() => {
        // Efeito de confete ao carregar
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        };

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
            <Card className="max-w-md w-full text-center shadow-lg border-primary/20">
                <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Pagamento Confirmado!</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Sua assinatura foi ativada com sucesso. Você já tem acesso a todos os recursos premium do plano escolhido.
                    </p>
                    <div className="p-4 bg-muted rounded-lg text-sm">
                        Um recibo foi enviado para o seu e-mail.
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3">
                    <Button
                        className="w-full h-12 text-lg gap-2"
                        onClick={() => router.push('/dashboard')}
                    >
                        Ir para Dashboard
                        <ArrowRight className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => router.push('/dashboard/profile')}
                    >
                        Gerenciar Assinatura
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

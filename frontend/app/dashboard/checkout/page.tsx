import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Checkout | InvestCopilot',
    description: 'Assine um plano premium e desbloqueie todo o potencial dos seus investimentos.',
};

export default function CheckoutPage() {
    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="bg-muted/30 border-b">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
                    <p className="text-muted-foreground mt-2">
                        Complete sua assinatura e comece a investir melhor hoje mesmo.
                    </p>
                </div>
            </div>

            <CheckoutForm />
        </div>
    );
}

import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Lock } from 'lucide-react';
import { formatCurrency } from '@/lib/stripe/utils';

interface PaymentFormProps {
    amount: number;
    onSuccess: (paymentMethodId: string) => Promise<void>;
    isLoading?: boolean;
}

export function PaymentForm({ amount, onSuccess, isLoading: externalLoading }: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [internalLoading, setInternalLoading] = useState(false);

    const isLoading = externalLoading || internalLoading;

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setInternalLoading(true);
        setErrorMessage(null);

        try {
            // 1. Validar elementos
            const { error: submitError } = await elements.submit();

            if (submitError) {
                setErrorMessage(submitError.message || 'Erro ao validar formulário');
                setInternalLoading(false);
                return;
            }

            // 2. Criar PaymentMethod
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                elements,
            });

            if (error) {
                setErrorMessage(error.message || 'Erro ao processar pagamento');
                setInternalLoading(false);
                return;
            }

            // 3. Enviar para componente pai processar a assinatura
            await onSuccess(paymentMethod.id);

        } catch (err: any) {
            setErrorMessage(err.message || 'Ocorreu um erro inesperado');
        } finally {
            setInternalLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dados de Pagamento</h3>

                <div className="border rounded-md p-4 bg-background">
                    <PaymentElement
                        options={{
                            layout: 'tabs',
                        }}
                    />
                </div>
            </div>

            {errorMessage && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro no pagamento</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            <Button
                type="submit"
                disabled={!stripe || isLoading}
                className="w-full h-12 text-lg"
            >
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        Processando...
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Pagar {formatCurrency(amount)}
                    </span>
                )}
            </Button>

            <p className="text-center text-xs text-muted-foreground pt-2">
                Pagamento processado de forma segura pelo Stripe. Seus dados estão protegidos.
            </p>
        </form>
    );
}

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { paymentsApi } from '@/lib/api/payments';
import { CreateSubscriptionInput } from '@/types/payments';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UseCheckoutProps {
    userId?: string;
    onSuccess?: (subscriptionId: string) => void;
}

export function useCheckout({ userId, onSuccess }: UseCheckoutProps = {}) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const createSubscription = useMutation({
        mutationFn: (data: CreateSubscriptionInput) =>
            paymentsApi.createSubscription(data),
        onSuccess: (data) => {
            toast.success('Assinatura realizada com sucesso!');
            if (onSuccess) {
                onSuccess(data.subscriptionId);
            } else {
                router.push('/dashboard/checkout/success');
            }
        },
        onError: (err: any) => {
            const msg = err.response?.data?.message || 'Erro ao processar assinatura';
            setError(msg);
            toast.error(msg);
        },
    });

    return {
        createSubscription,
        isLoading: createSubscription.isPending,
        error,
    };
}

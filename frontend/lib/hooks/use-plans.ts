import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '@/lib/api/payments';
import { Plan } from '@/types/payments';

export function usePlans(activeOnly = true) {
    return useQuery({
        queryKey: ['plans', { activeOnly }],
        queryFn: () => paymentsApi.getPlans(activeOnly),
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}

export function usePlan(planId: string) {
    return useQuery({
        queryKey: ['plan', planId],
        queryFn: () => paymentsApi.getPlan(planId),
        enabled: !!planId,
    });
}

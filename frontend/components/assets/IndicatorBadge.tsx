import { Badge } from '@/components/ui/badge';
import type { AssetType } from '@/lib/types/asset';

interface IndicatorBadgeProps {
    label: string;
    value: number | string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export function IndicatorBadge({ label, value, variant = 'secondary' }: IndicatorBadgeProps) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{label}:</span>
            <Badge variant={variant}>{value}</Badge>
        </div>
    );
}

interface AssetTypeBadgeProps {
    type: AssetType;
}

const typeColors: Record<AssetType, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    STOCK: 'default',
    REIT: 'secondary',
    ETF: 'outline',
    BDR: 'outline',
    CRYPTO: 'destructive',
};

const typeLabels: Record<AssetType, string> = {
    STOCK: 'Ação',
    REIT: 'FII',
    ETF: 'ETF',
    BDR: 'BDR',
    CRYPTO: 'Crypto',
};

export function AssetTypeBadge({ type }: AssetTypeBadgeProps) {
    return (
        <Badge variant={typeColors[type]}>
            {typeLabels[type]}
        </Badge>
    );
}

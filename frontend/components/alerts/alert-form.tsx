import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCondition, CreateAlertDto } from '@/lib/types/alerts';
import { Asset } from '@/lib/types/asset';
import { assetsApi } from '@/lib/api/assets';
import { Loader2 } from 'lucide-react';

interface AlertFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateAlertDto) => Promise<void>;
}

export function AlertForm({ open, onOpenChange, onSubmit }: AlertFormProps) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loadingAssets, setLoadingAssets] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { register, handleSubmit, setValue, watch, reset } = useForm<CreateAlertDto>({
        defaultValues: {
            condition: AlertCondition.ABOVE,
            targetPrice: 0,
        }
    });

    useEffect(() => {
        if (open) {
            loadAssets();
            reset();
        }
    }, [open, reset]);

    const loadAssets = async () => {
        setLoadingAssets(true);
        try {
            const response = await assetsApi.list({ perPage: 100 });
            setAssets(response.data);
        } catch (error) {
            console.error('Failed to load assets', error);
        } finally {
            setLoadingAssets(false);
        }
    };

    const onFormSubmit = async (data: CreateAlertDto) => {
        setSubmitting(true);
        try {
            await onSubmit({
                ...data,
                targetPrice: Number(data.targetPrice),
            });
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const selectedAssetId = watch('assetId');
    const selectedAsset = assets.find(a => a.id === selectedAssetId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Novo Alerta de Preço</DialogTitle>
                    <DialogDescription>
                        Receba uma notificação quando o ativo atingir o preço alvo.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Ativo</Label>
                        <Select onValueChange={(val) => setValue('assetId', val)} disabled={loadingAssets}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um ativo" />
                            </SelectTrigger>
                            <SelectContent>
                                {assets.map((asset) => (
                                    <SelectItem key={asset.id} value={asset.id}>
                                        {asset.ticker} - {asset.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {loadingAssets && <p className="text-xs text-muted-foreground">Carregando ativos...</p>}
                    </div>

                    {selectedAsset && (
                        <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md mb-2">
                            Preço Atual: <span className="font-semibold text-foreground">R$ {selectedAsset.currentPrice?.toFixed(2) || 'N/A'}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Condição</Label>
                            <Select
                                onValueChange={(val) => setValue('condition', val as AlertCondition)}
                                defaultValue={AlertCondition.ABOVE}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={AlertCondition.ABOVE}>Acima de</SelectItem>
                                    <SelectItem value={AlertCondition.BELOW}>Abaixo de</SelectItem>
                                    <SelectItem value={AlertCondition.EQUAL}>Igual a</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Preço Alvo</Label>
                            <Input
                                type="number"
                                step="0.01"
                                {...register('targetPrice', { required: true, min: 0.01 })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Criar Alerta
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { assetsApi } from '@/lib/api/assets';
import type { CreateAssetInput, AssetType } from '@/lib/types/asset';
import { ASSET_SECTORS } from '@/lib/constants/sectors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';


export default function NewAssetPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateAssetInput>({
        ticker: '',
        name: '',
        type: 'STOCK',
        sector: '',
        targetPrice: undefined,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.ticker || !formData.name) {
            toast.error('Ticker e Nome são obrigatórios');
            return;
        }

        setLoading(true);
        try {
            await assetsApi.create({
                ...formData,
                ticker: formData.ticker.toUpperCase(),
            });
            toast.success('Ativo criado com sucesso!');
            router.push('/dashboard/assets');
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao criar ativo';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <main className="container mx-auto p-6 max-w-2xl">
            <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight">Novo Ativo</h2>
                <p className="text-muted-foreground">Adicione um novo ativo à sua carteira</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informações do Ativo</CardTitle>
                    <CardDescription>
                        Preencha os dados básicos do ativo. Você poderá adicionar indicadores depois.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="ticker">
                                    Ticker <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="ticker"
                                    placeholder="Ex: PETR4"
                                    value={formData.ticker}
                                    onChange={(e) =>
                                        setFormData({ ...formData, ticker: e.target.value.toUpperCase() })
                                    }
                                    required
                                    disabled={loading}
                                    maxLength={10}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">
                                    Tipo <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value: AssetType) =>
                                        setFormData({ ...formData, type: value })
                                    }
                                    disabled={loading}
                                >
                                    <SelectTrigger id="type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="STOCK">Ação</SelectItem>
                                        <SelectItem value="REIT">FII</SelectItem>
                                        <SelectItem value="ETF">ETF</SelectItem>
                                        <SelectItem value="CRYPTO">Crypto</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Nome <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="Ex: Petrobras PN"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sector">Setor</Label>
                            <Select
                                value={formData.sector}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, sector: value })
                                }
                                disabled={loading}
                            >
                                <SelectTrigger id="sector">
                                    <SelectValue placeholder="Selecione um setor..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {ASSET_SECTORS.map((sector) => (
                                        <SelectItem key={sector} value={sector}>
                                            {sector}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="targetPrice">Preço Alvo (R$)</Label>
                            <Input
                                id="targetPrice"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Ex: 42.50"
                                value={formData.targetPrice || ''}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        targetPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                                    })
                                }
                                disabled={loading}
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/dashboard/assets')}
                                disabled={loading}
                                className="flex-1"
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading} className="flex-1">
                                {loading ? 'Criando...' : 'Criar Ativo'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}

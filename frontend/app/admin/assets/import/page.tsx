'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, Search, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { assetImportApi, ImportResult } from '@/lib/api/assetImportApi';

export default function AdminAssetImportPage() {
    const [importing, setImporting] = useState(false);
    const [searchTicker, setSearchTicker] = useState('');
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleImportTop200 = async () => {
        setImporting(true);
        setError(null);
        setImportResult(null);

        try {
            const result = await assetImportApi.importBulk({
                limit: 200,
                skipRecent: true,
            });
            setImportResult(result);
        } catch (err: unknown) {
            setError((err as { message?: string }).message || 'Erro ao importar ativos');
        } finally {
            setImporting(false);
        }
    };

    const handleSearchImport = async () => {
        if (!searchTicker.trim()) return;

        setImporting(true);
        setError(null);

        try {
            await assetImportApi.searchAndImport(searchTicker.toUpperCase());
            setSearchTicker('');
            alert(`Ativo ${searchTicker.toUpperCase()} importado com sucesso!`);
        } catch (err: unknown) {
            setError((err as { message?: string }).message || 'Erro ao importar ativo');
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Importação de Ativos</h1>
                <p className="text-muted-foreground">Gerencie a importação de ativos da B3</p>
            </div>

            {/* Sync Status Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Status da Sincronização
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Última Sincronização</p>
                            <p className="text-2xl font-bold">Domingo 2h</p>
                            <p className="text-xs text-muted-foreground mt-1">Automática (Cron)</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Total de Ativos</p>
                            <p className="text-2xl font-bold">-</p>
                            <p className="text-xs text-muted-foreground mt-1">No banco de dados</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Ativos Hoje</p>
                            <p className="text-2xl font-bold">-</p>
                            <p className="text-xs text-muted-foreground mt-1">Atualizados nas últimas 24h</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Manual Import Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Importação Manual
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search and Import */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Buscar e Importar Ativo</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Digite o ticker (ex: PETR4)"
                                value={searchTicker}
                                onChange={(e) => setSearchTicker(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchImport()}
                                disabled={importing}
                            />
                            <Button onClick={handleSearchImport} disabled={importing || !searchTicker.trim()}>
                                {importing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Search className="h-4 w-4" />
                                )}
                                <span className="ml-2">Importar</span>
                            </Button>
                        </div>
                    </div>

                    {/* Bulk Import */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Importação em Lote</label>
                        <Button
                            onClick={handleImportTop200}
                            disabled={importing}
                            variant="default"
                            className="w-full"
                        >
                            {importing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Importando...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4 mr-2" />
                                    Sincronizar Top 200 Ativos
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                            Importa os 200 ativos mais líquidos da B3. Ativos atualizados nas últimas 24h serão
                            ignorados.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                            <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                            <div>
                                <p className="font-medium text-red-500">Erro na Importação</p>
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Success Result */}
                    {importResult && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg space-y-3">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <p className="font-medium text-green-500">Importação Concluída</p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <div className="text-center p-2 bg-background rounded">
                                    <p className="text-2xl font-bold text-green-500">{importResult.created}</p>
                                    <p className="text-xs text-muted-foreground">Criados</p>
                                </div>
                                <div className="text-center p-2 bg-background rounded">
                                    <p className="text-2xl font-bold text-blue-500">{importResult.updated}</p>
                                    <p className="text-xs text-muted-foreground">Atualizados</p>
                                </div>
                                <div className="text-center p-2 bg-background rounded">
                                    <p className="text-2xl font-bold text-yellow-500">{importResult.skipped}</p>
                                    <p className="text-xs text-muted-foreground">Ignorados</p>
                                </div>
                                <div className="text-center p-2 bg-background rounded">
                                    <p className="text-2xl font-bold text-red-500">{importResult.errors}</p>
                                    <p className="text-xs text-muted-foreground">Erros</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Import Log */}
            {importResult && importResult.details.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Log de Importação
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {importResult.details.slice(0, 50).map((detail, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                                >
                                    <span className="font-mono">{detail.ticker}</span>
                                    <Badge
                                        variant={
                                            detail.status === 'created'
                                                ? 'default'
                                                : detail.status === 'updated'
                                                    ? 'secondary'
                                                    : detail.status === 'error'
                                                        ? 'destructive'
                                                        : 'outline'
                                        }
                                    >
                                        {detail.status}
                                    </Badge>
                                </div>
                            ))}
                            {importResult.details.length > 50 && (
                                <p className="text-xs text-muted-foreground text-center">
                                    Mostrando 50 de {importResult.details.length} registros
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

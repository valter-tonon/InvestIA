'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { philosophiesApi } from '@/lib/api/philosophies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/philosophies/FileUpload';
import { toast } from 'sonner';
import { ArrowLeft, Upload } from 'lucide-react';

export default function UploadPhilosophyPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            toast.error('Selecione um arquivo PDF');
            return;
        }

        if (!title.trim()) {
            toast.error('Digite um título para a filosofia');
            return;
        }

        try {
            setUploading(true);
            await philosophiesApi.upload({
                title: title.trim(),
                description: description.trim() || undefined,
                file,
            });

            toast.success('Filosofia enviada com sucesso! A IA está processando o PDF...');
            router.push('/dashboard/philosophies');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao fazer upload da filosofia');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    if (authLoading) {
        return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <header className="border-b bg-white dark:bg-slate-800">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <h1 className="text-2xl font-bold cursor-pointer" onClick={() => router.push('/dashboard')}>
                        InvestCopilot
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{user.name}</span>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto p-6 max-w-3xl">
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/dashboard/philosophies')}
                        className="mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Button>
                    <h2 className="text-3xl font-bold tracking-tight">Nova Filosofia de Investimento</h2>
                    <p className="text-muted-foreground">
                        Faça upload de um PDF com sua filosofia de investimento. Nossa IA irá extrair as regras automaticamente.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações da Filosofia</CardTitle>
                            <CardDescription>
                                Preencha os dados e faça upload do arquivo PDF
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Título */}
                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    Título <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    placeholder="Ex: Filosofia Barsi"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    minLength={3}
                                />
                            </div>

                            {/* Descrição */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Descrição (opcional)</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Ex: Investimento focado em dividendos e empresas sólidas"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            {/* Upload de arquivo */}
                            <div className="space-y-2">
                                <Label>
                                    Arquivo PDF <span className="text-red-500">*</span>
                                </Label>
                                <FileUpload
                                    onFileSelect={setFile}
                                    selectedFile={file}
                                    onClear={() => setFile(null)}
                                    accept=".pdf"
                                    maxSize={50}
                                />
                            </div>

                            {/* Botões */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/dashboard/philosophies')}
                                    disabled={uploading}
                                    className="flex-1"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={uploading || !file || !title.trim()}
                                    className="flex-1"
                                >
                                    {uploading ? (
                                        <>Enviando...</>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Enviar Filosofia
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </main>
        </div>
    );
}

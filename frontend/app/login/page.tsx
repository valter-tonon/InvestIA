'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login({ email, password });
            toast.success('Login realizado com sucesso!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#030712] p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] opacity-20 pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] opacity-20 pointer-events-none" />

            <Card className="w-full max-w-md border-white/10 bg-black/50 backdrop-blur-xl shadow-2xl relative z-10">
                <CardHeader className="space-y-2 text-center">
                    <div className="flex justify-center mb-2">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <BrainCircuit className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight font-display">Bem-vindo ao InvestCopilot</CardTitle>
                    <CardDescription>Sua inteligência para investimentos de alta performance</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="bg-white/5 border-white/10 focus:border-primary/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Senha</Label>
                                <Link href="#" className="text-xs text-primary hover:text-primary/80">Esqueceu a senha?</Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                className="bg-white/5 border-white/10 focus:border-primary/50"
                            />
                        </div>
                        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" disabled={loading}>
                            {loading ? 'Entrando...' : 'Acessar Plataforma'}
                        </Button>
                        {/* Cadastros desabilitados temporariamente */}
                        {/* <div className="text-center text-sm text-muted-foreground mt-4">
                            Não tem uma conta?{' '}
                            <Link href="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
                                Criar conta gratuita
                            </Link>
                        </div> */}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

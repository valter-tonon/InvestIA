import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PublicSimulatorsPage() {
    return (
        <div className="container mx-auto px-4 py-16 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl font-display">
                    Simuladores de Investimento
                </h1>
                <p className="text-xl text-muted-foreground">
                    Ferramentas gratuitas para ajudar você a projetar seus ganhos e tomar decisões financeiras mais inteligentes.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
                {/* Juros Compostos Card */}
                <Card className="flex flex-col h-full border-white/10 bg-white/5 backdrop-blur-sm hover:border-primary/50 transition-all group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="relative z-10">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors border border-primary/20">
                            <Calculator className="w-7 h-7 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Juros Compostos</CardTitle>
                        <CardDescription className="text-base">
                            Calcule o poder do tempo e dos aportes mensais no seu patrimônio. Visualize a curva de crescimento dos seus investimentos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto pt-0 relative z-10">
                        <Link href="/simuladores/juros-compostos">
                            <Button className="w-full h-12 text-lg gap-2 bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                                Simular Agora
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Renda Fixa Card */}
                <Card className="flex flex-col h-full border-white/10 bg-white/5 backdrop-blur-sm hover:border-blue-500/50 transition-all group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="relative z-10">
                        <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors border border-blue-500/20">
                            <TrendingUp className="w-7 h-7 text-blue-500" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Comparador Renda Fixa</CardTitle>
                        <CardDescription className="text-base">
                            Compare CDB, LCI, LCA e Tesouro Direto. Descubra qual ativo oferece a melhor rentabilidade líquida para seu prazo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto pt-0 relative z-10">
                        <Link href="/simuladores/renda-fixa">
                            <Button variant="outline" className="w-full h-12 text-lg gap-2 border-blue-500/20 hover:bg-blue-500/10 hover:text-blue-500">
                                Comparar Ativos
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* CTA Section */}
            <div className="mt-24 p-8 rounded-2xl border border-white/10 bg-gradient-to-r from-primary/10 to-blue-500/10 text-center max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">Quer uma análise completa da sua carteira?</h2>
                <p className="text-muted-foreground mb-6">
                    O InvestCopilot oferece ferramentas avançadas de análise fundamentalista e monitoramento de ativos com Inteligência Artificial.
                </p>
                <Link href="/login">
                    <Button size="lg" className="px-8">
                        Acessar Plataforma Completa
                    </Button>
                </Link>
            </div>
        </div>
    );
}

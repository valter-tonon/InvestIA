"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, BrainCircuit, ShieldCheck, Zap, TrendingUp, DollarSign, Briefcase, Activity, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] opacity-40 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] opacity-40" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
              <BrainCircuit className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight font-display">InvestCopilot</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-primary transition-colors">Funcionalidades</Link>
            <Link href="#methodology" className="hover:text-primary transition-colors">Metodologia</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Planos</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Entrar</Button>
            </Link>
            <Link href="/simuladores">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                Acessar Simuladores
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="container pt-24 pb-32 md:pt-32 md:pb-48 text-center">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              Nova Geração de Análise de Investimentos
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl font-display bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-400">
              Invista com a precisão da <span className="text-primary block md:inline">Inteligência Artificial</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
              O InvestCopilot combina a sabedoria de mestres como Buffett e Bazin com algoritmos avançados para analisar ações, FIIs e ETFs em segundos.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/simuladores">
                <Button size="lg" className="h-12 px-8 text-lg bg-primary hover:bg-primary/90 shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all hover:scale-105">
                  Simulador de Investimentos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg border-white/10 hover:bg-white/5 backdrop-blur-sm">
                  Ver Demonstração
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="container py-24 space-y-24">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-bold font-display sm:text-4xl">Poder institucional para investidores individuais</h2>
            <p className="text-muted-foreground text-lg">Deixe a complexidade dos dados conosco e foque na tomada de decisão.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 hover:border-primary/50 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 text-primary">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold font-display">Análise em Tempo Real</h3>
                <p className="text-muted-foreground">
                  Conectado diretamente à B3 para monitorar cotações e indicadores fundamentalistas instantaneamente.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 hover:border-primary/50 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20 text-blue-500">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold font-display">Estratégias Automatizadas</h3>
                <p className="text-muted-foreground">
                  Replique filosofias vencedoras (Graham, Greenblatt, Bazin) ou crie suas próprias regras com IA.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 hover:border-primary/50 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-500">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold font-display">Segurança e Privacidade</h3>
                <p className="text-muted-foreground">
                  Seus dados são criptografados e as análises são privadas. Foco total na proteção do seu patrimônio.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section className="container pb-24 pt-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Interface Premium</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 font-display">
              O Painel de Controle da sua Liberdade Financeira
            </h2>
            <p className="text-muted-foreground text-lg">
              Monitore patrimônio, proventos e metas em um único lugar, com atualização em tempo real e insights de IA.
            </p>
          </div>

          <div className="relative rounded-xl border border-white/10 bg-background/50 backdrop-blur-sm p-4 shadow-2xl overflow-hidden aspect-video md:aspect-[21/9]">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="h-3 w-3 rounded-full bg-red-500/50" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
              <div className="h-3 w-3 rounded-full bg-green-500/50" />
            </div>
            {/* Mockup Content */}
            <div className="flex h-full bg-[#0F172A] rounded-xl overflow-hidden relative border border-slate-800">

              {/* Fake Sidebar */}
              <div className="w-48 hidden md:flex flex-col gap-4 h-full border-r border-slate-800 bg-[#020617]/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 bg-cyan-500 rounded-md flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-sm text-slate-200 tracking-tight">InvestCopilot</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 p-2 bg-cyan-500/10 text-cyan-400 rounded-md text-xs font-medium border border-cyan-500/20">
                    <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
                  </div>
                  <div className="flex items-center gap-2 p-2 text-slate-400 rounded-md text-xs transition-colors">
                    <Briefcase className="h-3.5 w-3.5" /> Carteira
                  </div>
                  <div className="flex items-center gap-2 p-2 text-slate-400 rounded-md text-xs transition-colors">
                    <DollarSign className="h-3.5 w-3.5" /> Proventos
                  </div>
                  <div className="flex items-center gap-2 p-2 text-slate-400 rounded-md text-xs transition-colors">
                    <Activity className="h-3.5 w-3.5" /> Alertas
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-md border border-slate-700">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-300 font-medium">Investidor Premium</span>
                      <span className="text-[8px] text-slate-500">Premium Plan</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fake Main Area */}
              <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden bg-[#0F172A]">
                {/* Fake Header */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Visão Geral</h3>
                    <p className="text-xs text-slate-400">Atualizado hoje às 14:30</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Fake Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                      <Briefcase className="h-3.5 w-3.5 text-cyan-500" /> Patrimônio Total
                    </div>
                    <div className="text-xl font-bold text-white mb-1">R$ 152.450</div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1 bg-emerald-400/10 w-fit px-1.5 py-0.5 rounded">
                      <TrendingUp className="h-2.5 w-2.5" /> +2.5%
                    </div>
                  </div>

                  <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                      <DollarSign className="h-3.5 w-3.5 text-purple-500" /> Proventos (Mês)
                    </div>
                    <div className="text-xl font-bold text-white mb-1">R$ 1.250</div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1 bg-emerald-400/10 w-fit px-1.5 py-0.5 rounded">
                      <TrendingUp className="h-2.5 w-2.5" /> Recorde
                    </div>
                  </div>

                  <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                      <Activity className="h-3.5 w-3.5 text-emerald-500" /> Rentabilidade
                    </div>
                    <div className="text-xl font-bold text-emerald-400 mb-1">+14.2%</div>
                    <div className="text-[10px] text-slate-500">
                      142% do CDI
                    </div>
                  </div>
                </div>

                {/* Fake Chart Area */}
                <div className="flex-1 bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl relative overflow-hidden flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-300">Evolução Patrimonial</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-700 rounded-full text-slate-400">12 Meses</span>
                    </div>
                  </div>
                  <div className="flex-1 flex items-end justify-between gap-2 px-1 pb-2">
                    {/* Fake Bars */}
                    {[35, 42, 38, 55, 62, 58, 72, 68, 85, 92, 88, 75].map((h, i) => (
                      <div key={i} className="flex-1 bg-cyan-500/10 rounded-t-sm relative group hover:bg-cyan-500/20 transition-all cursor-crosshair">
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-500 to-cyan-400/50 rounded-t-sm transition-all group-hover:from-cyan-400 group-hover:to-cyan-300/60" style={{ height: `${h}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-background py-12">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg font-bold font-display text-muted-foreground">InvestCopilot</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 InvestCopilot. Todos os direitos reservados.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground">Termos</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div >
  );
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard } from 'lucide-react';

export default function PublicToolsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Simplified Header */}
            <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl group">
                        <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <LayoutDashboard className="h-6 w-6 text-primary" />
                        </div>
                        <span>InvestCopilot</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <Link href="/simuladores/juros-compostos" className="hover:text-primary transition-colors">
                            Juros Compostos
                        </Link>
                        <Link href="/simuladores/renda-fixa" className="hover:text-primary transition-colors">
                            Renda Fixa
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost">Entrar</Button>
                        </Link>
                        <Link href="/register">
                            <Button>Criar Conta</Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Simplified Footer */}
            <footer className="border-t py-12 bg-muted/20">
                <div className="container mx-auto px-4 text-center text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} InvestCopilot. Ferramentas gratuitas para investidores.</p>
                    <p className="text-sm mt-2">
                        Disclaimer: As simulações não garantem rentabilidade futura. Dados baseados em índices públicos.
                    </p>
                </div>
            </footer>
        </div>
    );
}

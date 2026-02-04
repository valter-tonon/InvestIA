import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
            <h2 className="text-4xl font-bold mb-4">404 - Página Não Encontrada</h2>
            <p className="text-muted-foreground mb-8">O recurso que você procura não existe.</p>
            <Link href="/dashboard">
                <Button>Voltar para Dashboard</Button>
            </Link>
        </div>
    );
}

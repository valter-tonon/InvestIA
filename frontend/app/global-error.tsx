'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="flex h-screen flex-col items-center justify-center bg-white text-black">
                    <h2 className="text-4xl font-bold mb-4">Algo deu errado!</h2>
                    <p className="mb-4">Ocorreu um erro crítico na aplicação.</p>
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                    >
                        Tentar novamente
                    </button>
                </div>
            </body>
        </html>
    );
}

"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Algo deu errado</h1>
            <p className="text-muted-foreground">
              Ocorreu um erro inesperado. Tente novamente.
            </p>
          </div>
          <button
            onClick={reset}
            className="bg-foreground text-background rounded-full px-6 py-3 font-medium"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}

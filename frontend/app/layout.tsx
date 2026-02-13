import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "InvestCopilot",
  description: "Sua inteligência artificial para investimentos de alta precisão.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="font-sans antialiased bg-background text-foreground"
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

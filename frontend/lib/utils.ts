import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100)
}

export function getAvatarUrl(path: string | undefined | null): string {
  if (!path) return "";

  // Se já é URL completa (começa com http/https ou data), retorna como está
  if (path.startsWith("http") || path.startsWith("https") || path.startsWith("data:")) {
    return path;
  }

  // Se é caminho relativo (começa com /), converte para URL completa
  if (path.startsWith("/")) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const cleanApiUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
    return `${cleanApiUrl}${path}`;
  }

  // Fallback: trata como caminho relativo
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const cleanApiUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
  return `${cleanApiUrl}/${path}`;
}

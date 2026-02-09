# InvestCopilot Frontend

This is the frontend application for **InvestCopilot**, built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/). It provides a modern, responsive interface for investment analysis and portfolio management.

## 🚀 Key Technologies
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Components**: Shadcn/UI (Radix Primitives)
- **Icons**: Lucide React
- **Charts**: Recharts
- **State**: React Query & Zustand
- **Forms**: React Hook Form + Zod

## 📂 Project Structure
```bash
/app          # App Router pages and layouts
/components   # Reusable UI components
  /ui         # Shadcn base components
  /dashboard  # Feature-specific components
/lib          # Utilities and API clients
  /api        # Axios instances and endpoint definitions
  /hooks      # Custom React hooks
  /types      # TypeScript interfaces
/public       # Static assets
```

## 🛠️ Getting Started

First, install the dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎨 Design System

We use a custom theme based on Shadcn/UI with dark mode support. Global styles are defined in `app/globals.css` and `tailwind.config.ts`.

## 📦 Docker

To build the production image:
```bash
docker build -t investcopilot-web .
```

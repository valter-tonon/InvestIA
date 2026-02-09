# InvestCopilot

<p align="center">
  <img src="frontend/public/logo.png" width="120" alt="InvestCopilot Logo" />
</p>

InvestCopilot is a next-generation investment analysis platform powered by Artificial Intelligence. It combines real-time market data with advanced algorithms to help investors make informed decisions based on proven strategies (Graham, Bazin, Greenblatt) and AI-driven insights.

## 🚀 Features

- **AI-Powered Analysis**: Automated valuation and scoring of assets using machine learning and fundamental analysis.
- **Real-Time Market Data**: Integration with B3 and global markets for up-to-the-minute quotes and indicators.
- **Investment Simulators**: Tools for simulating compound interest, fixed income returns, and portfolio progression.
- **Smart Alerts**: Personalized price and indicator alerts sent via email and in-app notifications.
- **Portfolio Management**: Complete dashboard to track your assets, dividends, and performance.
- **Ranking System**: Automated ranking of best opportunities based on selected fundamentalist criteria.

## 🛠️ Tech Stack

### Backend
- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Queue/Cache**: Redis & BullMQ
- **AI Integration**: OpenAI & Google Gemini APIs

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/)
- **Styling**: Tailwind CSS & Shadcn/UI
- **State Management**: React Query & Zustand
- **Charts**: Recharts

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Deployment**: Oracle Cloud (OCI)

## 🏁 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development without Docker)

### Running with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/valter-tonon/InvestIA.git
   cd InvestIA
   ```

2. **Configure Environment Variables**
   Copy the example environment file and update with your credentials:
   ```bash
   cp .env.example .env
   ```

3. **Start the Application**
   ```bash
   docker-compose up -d
   ```

4. **Access the Application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:3001](http://localhost:3001)
   - API Documentation (Swagger): [http://localhost:3001/api](http://localhost:3001/api)

## 🧪 Running Tests

```bash
# Backend Unit Tests
npm run test

# Backend E2E Tests
npm run test:e2e
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

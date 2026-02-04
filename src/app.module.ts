import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './infrastructure/database';
import { MarketDataModule } from './modules/market-data';
import { KnowledgeBaseModule } from './modules/knowledge-base';
import { AnalysisEngineModule } from './modules/analysis-engine';
import { UsersModule } from './modules/users';
import { AssetsModule } from './modules/assets';
import { AuthModule } from './modules/auth';
import { JobsModule } from './modules/jobs';
import { DashboardModule } from './modules/dashboard';
import { AlertsModule } from './modules/alerts/alerts.module';
import { DividendsModule } from './modules/dividends/dividends.module';
import { FairPriceModule } from './modules/fair-price/fair-price.module';
import { CsrfMiddleware } from './common/middleware/csrf.middleware';
import { RankingModule } from './modules/ranking/ranking.module';
import { EconomicIndicatorsModule } from './modules/economic-indicators/economic-indicators.module';

@Module({
  imports: [
    // Configuração de variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Configuração do BullMQ com Redis
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'redis',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),

    // Rate Limiting com Redis Storage
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 segundos
        limit: 100, // 100 requisições por TTL
      },
    ]),

    // Módulos da aplicação
    DatabaseModule,
    MarketDataModule,
    KnowledgeBaseModule,
    AnalysisEngineModule,
    AuthModule, // ARCH-002: Import AuthModule before UsersModule to ensure JwtAuthGuard is available
    UsersModule,
    AssetsModule,
    JobsModule,
    DashboardModule,
    AlertsModule,
    DividendsModule,
    FairPriceModule,
    FairPriceModule,
    RankingModule,
    EconomicIndicatorsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  // SEC-007: CSRF middleware disabled for REST API (using JWT authentication)
  configure(consumer: MiddlewareConsumer) {
    // CSRF protection not needed for stateless JWT-based APIs
    // consumer
    //   .apply(CsrfMiddleware)
    //   .exclude(
    //     '/auth/login',      // Login doesn't have token yet
    //     '/auth/register',   // Register doesn't have token yet
    //     '/api',             // Exclude Swagger root
    //     '/api/json',        // Exclude Swagger JSON
    //   )
    //   .forRoutes('*');
  }
}


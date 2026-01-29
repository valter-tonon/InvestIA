import { Module } from '@nestjs/common';
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
    UsersModule,
    AssetsModule,
    AuthModule,
    JobsModule,
    KnowledgeBaseModule,
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
export class AppModule { }


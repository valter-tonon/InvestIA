import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { CalculateFairPriceUseCase } from './application/use-cases/calculate-fair-price.use-case';
import { FairPriceController } from './infrastructure/controllers/fair-price.controller';

@Module({
    imports: [DatabaseModule],
    controllers: [FairPriceController],
    providers: [CalculateFairPriceUseCase],
    exports: [CalculateFairPriceUseCase],
})
export class FairPriceModule { }

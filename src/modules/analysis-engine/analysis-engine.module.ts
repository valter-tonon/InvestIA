import { Module } from '@nestjs/common';
import { AnalysisEngineService } from './services/analysis-engine.service';

@Module({
    providers: [AnalysisEngineService],
    exports: [AnalysisEngineService],
})
export class AnalysisEngineModule { }

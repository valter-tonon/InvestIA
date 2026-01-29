import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { PhilosophiesController } from './infrastructure/controllers/philosophies.controller';
import { UploadPhilosophyUseCase, ListPhilosophiesUseCase, DeletePhilosophyUseCase } from './application/use-cases';
import { PdfExtractorService } from './services/pdf-extractor.service';
import { IngestPhilosophyUseCase } from './application/use-cases/ingest-philosophy.use-case';

@Module({
    imports: [DatabaseModule],
    controllers: [PhilosophiesController],
    providers: [
        IngestPhilosophyUseCase,
        UploadPhilosophyUseCase,
        ListPhilosophiesUseCase,
        DeletePhilosophyUseCase,
        PdfExtractorService,
    ],
    exports: [
        IngestPhilosophyUseCase,
        UploadPhilosophyUseCase,
    ],
})
export class KnowledgeBaseModule { }

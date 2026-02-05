import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { PhilosophiesController } from './infrastructure/controllers/philosophies.controller';
import { UploadPhilosophyUseCase } from './application/use-cases/upload-philosophy.use-case';
import { ListPhilosophiesUseCase } from './application/use-cases/list-philosophies.use-case';
import { DeletePhilosophyUseCase } from './application/use-cases/delete-philosophy.use-case';
import { PdfExtractorService } from './services/pdf-extractor.service';
import { RuleExtractionService } from './services/rule-extraction.service';
import { OpenAiProvider } from './services/providers/openai.provider';
import { GeminiProvider } from './services/providers/gemini.provider';
import { PromptService } from './services/prompt.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        DatabaseModule,
        ConfigModule,
        AuthModule,
        MulterModule.register({
            storage: diskStorage({
                destination: './uploads/philosophies',
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
                },
            }),
        }),
    ],
    controllers: [PhilosophiesController],
    providers: [
        PdfExtractorService,
        RuleExtractionService,
        OpenAiProvider,
        GeminiProvider,
        PromptService,
        UploadPhilosophyUseCase,
        ListPhilosophiesUseCase,
        DeletePhilosophyUseCase,
    ],
})
export class KnowledgeBaseModule { }

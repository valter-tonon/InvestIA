import {
    Controller,
    Post,
    Get,
    Delete,
    Body,
    Param,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    HttpCode,
    HttpStatus,
    ParseFilePipeBuilder,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard, CurrentUser } from '../../../auth';
import { UploadPhilosophyUseCase, ListPhilosophiesUseCase, DeletePhilosophyUseCase } from '../../application/use-cases';
import { UploadPhilosophyInput, PhilosophyOutput } from '../../application/dtos';
import { multerConfig } from '../../../../config/multer.config';

@ApiTags('philosophies')
@Controller('philosophies')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class PhilosophiesController {
    constructor(
        private readonly uploadPhilosophyUseCase: UploadPhilosophyUseCase,
        private readonly listPhilosophiesUseCase: ListPhilosophiesUseCase,
        private readonly deletePhilosophyUseCase: DeletePhilosophyUseCase,
    ) { }

    @Post('upload')
    @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 req/min (upload é operação pesada)
    @ApiOperation({ summary: 'Fazer upload de PDF de filosofia de investimento' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                title: {
                    type: 'string',
                },
                description: {
                    type: 'string',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Upload realizado com sucesso', type: PhilosophyOutput })
    @UseInterceptors(FileInterceptor('file', multerConfig))
    @HttpCode(HttpStatus.CREATED)
    async upload(
        @CurrentUser() user: any,
        @Body() input: UploadPhilosophyInput,
        @UploadedFile(
            new ParseFilePipeBuilder()
                .build({
                    fileIsRequired: true,
                }),
        )
        file: Express.Multer.File,
    ) {
        return this.uploadPhilosophyUseCase.execute(user.id, input, file);
    }

    @Get()
    @ApiOperation({ summary: 'Listar minhas filosofias' })
    @ApiResponse({ status: 200, description: 'Lista de filosofias', type: [PhilosophyOutput] })
    async list(@CurrentUser() user: any) {
        return this.listPhilosophiesUseCase.execute(user.id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Deletar filosofia' })
    @ApiResponse({ status: 204, description: 'Filosofia deletada' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@CurrentUser() user: any, @Param('id') id: string) {
        return this.deletePhilosophyUseCase.execute(user.id, id);
    }
}

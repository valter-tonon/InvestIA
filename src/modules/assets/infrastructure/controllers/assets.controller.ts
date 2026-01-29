import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
    ParseUUIDPipe,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import {
    CreateAssetUseCase,
    FindAssetUseCase,
    FindAssetByTickerUseCase,
    ListAssetsUseCase,
    UpdateAssetUseCase,
    UpdateIndicatorsUseCase,
    DeleteAssetUseCase,
} from '../../application/use-cases';
import {
    CreateAssetInput,
    UpdateAssetInput,
    UpdateIndicatorsInput,
} from '../../application/dtos';
import { JwtAuthGuard } from '../../../auth';

@ApiTags('assets')
@Controller('assets')
export class AssetsController {
    constructor(
        private readonly createAssetUseCase: CreateAssetUseCase,
        private readonly findAssetUseCase: FindAssetUseCase,
        private readonly findAssetByTickerUseCase: FindAssetByTickerUseCase,
        private readonly listAssetsUseCase: ListAssetsUseCase,
        private readonly updateAssetUseCase: UpdateAssetUseCase,
        private readonly updateIndicatorsUseCase: UpdateIndicatorsUseCase,
        private readonly deleteAssetUseCase: DeleteAssetUseCase,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Criar novo ativo' })
    @ApiResponse({ status: 201, description: 'Ativo criado com sucesso' })
    @ApiResponse({ status: 409, description: 'Ticker já existe' })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() input: CreateAssetInput) {
        return {
            data: await this.createAssetUseCase.execute(input),
        };
    }

    @Get()
    @ApiOperation({ summary: 'Listar ativos com filtros' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'perPage', required: false })
    @ApiQuery({ name: 'type', required: false })
    @ApiQuery({ name: 'sector', required: false })
    @ApiQuery({ name: 'minDY', required: false })
    @ApiQuery({ name: 'maxPE', required: false })
    async list(
        @Query('page') page?: string,
        @Query('perPage') perPage?: string,
        @Query('type') type?: string,
        @Query('sector') sector?: string,
        @Query('minDY') minDY?: string,
        @Query('maxPE') maxPE?: string,
    ) {
        return this.listAssetsUseCase.execute({
            page: page ? parseInt(page, 10) : 1,
            perPage: perPage ? parseInt(perPage, 10) : 20,
            type,
            sector,
            minDY: minDY ? parseFloat(minDY) : undefined,
            maxPE: maxPE ? parseFloat(maxPE) : undefined,
        });
    }

    @Get('ticker/:ticker')
    async findByTicker(@Param('ticker') ticker: string) {
        return {
            data: await this.findAssetByTickerUseCase.execute(ticker),
        };
    }

    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return {
            data: await this.findAssetUseCase.execute(id),
        };
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() input: UpdateAssetInput,
    ) {
        return {
            data: await this.updateAssetUseCase.execute(id, input),
        };
    }

    @Patch(':id/indicators')
    @UseGuards(JwtAuthGuard)
    async updateIndicators(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() input: UpdateIndicatorsInput,
    ) {
        return {
            data: await this.updateIndicatorsUseCase.execute(id, input),
        };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id', ParseUUIDPipe) id: string) {
        await this.deleteAssetUseCase.execute(id);
    }
}

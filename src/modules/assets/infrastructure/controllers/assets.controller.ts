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
    ForbiddenException,
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
import { ImportAssetsFromBrapiUseCase } from '../../application/use-cases/import-assets-from-brapi.use-case';
import { SearchAndImportAssetUseCase } from '../../application/use-cases/search-and-import-asset.use-case';
import {
    CreateAssetInput,
    UpdateAssetInput,
    UpdateIndicatorsInput,
} from '../../application/dtos';
import { ImportBulkDto, SearchImportDto, ImportResultDto } from '../../application/dto/import-assets.dto';
import { JwtAuthGuard } from '../../../auth';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';

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
        private readonly importAssetsFromBrapiUseCase: ImportAssetsFromBrapiUseCase,
        private readonly searchAndImportAssetUseCase: SearchAndImportAssetUseCase,
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
    @ApiQuery({ name: 'search', required: false })
    async list(
        @Query('page') page?: string,
        @Query('perPage') perPage?: string,
        @Query('type') type?: string,
        @Query('sector') sector?: string,
        @Query('search') search?: string,
    ) {
        return this.listAssetsUseCase.execute({
            page: page ? parseInt(page, 10) : 1,
            perPage: perPage ? parseInt(perPage, 10) : 20,
            type,
            sector,
            search,
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
    @ApiBearerAuth('JWT-auth')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() input: UpdateAssetInput,
        @CurrentUser() user: { id: string },
    ) {
        // Note: Assets are global, not user-specific in current schema
        // If assets should be user-specific, add ownership check here
        return {
            data: await this.updateAssetUseCase.execute(id, input),
        };
    }

    @Patch(':id/indicators')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    async updateIndicators(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() input: UpdateIndicatorsInput,
        @CurrentUser() user: { id: string },
    ) {
        // Note: Assets are global, not user-specific in current schema
        return {
            data: await this.updateIndicatorsUseCase.execute(id, input),
        };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: { id: string },
    ) {
        // Note: Assets are global, not user-specific in current schema
        await this.deleteAssetUseCase.execute(id);
    }

    @Post('import/bulk')
    @ApiOperation({ summary: 'Import multiple assets from Brapi (SUPER_ADMIN only)' })
    @ApiResponse({ status: 200, description: 'Import completed', type: ImportResultDto })
    @ApiResponse({ status: 403, description: 'Forbidden - Requires SUPER_ADMIN role' })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN')
    async importBulk(@Body() dto: ImportBulkDto): Promise<ImportResultDto> {
        return this.importAssetsFromBrapiUseCase.execute({
            tickers: dto.tickers,
            limit: dto.limit,
            skipRecent: dto.skipRecent ?? true,
        });
    }

    @Post('import/search')
    @ApiOperation({ summary: 'Search and import asset by ticker (SUPER_ADMIN only)' })
    @ApiResponse({ status: 200, description: 'Asset imported successfully' })
    @ApiResponse({ status: 404, description: 'Asset not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - Requires SUPER_ADMIN role' })
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPER_ADMIN')
    async searchAndImport(@Body() dto: SearchImportDto) {
        return {
            data: await this.searchAndImportAssetUseCase.execute(dto.ticker),
        };
    }
}

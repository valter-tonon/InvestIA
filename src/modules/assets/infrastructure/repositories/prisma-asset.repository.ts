import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { IAssetRepository, AssetFilters, UpdateIndicatorsData } from '../../application/interfaces/asset-repository.interface';
import { AssetEntity } from '../../domain/entities/asset.entity';
import { AssetType } from '../../domain/enums/asset-type.enum';

/**
 * Prisma implementation of IAssetRepository
 * Infrastructure layer - concrete implementation using Prisma ORM
 */
@Injectable()
export class PrismaAssetRepository implements IAssetRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<AssetEntity | null> {
        const asset = await this.prisma.asset.findFirst({
            where: {
                id,
                deleted_at: null, // DB-004: Filter soft deleted
            },
        });

        return asset ? AssetEntity.fromPrisma(asset) : null;
    }

    async findByTicker(ticker: string): Promise<AssetEntity | null> {
        const asset = await this.prisma.asset.findFirst({
            where: {
                ticker: ticker.toUpperCase(),
                deleted_at: null, // DB-004: Filter soft deleted
            },
        });

        return asset ? AssetEntity.fromPrisma(asset) : null;
    }

    async findAll(page: number, limit: number, filters?: AssetFilters): Promise<AssetEntity[]> {
        const skip = (page - 1) * limit;

        const where: any = {
            deleted_at: null, // DB-004: Filter soft deleted
        };
        if (filters?.type) {
            where.type = filters.type;
        }
        if (filters?.sector) {
            where.sector = filters.sector;
        }
        if (filters?.search) {
            where.OR = [
                { ticker: { contains: filters.search, mode: 'insensitive' } },
                { name: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        const assets = await this.prisma.asset.findMany({
            where,
            skip,
            take: limit,
            orderBy: { ticker: 'asc' },
        });

        return assets.map(asset => AssetEntity.fromPrisma(asset));
    }

    async findByType(type: AssetType): Promise<AssetEntity[]> {
        const assets = await this.prisma.asset.findMany({
            where: {
                type,
                deleted_at: null, // DB-004: Filter soft deleted
            },
            orderBy: { ticker: 'asc' },
        });

        return assets.map(asset => AssetEntity.fromPrisma(asset));
    }

    async findBySector(sector: string): Promise<AssetEntity[]> {
        const assets = await this.prisma.asset.findMany({
            where: {
                sector,
                deleted_at: null, // DB-004: Filter soft deleted
            },
            orderBy: { ticker: 'asc' },
        });

        return assets.map(asset => AssetEntity.fromPrisma(asset));
    }

    async create(data: { ticker: string; name: string; type: string; sector?: string }): Promise<AssetEntity> {
        const asset = await this.prisma.asset.create({
            data: {
                ticker: data.ticker.toUpperCase(),
                name: data.name,
                type: data.type,
                sector: data.sector,
            },
        });

        return AssetEntity.fromPrisma(asset);
    }

    async update(id: string, data: { ticker?: string; name?: string; type?: string; sector?: string }): Promise<AssetEntity> {
        const updateData: any = {};
        if (data.ticker) updateData.ticker = data.ticker.toUpperCase();
        if (data.name) updateData.name = data.name;
        if (data.type) updateData.type = data.type;
        if (data.sector !== undefined) updateData.sector = data.sector;

        const asset = await this.prisma.asset.update({
            where: { id },
            data: updateData,
        });

        return AssetEntity.fromPrisma(asset);
    }

    async updateIndicators(id: string, indicators: UpdateIndicatorsData): Promise<AssetEntity> {
        const asset = await this.prisma.asset.update({
            where: { id },
            data: {
                currentPrice: indicators.currentPrice,
                dividendYield: indicators.dividendYield,
                priceToEarnings: indicators.priceToEarnings,
                priceToBook: indicators.priceToBook,
                roe: indicators.roe,
                netMargin: indicators.netMargin,
                debtToEquity: indicators.debtToEquity,
                lastUpdated: new Date(),
            },
        });

        return AssetEntity.fromPrisma(asset);
    }

    async delete(id: string): Promise<void> {
        // DB-004: Soft delete implementation
        await this.prisma.asset.update({
            where: { id },
            data: {
                deleted_at: new Date(),
            },
        });
    }

    async count(filters?: AssetFilters): Promise<number> {
        const where: any = {
            deleted_at: null, // DB-004: Count only active assets
        };
        if (filters?.type) {
            where.type = filters.type;
        }
        if (filters?.sector) {
            where.sector = filters.sector;
        }
        if (filters?.search) {
            where.OR = [
                { ticker: { contains: filters.search, mode: 'insensitive' } },
                { name: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.asset.count({ where });
    }
}

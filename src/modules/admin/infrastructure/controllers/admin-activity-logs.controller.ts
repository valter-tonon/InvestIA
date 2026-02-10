import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@Controller('admin/activity-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class AdminActivityLogsController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    async list(
        @Query('page') page = 1,
        @Query('perPage') perPage = 50,
    ) {
        const skip = (Number(page) - 1) * Number(perPage);
        const take = Number(perPage);

        const [logs, total] = await Promise.all([
            this.prisma.activityLog.findMany({
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.activityLog.count(),
        ]);

        return {
            data: logs,
            meta: {
                total,
                page: Number(page),
                perPage: take,
                lastPage: Math.ceil(total / take),
            },
        };
    }
}

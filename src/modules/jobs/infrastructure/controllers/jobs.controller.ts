import { Controller, Post, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JwtAuthGuard } from '../../../auth';

@ApiTags('jobs')
@Controller('jobs')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class JobsController {
    constructor(
        @InjectQueue('sync-assets') private readonly syncAssetsQueue: Queue,
    ) { }

    @Post('sync-assets')
    @ApiOperation({ summary: 'Executar sincronização de ativos manualmente' })
    @ApiResponse({ status: 200, description: 'Job adicionado à fila' })
    @HttpCode(HttpStatus.OK)
    async triggerSync() {
        const job = await this.syncAssetsQueue.add('sync-all', {}, {
            removeOnComplete: 10, // Manter últimos 10 jobs
            removeOnFail: 50,
        });

        return {
            message: 'Sync job triggered',
            jobId: job.id,
        };
    }

    @Get('sync-assets/status')
    @ApiOperation({ summary: 'Ver status do último job de sincronização' })
    @ApiResponse({ status: 200, description: 'Status do job' })
    async getStatus() {
        const jobs = await this.syncAssetsQueue.getJobs(['completed', 'failed'], 0, 0);

        if (jobs.length === 0) {
            return {
                message: 'No jobs found',
            };
        }

        const lastJob = jobs[0];
        const state = await lastJob.getState();

        return {
            jobId: lastJob.id,
            state,
            data: lastJob.data,
            result: lastJob.returnvalue,
            timestamp: lastJob.timestamp,
            finishedOn: lastJob.finishedOn,
        };
    }
}

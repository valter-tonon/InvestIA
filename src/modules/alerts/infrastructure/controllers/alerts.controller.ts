import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { User } from '@prisma/client';
import { CreateAlertUseCase } from '../../application/use-cases/create-alert.use-case';
import { ListAlertsUseCase } from '../../application/use-cases/list-alerts.use-case';
import { UpdateAlertUseCase } from '../../application/use-cases/update-alert.use-case';
import { DeleteAlertUseCase } from '../../application/use-cases/delete-alert.use-case';
import { ToggleAlertUseCase } from '../../application/use-cases/toggle-alert.use-case';
import { CreateAlertDto } from '../../application/dto/create-alert.dto';
import { UpdateAlertDto } from '../../application/dto/update-alert.dto';

@ApiTags('Alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
    constructor(
        private readonly createAlertUseCase: CreateAlertUseCase,
        private readonly listAlertsUseCase: ListAlertsUseCase,
        private readonly updateAlertUseCase: UpdateAlertUseCase,
        private readonly deleteAlertUseCase: DeleteAlertUseCase,
        private readonly toggleAlertUseCase: ToggleAlertUseCase,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a new price alert' })
    @ApiResponse({ status: 201, description: 'Alert created successfully.' })
    create(@Request() req: any, @Body() createAlertDto: CreateAlertDto) {
        return this.createAlertUseCase.execute(req.user.id, createAlertDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all alerts for current user' })
    @ApiResponse({ status: 200, description: 'List of alerts.' })
    findAll(@Request() req: any) {
        return this.listAlertsUseCase.execute(req.user.id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an alert' })
    @ApiResponse({ status: 200, description: 'Alert updated successfully.' })
    update(
        @Request() req: any,
        @Param('id') id: string,
        @Body() updateAlertDto: UpdateAlertDto,
    ) {
        return this.updateAlertUseCase.execute(req.user.id, id, updateAlertDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an alert' })
    @ApiResponse({ status: 200, description: 'Alert deleted successfully.' })
    remove(@Request() req: any, @Param('id') id: string) {
        return this.deleteAlertUseCase.execute(req.user.id, id);
    }

    @Patch(':id/toggle')
    @ApiOperation({ summary: 'Toggle alert active status' })
    @ApiResponse({ status: 200, description: 'Alert status toggled.' })
    toggle(@Request() req: any, @Param('id') id: string) {
        return this.toggleAlertUseCase.execute(req.user.id, id);
    }
}

import {
    Controller,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { ListUsersAdminUseCase } from '../../application/use-cases/list-users-admin.use-case';
import { UpdateUserRoleUseCase } from '../../application/use-cases/update-user-role.use-case';
import { SuspendUserUseCase } from '../../application/use-cases/suspend-user.use-case';
import { ListUsersAdminInput } from '../../application/dtos/list-users-admin.input';
import { UpdateUserRoleInput } from '../../application/dtos/update-user-role.input';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class AdminUsersController {
    constructor(
        private readonly listUsersAdmin: ListUsersAdminUseCase,
        private readonly updateUserRole: UpdateUserRoleUseCase,
        private readonly suspendUser: SuspendUserUseCase,
        private readonly prisma: PrismaService,
    ) { }

    @Get()
    async list(@Query() query: ListUsersAdminInput) {
        return this.listUsersAdmin.execute(query);
    }

    @Patch(':id/role')
    async changeRole(
        @Param('id') id: string,
        @Body() body: UpdateUserRoleInput,
    ) {
        return this.updateUserRole.execute(id, body);
    }

    @Patch(':id/suspend')
    async suspend(@Param('id') id: string) {
        return this.suspendUser.execute(id, true);
    }

    @Patch(':id/reactivate')
    async reactivate(@Param('id') id: string) {
        return this.suspendUser.execute(id, false);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteUser(@Param('id') id: string) {
        await this.prisma.user.delete({ where: { id } });

        // Log activity
        await this.prisma.activityLog.create({
            data: {
                userId: id,
                action: 'USER_HARD_DELETED',
            },
        });
    }
}

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database';
import { AuthModule } from '../auth';

// Controllers
import { AdminDashboardController } from './infrastructure/controllers/admin-dashboard.controller';
import { AdminUsersController } from './infrastructure/controllers/admin-users.controller';
import { AdminSubscriptionsController } from './infrastructure/controllers/admin-subscriptions.controller';
import { AdminActivityLogsController } from './infrastructure/controllers/admin-activity-logs.controller';

// Use Cases
import { GetAdminDashboardUseCase } from './application/use-cases/get-admin-dashboard.use-case';
import { ListUsersAdminUseCase } from './application/use-cases/list-users-admin.use-case';
import { UpdateUserRoleUseCase } from './application/use-cases/update-user-role.use-case';
import { SuspendUserUseCase } from './application/use-cases/suspend-user.use-case';
import { ListSubscriptionsUseCase } from './application/use-cases/list-subscriptions.use-case';
import { UpdateSubscriptionUseCase } from './application/use-cases/update-subscription.use-case';

@Module({
    imports: [DatabaseModule, AuthModule],
    controllers: [
        AdminDashboardController,
        AdminUsersController,
        AdminSubscriptionsController,
        AdminActivityLogsController,
    ],
    providers: [
        GetAdminDashboardUseCase,
        ListUsersAdminUseCase,
        UpdateUserRoleUseCase,
        SuspendUserUseCase,
        ListSubscriptionsUseCase,
        UpdateSubscriptionUseCase,
    ],
})
export class AdminModule { }

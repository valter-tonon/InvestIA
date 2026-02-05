import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import {
    CreateUserUseCase,
    FindUserUseCase,
    ListUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
} from './application/use-cases';
import { UsersController } from './infrastructure/controllers/users.controller';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';

@Module({
    imports: [DatabaseModule], // ARCH-002: Removed AuthModule - AppModule imports both Auth and Users
    controllers: [UsersController],
    providers: [
        // ARCH-001: Register repository implementation with interface token
        {
            provide: 'IUserRepository',
            useClass: PrismaUserRepository,
        },
        CreateUserUseCase,
        FindUserUseCase,
        ListUsersUseCase,
        UpdateUserUseCase,
        DeleteUserUseCase,
    ],
    exports: [
        // ARCH-002: Export repository for use in other modules (e.g., Auth)
        'IUserRepository',
    ],
})
export class UsersModule { }

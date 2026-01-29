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

@Module({
    imports: [DatabaseModule],
    controllers: [UsersController],
    providers: [
        CreateUserUseCase,
        FindUserUseCase,
        ListUsersUseCase,
        UpdateUserUseCase,
        DeleteUserUseCase,
    ],
    exports: [
        CreateUserUseCase,
        FindUserUseCase,
        ListUsersUseCase,
        UpdateUserUseCase,
        DeleteUserUseCase,
    ],
})
export class UsersModule { }

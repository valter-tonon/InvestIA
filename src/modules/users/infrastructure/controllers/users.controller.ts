import {
    Controller,
    Get,
    Post,
    Put,
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
import {
    CreateUserUseCase,
    FindUserUseCase,
    ListUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
} from '../../application/use-cases';
import { CreateUserInput, UpdateUserInput } from '../../application/dtos';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard'; // ARCH-002: Direct import to avoid circular dependency
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
    constructor(
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly findUserUseCase: FindUserUseCase,
        private readonly listUsersUseCase: ListUsersUseCase,
        private readonly updateUserUseCase: UpdateUserUseCase,
        private readonly deleteUserUseCase: DeleteUserUseCase,
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() input: CreateUserInput) {
        return {
            data: await this.createUserUseCase.execute(input),
        };
    }

    @Get()
    @UseGuards(JwtAuthGuard) // SEC-011: Require authentication to list users
    async list(
        @Query('page') page?: string,
        @Query('perPage') perPage?: string,
    ) {
        return this.listUsersUseCase.execute({
            page: page ? parseInt(page, 10) : 1,
            perPage: perPage ? parseInt(perPage, 10) : 20,
        });
    }

    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return {
            data: await this.findUserUseCase.execute(id),
        };
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() input: UpdateUserInput,
        @CurrentUser() user: { id: string },
    ) {
        // SEC-011: Users can only update their own profile
        if (user.id !== id) {
            throw new ForbiddenException('You can only update your own profile');
        }

        return {
            data: await this.updateUserUseCase.execute(id, input),
        };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: { id: string },
    ) {
        // SEC-011: Users can only delete their own account
        if (user.id !== id) {
            throw new ForbiddenException('You can only delete your own account');
        }

        await this.deleteUserUseCase.execute(id);
    }
}

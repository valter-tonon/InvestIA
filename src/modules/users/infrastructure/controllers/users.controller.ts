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
} from '@nestjs/common';
import {
    CreateUserUseCase,
    FindUserUseCase,
    ListUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
} from '../../application/use-cases';
import { CreateUserInput, UpdateUserInput } from '../../application/dtos';
import { JwtAuthGuard } from '../../../auth';

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
    ) {
        return {
            data: await this.updateUserUseCase.execute(id, input),
        };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id', ParseUUIDPipe) id: string) {
        await this.deleteUserUseCase.execute(id);
    }
}

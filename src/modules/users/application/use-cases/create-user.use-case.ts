import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { CreateUserInput, UserOutput } from '../dtos';

@Injectable()
export class CreateUserUseCase {
    private readonly logger = new Logger(CreateUserUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(input: CreateUserInput): Promise<UserOutput> {
        this.logger.log(`Creating user with email: ${input.email}`);

        // DEPRECATED: Use RegisterUseCase do módulo Auth
        // Este endpoint foi substituído por /auth/register
        throw new Error('Use /auth/register para criar usuários');

        /*
        const asset = await this.prisma.user.create({
          data: {
            email: input.email,
            name: input.name,
          },
        });
    
        this.logger.log(`User created: ${user.email} (${user.id})`);
        return UserOutput.fromEntity(user);
        */
    }
}

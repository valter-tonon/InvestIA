import { Injectable, GoneException, Logger, Inject } from '@nestjs/common';
import type { IUserRepository } from '../interfaces/user-repository.interface';
import { CreateUserInput, UserOutput } from '../dtos';

// ARCH-001/002: Use case now depends on IUserRepository interface
@Injectable()
export class CreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) { }

  async execute(input: CreateUserInput): Promise<UserOutput> {
    this.logger.log(`Creating user with email: ${input.email}`);

    // DEPRECATED: Use RegisterUseCase do módulo Auth
    // Este endpoint foi substituído por /auth/register
    throw new GoneException('Use /auth/register para criar usuários');
  }
}

import { IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateUserRoleInput {
    @IsEnum(UserRole)
    role: UserRole;
}

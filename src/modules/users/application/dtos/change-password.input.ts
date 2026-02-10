import { IsString, MinLength } from 'class-validator';

export class ChangePasswordInput {
    @IsString()
    @MinLength(6, { message: 'A senha atual deve ter no mínimo 6 caracteres' })
    oldPassword: string;

    @IsString()
    @MinLength(6, { message: 'A nova senha deve ter no mínimo 6 caracteres' })
    newPassword: string;
}

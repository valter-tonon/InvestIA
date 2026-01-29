import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserInput {
    @IsEmail({}, { message: 'Email inválido' })
    email: string;

    @IsOptional()
    @IsString()
    @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
    name?: string;
}

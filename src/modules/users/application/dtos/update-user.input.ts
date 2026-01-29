import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserInput {
    @IsOptional()
    @IsString()
    @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
    name?: string;
}

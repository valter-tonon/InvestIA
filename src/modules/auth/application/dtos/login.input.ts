import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginInput {
    @IsEmail({}, { message: 'Email inválido' })
    @IsNotEmpty({ message: 'Email é obrigatório' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Senha é obrigatória' })
    password: string;
}

import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenInput {
    @IsString()
    @IsNotEmpty({ message: 'Refresh token é obrigatório' })
    refreshToken: string;
}

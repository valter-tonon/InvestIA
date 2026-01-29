import { IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadPhilosophyInput {
    @ApiProperty({ description: 'Título da filosofia', example: 'Filosofia Barsi' })
    @IsString()
    @IsNotEmpty({ message: 'Título é obrigatório' })
    @MinLength(3, { message: 'Título deve ter no mínimo 3 caracteres' })
    title: string;

    @ApiProperty({
        description: 'Descrição da filosofia',
        example: 'Investimento focado em dividendos',
        required: false
    })
    @IsOptional()
    @IsString()
    description?: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class DividendResponseDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;

    @ApiProperty({ example: '2024-03-15T00:00:00.000Z' })
    paymentDate: Date;

    @ApiProperty({ example: '2024-03-01T00:00:00.000Z' })
    exDate: Date;

    @ApiProperty({ example: 0.5 })
    value: number;

    @ApiProperty({ example: 'DIVIDEND', enum: ['DIVIDEND', 'JCP'] })
    type: string;
}

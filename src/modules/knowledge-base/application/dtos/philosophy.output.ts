import { ApiProperty } from '@nestjs/swagger';

export class PhilosophyOutput {
    @ApiProperty()
    id: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string | null;

    @ApiProperty()
    filePath: string;

    @ApiProperty()
    extractedText: string;

    @ApiProperty({ type: [String] })
    rules: string[];

    @ApiProperty()
    userId: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    static fromEntity(entity: any): PhilosophyOutput {
        const output = new PhilosophyOutput();
        output.id = entity.id;
        output.title = entity.title;
        output.description = entity.description;
        output.filePath = entity.filePath;
        output.extractedText = entity.extractedText;
        output.rules = entity.rules;
        output.userId = entity.userId;
        output.createdAt = entity.createdAt;
        output.updatedAt = entity.updatedAt;
        return output;
    }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface ExternalApiLogInput {
    provider: string;
    endpoint: string;
    method: string;
    requestHeaders?: any;
    requestBody?: any;
    responseHeaders?: any;
    responseBody?: any;
    statusCode?: number;
    success: boolean;
    duration?: number;
    errorMessage?: string;
    userId?: string;
    transactionId?: string;
}

@Injectable()
export class ExternalApiLoggerService {
    constructor(private readonly prisma: PrismaService) { }

    async log(input: ExternalApiLogInput): Promise<void> {
        try {
            await this.prisma.externalApiLog.create({
                data: {
                    provider: input.provider,
                    endpoint: input.endpoint,
                    method: input.method,
                    requestHeaders: input.requestHeaders,
                    requestBody: input.requestBody,
                    responseHeaders: input.responseHeaders,
                    responseBody: input.responseBody,
                    statusCode: input.statusCode,
                    success: input.success,
                    duration: input.duration,
                    errorMessage: input.errorMessage,
                    userId: input.userId,
                    transactionId: input.transactionId,
                },
            });
        } catch (error) {
            // Don't throw - logging should not break the main flow
            console.error('Failed to log external API call:', error);
        }
    }
}

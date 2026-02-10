
import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Req, Patch, Body, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Get } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case';
import { JwtAuthGuard } from '../../../../modules/auth/infrastructure/guards/jwt-auth.guard';
import { LocalStorageProvider } from '../../../../common/providers/storage/local-storage.provider';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateUserInput } from '../../application/dtos/update-user.input';
import { ChangePasswordInput } from '../../application/dtos/change-password.input';
import { Request } from 'express';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users/profile')
@UseGuards(JwtAuthGuard)
export class UsersProfileController {
    constructor(
        private readonly updateUserUseCase: UpdateUserUseCase,
        private readonly changePasswordUseCase: ChangePasswordUseCase,
        private readonly storageProvider: LocalStorageProvider,
    ) { }

    @Post('avatar')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload user avatar' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    async uploadAvatar(
        @Req() req: any,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
                ],
            }),
        ) file: Express.Multer.File,
    ) {
        const userId = req.user.id;
        const avatarUrl = await this.storageProvider.save(file, 'avatars');

        return this.updateUserUseCase.execute(userId, {
            avatar: avatarUrl,
        });
    }

    @Patch()
    @ApiOperation({ summary: 'Update user profile' })
    async updateProfile(@Req() req: any, @Body() input: UpdateUserInput) {
        const userId = req.user.id;
        return this.updateUserUseCase.execute(userId, input);
    }

    @Patch('change-password')
    @ApiOperation({ summary: 'Change user password' })
    @ApiBody({ type: ChangePasswordInput })
    async changePassword(@Req() req: any, @Body() input: ChangePasswordInput) {
        const userId = req.user.id;
        return this.changePasswordUseCase.execute(userId, input);
    }
}

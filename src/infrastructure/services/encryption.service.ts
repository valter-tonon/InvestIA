import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EncryptionService {
    private readonly algorithm = 'aes-256-cbc';
    private readonly encryptionKey: Buffer;

    constructor(private readonly configService: ConfigService) {
        // Use a secure key from environment variables
        const key = this.configService.get<string>('ENCRYPTION_KEY');
        if (!key || key.length !== 64) {
            throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
        }
        this.encryptionKey = Buffer.from(key, 'hex');
    }

    encrypt(text: string): string {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Return IV + encrypted data (both as hex)
        return iv.toString('hex') + ':' + encrypted;
    }

    decrypt(encryptedText: string): string {
        const [ivHex, encrypted] = encryptedText.split(':');

        if (!ivHex || !encrypted) {
            throw new Error('Invalid encrypted text format');
        }

        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }
}

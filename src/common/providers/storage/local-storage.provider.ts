
import { Injectable } from '@nestjs/common';
import { StorageProvider } from './storage.interface';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
    private readonly uploadDir = 'public/uploads';

    constructor() {
        this.ensureUploadDir();
    }

    private async ensureUploadDir() {
        try {
            await fs.access(this.uploadDir);
        } catch {
            await fs.mkdir(this.uploadDir, { recursive: true });
        }
    }

    async save(file: Express.Multer.File, folder: string): Promise<string> {
        await this.ensureUploadDir();

        const fileExtension = path.extname(file.originalname);
        const fileName = `${crypto.randomUUID()}${fileExtension}`;
        const relativePath = path.join(folder, fileName);
        const fullPath = path.join(this.uploadDir, relativePath);

        // Ensure subfolder exists
        await fs.mkdir(path.dirname(fullPath), { recursive: true });

        await fs.writeFile(fullPath, file.buffer);

        // Return the public URL path (assuming /uploads is served)
        return `/uploads/${relativePath}`;
    }

    async delete(filePath: string): Promise<void> {
        if (!filePath) return;

        // Remove limits /uploads prefix if present
        const cleanPath = filePath.startsWith('/uploads/')
            ? filePath.substring(9)
            : filePath;

        const fullPath = path.join(this.uploadDir, cleanPath);

        try {
            await fs.unlink(fullPath);
        } catch (error) {
            console.error(`Error deleting file ${fullPath}:`, error);
        }
    }
}

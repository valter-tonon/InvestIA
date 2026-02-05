import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';
import * as fs from 'fs';

// PDF Magic Bytes: %PDF (0x25504446)
const PDF_MAGIC_BYTES = Buffer.from([0x25, 0x50, 0x44, 0x46]);

/**
 * Validates if a file is a real PDF by checking magic bytes
 * @param filePath - Path to the file to validate
 * @returns Promise<boolean> - true if file is a valid PDF
 */
async function validatePdfMagicBytes(filePath: string): Promise<boolean> {
    try {
        const buffer = Buffer.alloc(4);
        const fd = fs.openSync(filePath, 'r');
        fs.readSync(fd, buffer, 0, 4, 0);
        fs.closeSync(fd);

        return buffer.equals(PDF_MAGIC_BYTES);
    } catch (error) {
        return false;
    }
}

export const multerConfig = {
    storage: diskStorage({
        destination: './uploads/philosophies',
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            cb(null, `${uniqueSuffix}${ext}`);
        },
    }),
    fileFilter: async (req: Request, file: Express.Multer.File, cb: any) => {
        // First layer: check mimetype
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Only PDF files are allowed!'), false);
        }

        // Second layer: validate magic bytes after file is saved
        // Note: This will be validated in the upload handler
        cb(null, true);
    },
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB (reduced from 50MB for security)
    },
};

export { validatePdfMagicBytes };

import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService } from './encryption.service';
import { ConfigService } from '@nestjs/config';

describe('EncryptionService', () => {
    let service: EncryptionService;
    const mockConfigService = {
        get: jest.fn().mockReturnValue('a'.repeat(64)), // 64 char hex string
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EncryptionService,
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<EncryptionService>(EncryptionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('encrypt and decrypt', () => {
        it('should encrypt and decrypt text correctly', () => {
            const originalText = 'sk_test_51Hx123456789';

            const encrypted = service.encrypt(originalText);
            expect(encrypted).toBeDefined();
            expect(encrypted).not.toBe(originalText);
            expect(encrypted).toContain(':'); // IV:encrypted format

            const decrypted = service.decrypt(encrypted);
            expect(decrypted).toBe(originalText);
        });

        it('should generate different encrypted values for same input', () => {
            const text = 'same_secret';

            const encrypted1 = service.encrypt(text);
            const encrypted2 = service.encrypt(text);

            // Different IVs = different encrypted values
            expect(encrypted1).not.toBe(encrypted2);

            // But both decrypt to same value
            expect(service.decrypt(encrypted1)).toBe(text);
            expect(service.decrypt(encrypted2)).toBe(text);
        });

        it('should handle special characters', () => {
            const text = 'key!@#$%^&*()_+{}[]|:;<>?,./~`';
            const encrypted = service.encrypt(text);
            const decrypted = service.decrypt(encrypted);
            expect(decrypted).toBe(text);
        });

        it('should throw error for invalid encrypted text format', () => {
            expect(() => service.decrypt('invalid_format')).toThrow();
            expect(() => service.decrypt('only_one_part')).toThrow();
        });
    });
});

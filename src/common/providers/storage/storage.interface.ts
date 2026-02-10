
export interface StorageProvider {
    save(file: Express.Multer.File, folder: string): Promise<string>;
    delete(path: string): Promise<void>;
}

export interface Philosophy {
    id: string;
    title: string;
    description: string | null;
    filePath: string;
    extractedText: string;
    rules: string[];
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface UploadPhilosophyInput {
    title: string;
    description?: string;
    file: File;
}

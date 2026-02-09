'use client';

import { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    accept?: string;
    maxSize?: number; // em MB
    selectedFile?: File | null;
    onClear?: () => void;
}

export function FileUpload({
    onFileSelect,
    accept = '.pdf',
    maxSize = 50,
    selectedFile,
    onClear,
}: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateFile = useCallback((file: File): boolean => {
        setError(null);

        // Validar tipo
        if (accept && !file.name.toLowerCase().endsWith(accept.replace('.', ''))) {
            setError(`Apenas arquivos ${accept} são permitidos`);
            return false;
        }

        // Validar tamanho
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSize) {
            setError(`Arquivo muito grande. Máximo: ${maxSize}MB`);
            return false;
        }

        return true;
    }, [accept, maxSize]);

    const handleFile = useCallback((file: File) => {
        if (validateFile(file)) {
            onFileSelect(file);
        }
    }, [onFileSelect, accept, maxSize, validateFile]);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragging(false);

            const file = e.dataTransfer.files[0];
            if (file) {
                handleFile(file);
            }
        },
        [handleFile]
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const formatFileSize = (bytes: number): string => {
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };

    return (
        <div className="w-full">
            {selectedFile ? (
                <div className="flex items-center justify-between p-4 border-2 border-green-500 rounded-lg bg-green-50 dark:bg-green-950">
                    <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-green-600" />
                        <div>
                            <p className="font-medium text-sm">{selectedFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {formatFileSize(selectedFile.size)}
                            </p>
                        </div>
                    </div>
                    {onClear && (
                        <button
                            onClick={onClear}
                            className="p-2 hover:bg-green-100 dark:hover:bg-green-900 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5 text-green-600" />
                        </button>
                    )}
                </div>
            ) : (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={cn(
                        'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
                        isDragging
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-300 dark:border-gray-700 hover:border-primary hover:bg-primary/5'
                    )}
                >
                    <input
                        type="file"
                        accept={accept}
                        onChange={handleFileInput}
                        className="hidden"
                        id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg font-medium mb-2">
                            Arraste seu arquivo aqui ou clique para selecionar
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Arquivos {accept} até {maxSize}MB
                        </p>
                    </label>
                </div>
            )}

            {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    );
}

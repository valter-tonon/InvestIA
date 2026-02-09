export interface ImportBulkRequest {
    tickers?: string[];
    limit?: number;
    skipRecent?: boolean;
}

export interface ImportResult {
    created: number;
    updated: number;
    skipped: number;
    errors: number;
    details: Array<{
        ticker: string;
        status: 'created' | 'updated' | 'skipped' | 'error';
        message?: string;
    }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token') || '';
    }
    return '';
};

export const assetImportApi = {
    /**
     * Import multiple assets from Brapi
     */
    importBulk: async (data: ImportBulkRequest): Promise<ImportResult> => {
        const response = await fetch(`${API_BASE_URL}/assets/import/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to import assets' }));
            throw new Error(error.message || 'Failed to import assets');
        }

        return response.json();
    },

    /**
     * Search and import single asset
     */
    searchAndImport: async (ticker: string): Promise<unknown> => {
        const response = await fetch(`${API_BASE_URL}/assets/import/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify({ ticker }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: `Failed to import ${ticker}` }));
            throw new Error(error.message || `Failed to import ${ticker}`);
        }

        const result = await response.json();
        return result.data;
    },
};

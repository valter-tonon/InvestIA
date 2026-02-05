import { api } from './client';
import type { Philosophy, UploadPhilosophyInput } from '@/lib/types/philosophy';

export const philosophiesApi = {
    // Listar filosofias do usuário
    list: async (): Promise<Philosophy[]> => {
        const response = await api.get('/philosophies');
        return response.data.data || response.data;
    },

    // Upload de nova filosofia (PDF)
    upload: async (data: UploadPhilosophyInput): Promise<Philosophy> => {
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('title', data.title);
        if (data.description) {
            formData.append('description', data.description);
        }

        const response = await api.post('/philosophies/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data || response.data;
    },

    // Deletar filosofia
    delete: async (id: string): Promise<void> => {
        await api.delete(`/philosophies/${id}`);
    },
};

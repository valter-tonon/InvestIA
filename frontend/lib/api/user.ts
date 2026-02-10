import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const userApi = axios.create({
    baseURL: `${API_URL}/users`,
    withCredentials: true,
});

userApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getProfile = async () => {
    // Reutiliza o endpoint de usuário logado (geralmente existe, se não, usamos findUser)
    // Assumindo que o backend tem endpoint para pegar dados do usuário logado, 
    // mas se não tiver, usamos o ID do token.
    // O melhor é criar um endpoint /users/me no UsersController ou AuthController.
    // Vou checar se existe, mas por enquanto vou usar o endpoint de profile imaginário
    // Se não existir, vou ter que criar.
    // Update: UseCase FindUser precisa de ID. AuthController geralmente retorna dados no login.
    // Vou assumir que AuthContext tem os dados, mas para editar precisamos enviar para o backend.

    // Vou usar o endpoint de update profile que criei: PATCH /users/profile
    // Não, esse é para update. Para GET, usaremos o ID que temos no frontend.
};

export const updateProfile = async (data: { name?: string; avatar?: string }) => {
    const response = await userApi.patch('/profile', data);
    return response.data;
};

export const uploadAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await userApi.post('/profile/avatar', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

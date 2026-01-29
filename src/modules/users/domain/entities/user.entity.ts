export class UserEntity {
    id: string;
    email: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;

    constructor(props: Partial<UserEntity>) {
        Object.assign(this, props);
    }

    static create(email: string, name?: string): UserEntity {
        if (!email || !email.includes('@')) {
            throw new Error('Email inválido');
        }

        return new UserEntity({
            email,
            name: name || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
}

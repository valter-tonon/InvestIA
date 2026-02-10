export class UserOutput {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;

    static fromEntity(user: {
        id: string;
        email: string;
        name: string | null;
        avatar?: string | null;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }): UserOutput {
        const output = new UserOutput();
        output.id = user.id;
        output.email = user.email;
        output.name = user.name;
        output.avatar = user.avatar || null;
        output.role = user.role;
        output.createdAt = user.createdAt;
        output.updatedAt = user.updatedAt;
        return output;
    }
}

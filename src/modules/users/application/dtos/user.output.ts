export class UserOutput {
    id: string;
    email: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;

    static fromEntity(user: {
        id: string;
        email: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
    }): UserOutput {
        const output = new UserOutput();
        output.id = user.id;
        output.email = user.email;
        output.name = user.name;
        output.createdAt = user.createdAt;
        output.updatedAt = user.updatedAt;
        return output;
    }
}

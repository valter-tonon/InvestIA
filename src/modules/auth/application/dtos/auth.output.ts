export class AuthOutput {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        name: string | null;
    };

    constructor(
        accessToken: string,
        refreshToken: string,
        user: { id: string; email: string; name: string | null },
    ) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = user;
    }
}

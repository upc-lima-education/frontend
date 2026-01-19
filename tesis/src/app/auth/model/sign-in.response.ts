export class SignInResponse {
    id: string;
    email: string;
    token: string;

    constructor(id: string, username: string, token: string) {
        this.id = id;
        this.email = username;
        this.token = token;
    }
}
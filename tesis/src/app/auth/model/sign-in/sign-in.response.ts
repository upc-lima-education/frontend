export class SignInResponse {
    id: string;
    userEmail: string;
    token: string;

    constructor(id: string, username: string, token: string) {
        this.id = id;
        this.userEmail = username;
        this.token = token;
    }
}
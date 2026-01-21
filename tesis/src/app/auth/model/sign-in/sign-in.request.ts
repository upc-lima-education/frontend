export class SignInRequest {
    email: string;
    password: string;
    type: string;

    constructor(email: string, password: string, type: string) {
        this.email = email;
        this.password = password;
        this.type = type;
    }
}
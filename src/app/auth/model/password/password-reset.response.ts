export class PasswordResetRequest {
    email: string;

    constructor(email: string) {
        this.email = email;
    }
}

export class PasswordResetResponse {
    message: string;
    email: string;

    constructor(message: string, email: string) {
        this.message = message;
        this.email = email;
    }
}

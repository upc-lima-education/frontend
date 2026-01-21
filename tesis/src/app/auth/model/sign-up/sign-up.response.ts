export class SignUpResponse{
    id: string;
    userEmail: string;
    type: string;

    constructor(id: string, email: string, type: string) {
        this.id = id;
        this.userEmail = email;
        this.type = type;
    }
}
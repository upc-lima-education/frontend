export class SignUpResponse{
    id: string;
    email: string;
    type: string;

    constructor(id: string, email: string, type: string) {
        this.id = id;
        this.email = email;
        this.type = type;
    }
}
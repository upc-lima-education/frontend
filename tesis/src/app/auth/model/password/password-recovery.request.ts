export class PasswordRecoveryRequest {
    userId: string;
    authenticationCode: string;

    constructor(userId: string, authenticationCode: string){
        this.userId = userId;
        this.authenticationCode = authenticationCode;
    }
}
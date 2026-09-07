export class SignUpRequest {
    email: string;
    password: string;
    accountType: 'Candidate' | 'Company';

    constructor(email: string, password: string, accountType: 'Candidate' | 'Company') {
        this.email = email;
        this.password = password;
        this.accountType = accountType;
    }
}

export class SignUpRequest {
    email: string;
    password: string;
    profileType?: 'Candidate' | 'Company';

    constructor(email: string, password: string, profileType?: 'Candidate' | 'Company') {
        this.email = email;
        this.password = password;
        this.profileType = profileType;
    }
}


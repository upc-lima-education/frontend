export class SignUpRequest {
    email: string;
    password: string;
    firstName?: string;        // Para employees
    lastName?: string;         // Para employees
    companyName?: string;     // Para organizations
    userType: 'employee' | 'organization';

    constructor(
        email: string,
        password: string,
        firstName?: string,
        lastName?: string,
        companyName?: string,
        userType?: 'employee' | 'organization'
    ) {
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.companyName = companyName;
        this.userType = userType || 'employee';
    }
}
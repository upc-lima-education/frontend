export class SignUpUserOrganizationRequest {
    companyName: string;
    email: string;
    password: string;

    constructor(companyName: string, email: string, password: string){
        this.companyName = companyName;
        this.email = email;
        this.password = password;
    }
}
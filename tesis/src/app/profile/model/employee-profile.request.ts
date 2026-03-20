export class SignUpUserEmployeeRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    description?: string;
    keywords?: string[];
    ruc?: string;
    district?: string;

    constructor(firstName: string, lastName: string, email: string, password: string,
                description?: string, keywords?: string[], ruc?: string, district?: string){
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.description = description;
        this.keywords = keywords;
        this.ruc = ruc;
        this.district = district;
    }
}
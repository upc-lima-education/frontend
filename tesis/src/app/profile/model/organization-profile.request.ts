export class SignUpUserOrganizationRequest {
    companyName: string;
    email: string;
    password: string;
    description?: string;
    keywords?: string[];
    ruc?: string;
    district?: string;
    sector?: string;

    constructor(companyName: string, email: string, password: string,
                description?: string, keywords?: string[], ruc?: string, 
                district?: string, sector?: string){
        this.companyName = companyName;
        this.email = email;
        this.password = password;
        this.description = description;
        this.keywords = keywords;
        this.ruc = ruc;
        this.district = district;
        this.sector = sector;
    }
}
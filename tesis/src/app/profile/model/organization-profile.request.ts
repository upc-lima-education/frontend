/**
 * Modelo para solicitud de registro de organización/empresa
 * Se utiliza en la creación de perfil durante el sign-up
 */
export class SignUpUserOrganizationRequest {
    companyName: string;
    email: string;
    password: string;
    description?: string;
    keywords?: string[];
    ruc?: string;
    isRucVerified?: boolean;
    district?: string;
    sector?: string;

    constructor(
        companyName: string,
        email: string,
        password: string,
        description?: string,
        keywords?: string[],
        ruc?: string,
        isRucVerified?: boolean,
        district?: string,
        sector?: string
    ) {
        this.companyName = companyName;
        this.email = email;
        this.password = password;
        this.description = description;
        this.keywords = keywords;
        this.ruc = ruc;
        this.isRucVerified = isRucVerified;
        this.district = district;
        this.sector = sector;
    }
}
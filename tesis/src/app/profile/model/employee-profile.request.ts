/**
 * Modelo para solicitud de registro de empleado/persona natural
 * Se utiliza en la creación de perfil durante el sign-up
 * Soporta tanto personas naturales como jurídicas
 */
export type PersonType = 'natural' | 'juridica';
export type IdentificationType = 'dni' | 'passport' | 'ruc';

export class SignUpUserEmployeeRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    personType: PersonType; // 'natural' o 'juridica'
    identificationType: IdentificationType; // 'dni', 'passport', 'ruc'
    identification: string; // DNI, Pasaporte o RUC (número sin formato)
    isIdentificationVerified?: boolean;
    description?: string;
    keywords?: string[];
    district?: string;
    // Campos opcionales según tipo de persona
    ruc?: string; // Para persona jurídica
    isRucVerified?: boolean;
    companyName?: string; // Para persona jurídica

    constructor(
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        personType: PersonType,
        identificationType: IdentificationType,
        identification: string,
        description?: string,
        keywords?: string[],
        district?: string,
        ruc?: string,
        isRucVerified?: boolean,
        companyName?: string,
        isIdentificationVerified?: boolean
    ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.personType = personType;
        this.identificationType = identificationType;
        this.identification = identification;
        this.description = description;
        this.keywords = keywords;
        this.district = district;
        this.ruc = ruc;
        this.isRucVerified = isRucVerified;
        this.companyName = companyName;
        this.isIdentificationVerified = isIdentificationVerified;
    }
}
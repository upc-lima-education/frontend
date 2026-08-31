export interface WorkExperience {
    id?: string;
    role: string;
    organization: string;
    startDate: string; // yyyy-MM-dd
    endDate?: string | null; // null = trabajo actual
    description?: string;
}

export interface Education {
    id?: string;
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startDate?: string | null;
    endDate?: string | null; // null = en curso
}

export interface Certification {
    id?: string;
    name: string;
    issuingOrganization?: string;
    issueDate?: string | null;
}

/** Niveles CEFR que admite `LanguageLevel` en backend-v2. */
export type LanguageLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export const LANGUAGE_LEVELS: LanguageLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/**
 * Valores de `LanguageCode` expuestos por el backend. Son códigos ISO 639-1
 * serializados como string; no representan datos de ejemplo.
 */
export const BACKEND_LANGUAGE_CODES = [
    'Aa', 'Ab', 'Ae', 'Af', 'Am', 'An', 'Ar', 'As', 'Av', 'Ay', 'Az', 'Ba', 'Be', 'Bg', 'Bh', 'Bi', 'Bm', 'Bn',
    'Bo', 'Br', 'Bs', 'Ca', 'Ce', 'Ch', 'Co', 'Cr', 'Cs', 'Cu', 'Cv', 'Cy', 'Da', 'De', 'Dv', 'Dz', 'Ee', 'El',
    'En', 'Eo', 'Es', 'Et', 'Eu', 'Fa', 'Ff', 'Fi', 'Fo', 'Fr', 'Fy', 'Ga', 'Gd', 'Gl', 'Gn', 'Gu', 'Gv', 'Ha',
    'He', 'Hi', 'Ho', 'Hr', 'Ht', 'Hu', 'Hy', 'Hz', 'Ia', 'Id', 'Ie', 'Ig', 'Ii', 'Ik', 'Io', 'Is', 'It', 'Iu',
    'Ja', 'Jv', 'Ka', 'Kg', 'Ki', 'Kj', 'Kk', 'Kl', 'Km', 'Kn', 'Ko', 'Kr', 'Ku', 'Kv', 'Kw', 'Ky', 'La', 'Lb',
    'Lg', 'Li', 'Ln', 'Lo', 'Lt', 'Lu', 'Lv', 'Mg', 'Mh', 'Mi', 'Mk', 'Mn', 'Mr', 'Ms', 'Mt', 'My', 'Na', 'Nb',
    'Nd', 'Ne', 'Ng', 'Nl', 'Nn', 'No', 'Nr', 'Nv', 'Ny', 'Oc', 'Oj', 'Om', 'Or', 'Os', 'Pa', 'Pi', 'Pl', 'Ps',
    'Pt', 'Qu', 'Rm', 'Rn', 'Ro', 'Ru', 'Rw', 'Sa', 'Sc', 'Sd', 'Se', 'Sg', 'Si', 'Sk', 'Sl', 'Sm', 'Sn', 'So',
    'Sq', 'Sr', 'Ss', 'St', 'Su', 'Sv', 'Sw', 'Ta', 'Te', 'Tg', 'Th', 'Ti', 'Tk', 'Tl', 'Tn', 'To', 'Tr', 'Ts',
    'Tt', 'Tw', 'Ty', 'Ug', 'Uk', 'Ur', 'Uz', 'Ve', 'Vi', 'Vo', 'Wa', 'Wo', 'Xh', 'Yi', 'Yo', 'Za', 'Zh', 'Zu',
] as const;

export type BackendLanguageCode = typeof BACKEND_LANGUAGE_CODES[number];

export function normalizeLanguageCode(value: string): string {
    const normalized = value.trim();
    return normalized ? `${normalized.charAt(0).toUpperCase()}${normalized.slice(1).toLowerCase()}` : '';
}

export function isBackendLanguageCode(value: string): value is BackendLanguageCode {
    return BACKEND_LANGUAGE_CODES.includes(normalizeLanguageCode(value) as BackendLanguageCode);
}

export interface LanguageEntry {
    id?: string;
    /** Código ISO 639-1 serializado por la API, por ejemplo `Es` o `En`. */
    name: string;
    level: LanguageLevel;
}

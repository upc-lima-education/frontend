export interface WorkExperience {
    id?: string;
    role: string;
    organization: string;
    startDate: string; // yyyy-MM-dd
    endDate?: string | null; // null = trabajo actual
    description?: string;
    location?: string;
}

export interface Education {
    id?: string;
    institution: string;
    degree: string;
    startDate?: string | null;
    endDate?: string | null; // null = en curso
}

export interface Certification {
    id?: string;
    name: string;
    issuingOrganization?: string;
    issueDate?: string | null;
}

export type LanguageLevel = 'Básico' | 'Intermedio' | 'Avanzado' | 'Nativo';

export const LANGUAGE_LEVELS: LanguageLevel[] = ['Básico', 'Intermedio', 'Avanzado', 'Nativo'];

export interface LanguageEntry {
    id?: string;
    name: string;
    level: LanguageLevel;
}

/** Contratos de `backend-v2` para CV estructurado. */
export interface CvHeader {
    fullName: string;
    headline: string;
    email?: string;
    phone?: string;
    location?: string;
}

export interface CvTextSection {
    title: string;
    description: string;
}

export interface CvExperienceItem {
    employer: string;
    location?: string;
    position: string;
    activity?: string;
    /** Fecha ISO `YYYY-MM-DD`, compatible con `DateOnly` del backend. */
    startDate?: string;
    endDate?: string;
    description: string;
}

export interface CvEducationItem {
    institution: string;
    study: string;
    academicLevel: string;
    /** Fecha ISO `YYYY-MM-DD`, compatible con `DateOnly` del backend. */
    startDate?: string;
    endDate?: string;
}

export interface CvCustomSection {
    title: string;
    description: string;
}

export interface CreateStructuredCvRequest {
    title: string;
    isCurrent: boolean;
    header: CvHeader;
    summary?: CvTextSection;
    experience?: CvExperienceItem[];
    education?: CvEducationItem[];
    skills?: CvTextSection;
    languages?: CvTextSection;
    certifications?: CvTextSection;
    projects?: CvTextSection;
    awards?: CvTextSection;
    customSections: CvCustomSection[];
}

export interface GenerateCvResponse {
    cvId: string;
    status: string;
}

/** Resumen persistido del candidato: GET /api/v1/cv/me. */
export interface CvSummaryResponse {
    id: string;
    title: string;
    isCurrent: boolean;
    hasFileContent: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface StructuredCvResponse {
    id: string;
    header: CvHeader;
    summary?: CvTextSection;
    experiences: CvExperienceItem[];
    educations: CvEducationItem[];
    skills?: CvTextSection;
    languages?: CvTextSection;
    certifications?: CvTextSection;
    projects?: CvTextSection;
    awards?: CvTextSection;
    customs: CvCustomSection[];
}

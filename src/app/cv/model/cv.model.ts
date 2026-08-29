export type CvSectionType = 'Summary' | 'Experience' | 'Education' | 'Skills' | 'Languages' | 'Certifications' | 'Projects' | 'Awards' | 'Custom';

export interface CvHeader { fullName: string; headline: string; email?: string; phone?: string; location?: string }
export interface CvSectionItem { title?: string; description: string }
export interface CvSectionRequest { title: string; type: CvSectionType; items: CvSectionItem[] }
export interface CreateStructuredCvRequest { title: string; isCurrent: boolean; header: CvHeader; sections: CvSectionRequest[] }
export interface GenerateCvResponse { cvId: string; status: string }
export interface StructuredCvResponse { id: string; header: CvHeader; sections: Array<CvSectionRequest & { id: string; order: number }> }

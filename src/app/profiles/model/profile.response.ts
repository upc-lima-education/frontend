export interface ProfileResponse {
    //Id
    id: string;
    userId: string;
    //Shared info
    description: string;
    keywords: Array<string>;
    profilePicture: string;
    //Candidate fields
    firstName: string;
    lastName: string;
    //Company fields
    companyName: string;
    sector: string;
    ruc: string;
    isVerified: boolean;
    //Validation
    isComplete: boolean;
    //Traceability
    createdAt: Date;
    updatedAt: Date;
}
export interface UpdateCompanyProfileRequest {
    //Shared Data
    description: string;
    ubigeo: string;
    profilePicture: string;
    skills: Array<string>;
    //Candidate Data
    companyName: string;
    sector: string;
}
export interface CreateCandidateProfileRequest {
    //Shared Data
    description: string;
    ubigeo: string;
    profilePicture: string;
    skills: Array<string>;
    //Candidate Data
    firstName: string;
    lastName: string;
    dni: string;
}
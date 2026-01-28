export class JobResponse {
    id: string;
    companyId: string;
    description: string;
    creationDate: Date;
    isActive: boolean;

    constructor(
        id: string,
        companyId: string,
        description: string,
        creationDate: Date,
        isActive: boolean
    ){
        this.id = id;
        this.companyId = companyId;
        this.description = description;
        this.creationDate = creationDate;
        this.isActive = isActive;
    }
}
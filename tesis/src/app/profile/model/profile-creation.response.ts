export class ProfileCreationResponse {
    profileId: string;
    confirmationMessage: string;
    constructor(profileId: string, confirmationMessage: string){
        this.profileId = profileId;
        this.confirmationMessage = confirmationMessage;
    }
}
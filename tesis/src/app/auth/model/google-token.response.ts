export class GoogleTokenResponse {
    accessToken: string;
    idToken: string;
    expiresIn: number;
    tokenType: string;
    refreshToken: string;

    constructor(
        accessToken: string,
        idToken: string,
        expiresIn: number,
        tokenType: string,
        refreshToken: string
    ) {
        this.accessToken = accessToken;
        this.idToken = idToken;
        this.expiresIn = expiresIn;
        this.tokenType = tokenType;
        this.refreshToken = refreshToken;
    }
}

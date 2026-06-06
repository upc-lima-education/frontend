import { UserResponse } from "../user.response";

export class SignInResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: UserResponse;

    constructor(
        accessToken: string,
        refreshToken: string,
        expiresIn: number,
        user: UserResponse
    ) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.user = user;
    }
}
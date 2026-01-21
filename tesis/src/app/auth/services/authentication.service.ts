import http from "@/app/shared/services/base.service";
import { SignUpResponse } from "../model/sign-up/sign-up.response";
import type { SignUpRequest } from "../model/sign-up/sign-up.request";
import type { SignInRequest } from "../model/sign-in/sign-in.request";
import { SignInResponse } from "../model/sign-in/sign-in.response";

export class AuthenticationService {
    endpoint: string = "/authentication";
    async signUp(signUpRequest: SignUpRequest): Promise<SignUpResponse>{
        const response = await http.post(`${this.endpoint}/sign-up`, signUpRequest);
        return new SignUpResponse(
          response.data.id,
          response.data.email,
          response.data.type
        );
    }

    async signIn(signInRequest: SignInRequest):Promise<SignInResponse>{
        const response = await http.post(`${this.endpoint}/sign-in`, signInRequest);
        return new SignInResponse(
          response.data.id,
          response.data.email,
          response.data.token
        );
    }
}
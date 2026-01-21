import http from "@/app/shared/services/base.service";

export class profileService {
    endpoint = '/profile';

    async getProfileByUserId(userId: string){
        return http.get(`${this.endpoint}/${userId}`);
    }

    //To define
    async updateProfileDataByUserId(userId: string){
        return http.put(`${this.endpoint}/${userId}`);
    }
}
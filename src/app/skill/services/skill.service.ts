import http from '@/app/shared/services/base.service';
import type { SkillResponse } from '../model/skill.response';

export class SkillService {
    async getAll(): Promise<SkillResponse[]> {
        const { data } = await http.get<SkillResponse[]>('/skill');
        return Array.isArray(data) ? data : [];
    }
}

export const skillService = new SkillService();

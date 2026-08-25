import { computed, onMounted, ref } from 'vue';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { profileService } from '@/app/profile/services/profile.service';
import { JobService } from '@/app/job/services/job.service';
import { RecommendationService, type RecommendationResponse } from '@/app/job/services/recommendation.service';
import type { GetJobByIdResponse } from '@/app/job/model/get-job-by-id.response';
import { recruitmentService } from '@/app/recruitment/services/recruitment.service';
import { ApplicationStatus } from '@/app/recruitment/enums/application-status.enum';

type ProfileSnapshot = {
    profilePicture?: string;
    description?: string;
    isVerified?: boolean;
    keywords?: string[];
    district?: string;
    sector?: string;
    companyName?: string;
};

export function useHomePage() {
    const authStore = useAuthenticationStore();
    const jobService = new JobService();
    const recommendationService = new RecommendationService();

    const loading = ref(true);
    const error = ref('');
    const profile = ref<ProfileSnapshot | null>(null);
    const jobs = ref<GetJobByIdResponse[]>([]);
    const recommendations = ref<RecommendationResponse[]>([]);
    const applicationsCount = ref(0);

    const userDisplayName = computed(() => {
        const user = authStore.currentUser;
        if (!user) return 'Usuario';
        const full = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        if (full) return full;
        if (user.companyName) return user.companyName;
        return user.email || 'Usuario';
    });

    const profileCompletion = computed(() => {
        if (!profile.value) return 0;
        const user = authStore.currentUser;
        const checks = [
            Boolean(profile.value.profilePicture || user?.picture),
            Boolean(profile.value.isVerified),
            Boolean(user?.firstName && user?.lastName || user?.companyName),
            Boolean(profile.value.district || profile.value.sector),
            Boolean(profile.value.description && profile.value.description.length >= 10),
        ];
        return Math.round((checks.filter(Boolean).length / checks.length) * 100);
    });

    const recommendedOpportunities = computed(() => recommendations.value
        .map((recommendation) => jobs.value.find((job) =>
            (job.sourceUrl && job.sourceUrl === recommendation.source_url) || job.id === recommendation.source_url
        ))
        .filter((job): job is GetJobByIdResponse => Boolean(job)));
    const opportunities = computed(() => {
        const ordered = [...recommendedOpportunities.value, ...jobs.value.filter((job) => !recommendedOpportunities.value.includes(job))];
        return ordered.slice(0, 2);
    });
    const jobCount = computed(() => jobs.value.length);
    const activeApplicationsCount = computed(() => applicationsCount.value);
    const hasRecommendations = computed(() => recommendedOpportunities.value.length > 0);
    const nextStepTitle = computed(() => profileCompletion.value < 100 ? 'Completa tu experiencia' : 'Explora nuevas oportunidades');
    const nextStepDescription = computed(() => profileCompletion.value < 100
        ? 'Agregar más información a tu perfil puede mejorar tus coincidencias.'
        : 'Tu perfil está listo. Revisa las oportunidades que mejor encajan contigo.');

    function locationFor(job: GetJobByIdResponse): string {
        return job.address || (job.ubigeo ? job.ubigeo : 'Ubicación no especificada');
    }

    function salaryFor(job: GetJobByIdResponse): string {
        if (!job.minSalary && !job.maxSalary) return 'Salario no especificado';
        const symbol = job.currency === 'PEN' ? 'S/' : (job.currency || '$');
        if (job.minSalary && job.maxSalary && job.minSalary !== job.maxSalary) {
            return `${symbol} ${job.minSalary} – ${symbol} ${job.maxSalary}`;
        }
        return `${symbol} ${job.minSalary || job.maxSalary}`;
    }

    async function loadDashboard() {
        loading.value = true;
        error.value = '';

        const userId = authStore.currentUserId;
        const [jobsResult, profileResult, recommendationsResult, applicationsResult] = await Promise.allSettled([
            jobService.listJobs(),
            userId ? profileService.getProfileByUserId(userId) : Promise.resolve(null),
            recommendationService.getGeneralRecommendations([], 3),
            userId ? recruitmentService.getCandidateApplications(userId) : Promise.resolve([]),
        ]);

        if (jobsResult.status === 'fulfilled') jobs.value = jobsResult.value as GetJobByIdResponse[];

        if (profileResult.status === 'fulfilled' && profileResult.value) {
            const response = profileResult.value as { data?: { data?: ProfileSnapshot } | ProfileSnapshot };
            const payload = response.data;
            profile.value = payload && typeof payload === 'object' && 'data' in payload
                ? payload.data || null
                : (payload as ProfileSnapshot | undefined) || null;
        }

        if (recommendationsResult.status === 'fulfilled') recommendations.value = recommendationsResult.value as RecommendationResponse[];
        if (applicationsResult.status === 'fulfilled') {
            applicationsCount.value = (applicationsResult.value as Array<{ status: ApplicationStatus }>).filter((application) =>
                application.status === ApplicationStatus.Applied || application.status === ApplicationStatus.Approved
            ).length;
        }

        if (jobsResult.status === 'rejected' && !hasRecommendations.value) {
            error.value = 'No se pudieron cargar las oportunidades.';
        }
        loading.value = false;
    }

    onMounted(loadDashboard);

    return {
        userDisplayName,
        loading,
        error,
        profileCompletion,
        opportunities,
        jobCount,
        activeApplicationsCount,
        recommendations,
        hasRecommendations,
        nextStepTitle,
        nextStepDescription,
        locationFor,
        salaryFor,
        reload: loadDashboard,
    };
}

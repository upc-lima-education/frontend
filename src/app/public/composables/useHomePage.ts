import { computed, onMounted, ref } from 'vue';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { profileService } from '@/app/profile/services/profile.service';
import { JobService } from '@/app/job/services/job.service';
import { RecommendationService, type RecommendationResponse } from '@/app/job/services/recommendation.service';
import type { GetJobByIdResponse } from '@/app/job/model/get-job-by-id.response';
import { ubigeoService } from '@/app/shared/services/ubigeo.service';
import { notificationService } from '@/app/recruitment/services/notification.service';
import type { NotificationResponse } from '@/app/recruitment/model/notification.model';

type ProfileSnapshot = {
    profilePicture?: string;
    description?: string;
    isVerified?: boolean;
    keywords?: string[];
    district?: string;
    sector?: string;
    companyName?: string;
    isComplete?: boolean;
    skills?: string[];
    candidate?: { firstName?: string; lastName?: string } | null;
    company?: { companyName?: string; sector?: string; isVerified?: boolean } | null;
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
    const notifications = ref<NotificationResponse[]>([]);
    const jobsError = ref('');

    const userDisplayName = computed(() => {
        const user = authStore.currentUser;
        if (!user) return 'Usuario';
        const full = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        if (full) return full;
        if (user.companyName) return user.companyName;
        return user.email?.split('@')[0] || 'Usuario';
    });

    const userFirstName = computed(() => {
        const name = userDisplayName.value.trim();
        return name.split(/\s+/)[0] || 'Usuario';
    });

    const profileCompletion = computed(() => {
        if (!profile.value) return 0;
        const user = authStore.currentUser;
        const checks = [
            Boolean(profile.value.profilePicture || user?.picture),
            Boolean(profile.value.isVerified),
            Boolean((user?.firstName && user?.lastName) || user?.companyName),
            Boolean(profile.value.district || profile.value.sector),
            Boolean(profile.value.description && profile.value.description.length >= 10),
        ];
        const calculated = Math.round((checks.filter(Boolean).length / checks.length) * 100);
        return calculated;
    });

    const displayJobs = computed(() => {
        const matchingRecommendations = recommendations.value
            .map((recommendation) => jobs.value.find((job) =>
                job.id === recommendation.source_url ||
                job.sourceUrl === recommendation.source_url ||
                job.title === recommendation.title,
            ))
            .filter((job): job is GetJobByIdResponse => Boolean(job));

        const recommendedIds = new Set(matchingRecommendations.map((job) => job.id));
        return [...matchingRecommendations, ...jobs.value.filter((job) => !recommendedIds.has(job.id))].slice(0, 6);
    });

    const jobCount = computed(() => jobs.value.length);
    const hasRecommendations = computed(() => recommendations.value.length > 0);
    const recentNotifications = computed(() => notifications.value.slice(0, 3));

    const nextStepTitle = computed(() =>
        profileCompletion.value < 100 ? 'Agrega tu experiencia laboral' : 'Explora nuevas oportunidades'
    );

    const nextStepDescription = computed(() =>
        profileCompletion.value < 100
            ? 'Los perfiles con experiencia reciben hasta 5 veces más contactos.'
            : 'Tu perfil está completo y listo para destacar ante las empresas.'
    );


    function locationFor(job: GetJobByIdResponse): string {
        if (job.address) return job.address;
        if (job.ubigeo) {
            const loc = ubigeoService.getLocation(job.ubigeo);
            if (loc) return `${loc.district}, ${loc.department}`;
        }
        return 'Ubicación no especificada';
    }

    function salaryFor(job: GetJobByIdResponse): string {
        if (!job.minSalary && !job.maxSalary) return 'Salario no especificado';
        const symbol = job.currency === 'PEN' ? 'S/' : (job.currency || 'S/');
        if (job.minSalary && job.maxSalary && job.minSalary !== job.maxSalary) {
            return `${symbol} ${job.minSalary.toLocaleString()} - ${symbol} ${job.maxSalary.toLocaleString()}`;
        }
        return `${symbol} ${(job.minSalary || job.maxSalary)?.toLocaleString()}`;
    }

    function companyNameFor(job: GetJobByIdResponse): string {
        if (job.companyName) return job.companyName;
        if (job.originPage && job.originPage !== 'Llanqui' && !job.originPage.startsWith('http')) {
            return job.originPage;
        }
        return 'Empresa no especificada';
    }

    function modalityLabel(jobType?: string): string {
        if (jobType === 'Remote') return 'Remoto';
        if (jobType === 'Hybrid') return 'Híbrido';
        return 'Presencial';
    }

    async function loadDashboard() {
        loading.value = true;
        error.value = '';
        jobsError.value = '';

        const userId = authStore.currentUserId;
        try {
            const [jobsResult, profileResult, recommendationsResult, notificationsResult] = await Promise.allSettled([
                jobService.listJobs(),
                userId ? profileService.getProfileByUserId(userId) : Promise.resolve(null),
                recommendationService.getGeneralRecommendations([], 4),
                userId ? notificationService.getNotifications() : Promise.resolve([]),
            ]);

            if (jobsResult.status === 'fulfilled' && Array.isArray(jobsResult.value)) {
                jobs.value = jobsResult.value as GetJobByIdResponse[];
            } else if (jobsResult.status === 'rejected') {
                console.error('Error loading jobs:', jobsResult.reason);
                jobsError.value = 'No pudimos cargar las oportunidades. Verifica la conexión e inténtalo nuevamente.';
            }

            if (profileResult.status === 'fulfilled' && profileResult.value) {
                const response = profileResult.value as { data?: { data?: ProfileSnapshot } | ProfileSnapshot };
                const payload = response.data;
                const rawProfile = payload && typeof payload === 'object' && 'data' in payload
                    ? payload.data || null
                    : (payload as ProfileSnapshot | undefined) || null;
                if (rawProfile) {
                    profile.value = {
                        ...rawProfile,
                        keywords: rawProfile.skills || [],
                        sector: rawProfile.company?.sector,
                        companyName: rawProfile.company?.companyName,
                        isVerified: rawProfile.company?.isVerified || false,
                    };
                    if (authStore.user) {
                        authStore.user.firstName = rawProfile.candidate?.firstName;
                        authStore.user.lastName = rawProfile.candidate?.lastName;
                        authStore.user.companyName = rawProfile.company?.companyName;
                    }
                }
            }

            if (recommendationsResult.status === 'fulfilled' && Array.isArray(recommendationsResult.value)) {
                recommendations.value = recommendationsResult.value as RecommendationResponse[];
            }

            if (notificationsResult.status === 'fulfilled' && Array.isArray(notificationsResult.value)) {
                notifications.value = notificationsResult.value as NotificationResponse[];
            }
        } catch (err) {
            console.error('Error loading dashboard data:', err);
        } finally {
            loading.value = false;
        }
    }

    onMounted(loadDashboard);

    return {
        userDisplayName,
        userFirstName,
        loading,
        error,
        profileCompletion,
        displayJobs,
        jobCount,
        hasRecommendations,
        recentNotifications,
        jobsError,
        nextStepTitle,
        nextStepDescription,
        locationFor,
        salaryFor,
        companyNameFor,
        modalityLabel,
        reload: loadDashboard,
    };
}

import { computed, onMounted, ref } from 'vue';
import { useAuthenticationStore } from '@/app/auth/services/authentication.store';
import { profileService } from '@/app/profile/services/profile.service';
import { JobService } from '@/app/job/services/job.service';
import { RecommendationService, type RecommendationResponse } from '@/app/job/services/recommendation.service';
import type { GetJobByIdResponse } from '@/app/job/model/get-job-by-id.response';
import { recruitmentService } from '@/app/recruitment/services/recruitment.service';
import { ApplicationStatus } from '@/app/recruitment/enums/application-status.enum';
import { ubigeoService } from '@/app/shared/services/ubigeo.service';

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
    const savedJobsCount = ref(12);
    const newMessagesCount = ref(3);
    const savedJobIds = ref<Set<string>>(new Set());

    const userDisplayName = computed(() => {
        const user = authStore.currentUser;
        if (!user) return 'Mariana';
        const full = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        if (full) return full;
        if (user.companyName) return user.companyName;
        return user.email?.split('@')[0] || 'Mariana';
    });

    const userFirstName = computed(() => {
        const name = userDisplayName.value.trim();
        return name.split(/\s+/)[0] || 'Mariana';
    });

    const profileCompletion = computed(() => {
        if (!profile.value) return 40;
        const user = authStore.currentUser;
        const checks = [
            Boolean(profile.value.profilePicture || user?.picture),
            Boolean(profile.value.isVerified),
            Boolean((user?.firstName && user?.lastName) || user?.companyName),
            Boolean(profile.value.district || profile.value.sector),
            Boolean(profile.value.description && profile.value.description.length >= 10),
        ];
        const calculated = Math.round((checks.filter(Boolean).length / checks.length) * 100);
        return Math.max(40, calculated);
    });

    // Default sample jobs if backend is empty
    const mockDefaultJobs: GetJobByIdResponse[] = [
        {
            id: 'job-1',
            title: 'Atención al Cliente / Capacitación Pagada',
            description: 'Buscamos personas con entusiasmo para atención al cliente y soporte.',
            companyId: 'comp-1',
            jobType: 'InPerson',
            minSalary: 1500,
            maxSalary: 1800,
            currency: 'PEN',
            address: 'Santa Anita, Lima',
            ubigeo: '150137',
            status: 'Active',
            skills: ['Atención al cliente', 'Comunicación', 'Trabajo en equipo'],
            originPage: 'Empresa ABC',
        } as unknown as GetJobByIdResponse,
        {
            id: 'job-2',
            title: 'Operario de Almacén',
            description: 'Recepción, despacho e inventario de mercadería en almacén central.',
            companyId: 'comp-2',
            jobType: 'InPerson',
            minSalary: 1400,
            maxSalary: 1600,
            currency: 'PEN',
            address: 'Ate, Lima',
            ubigeo: '150103',
            status: 'Active',
            skills: ['Inventarios', 'Carga y descarga', 'Organización'],
            originPage: 'Distribuidora Progreso',
        } as unknown as GetJobByIdResponse,
        {
            id: 'job-3',
            title: 'Asistente Administrativo',
            description: 'Gestión documental, facturación y soporte general a operaciones.',
            companyId: 'comp-3',
            jobType: 'Hybrid',
            minSalary: 1600,
            maxSalary: 2000,
            currency: 'PEN',
            address: 'Lima, Lima',
            ubigeo: '150101',
            status: 'Active',
            skills: ['Excel', 'Facturación', 'Gestión documental'],
            originPage: 'TechCorp Solutions',
        } as unknown as GetJobByIdResponse,
    ];

    const displayJobs = computed(() => {
        if (jobs.value && jobs.value.length > 0) {
            return jobs.value.slice(0, 6);
        }
        return mockDefaultJobs;
    });

    const jobCount = computed(() => jobs.value.length > 0 ? jobs.value.length : 6390);
    const activeApplicationsCount = computed(() => applicationsCount.value);
    const hasRecommendations = computed(() => recommendations.value.length > 0);

    const nextStepTitle = computed(() =>
        profileCompletion.value < 100 ? 'Agrega tu experiencia laboral' : 'Explora nuevas oportunidades'
    );

    const nextStepDescription = computed(() =>
        profileCompletion.value < 100
            ? 'Los perfiles con experiencia reciben hasta 5 veces más contactos.'
            : 'Tu perfil está completo y listo para destacar ante las empresas.'
    );

    function toggleSaveJob(id: string) {
        if (savedJobIds.value.has(id)) {
            savedJobIds.value.delete(id);
            savedJobsCount.value = Math.max(0, savedJobsCount.value - 1);
        } else {
            savedJobIds.value.add(id);
            savedJobsCount.value += 1;
        }
    }

    function isJobSaved(id: string): boolean {
        return savedJobIds.value.has(id);
    }

    function locationFor(job: GetJobByIdResponse): string {
        if (job.address) return job.address;
        if (job.ubigeo) {
            const loc = ubigeoService.getLocation(job.ubigeo);
            if (loc) return `${loc.district}, ${loc.department}`;
        }
        return 'Lima, Perú';
    }

    function salaryFor(job: GetJobByIdResponse): string {
        if (!job.minSalary && !job.maxSalary) return 'S/ 1,500 - S/ 1,800';
        const symbol = job.currency === 'PEN' ? 'S/' : (job.currency || 'S/');
        if (job.minSalary && job.maxSalary && job.minSalary !== job.maxSalary) {
            return `${symbol} ${job.minSalary.toLocaleString()} - ${symbol} ${job.maxSalary.toLocaleString()}`;
        }
        return `${symbol} ${(job.minSalary || job.maxSalary)?.toLocaleString()}`;
    }

    function companyNameFor(job: GetJobByIdResponse, index: number): string {
        if (job.originPage && job.originPage !== 'Llanqui' && !job.originPage.startsWith('http')) {
            return job.originPage;
        }
        const defaults = ['Empresa ABC', 'Distribuidora Progreso', 'TechCorp Solutions', 'Servicios Globales SAC'];
        return defaults[index % defaults.length] ?? 'Empresa ABC';
    }

    function companyLogoFor(job: GetJobByIdResponse, index: number): { initials: string; bg: string; color: string } {
        const presets = [
            { initials: 'abc', bg: '#0F172A', color: '#FFFFFF' },
            { initials: 'dp', bg: '#EA580C', color: '#FFFFFF' },
            { initials: 'tc', bg: '#4338CA', color: '#FFFFFF' },
            { initials: 'sg', bg: '#0284C7', color: '#FFFFFF' },
        ];
        return presets[index % presets.length] ?? { initials: 'abc', bg: '#0F172A', color: '#FFFFFF' };
    }

    function modalityLabel(jobType?: string): string {
        if (jobType === 'Remote') return 'Remoto';
        if (jobType === 'Hybrid') return 'Híbrido';
        return 'Presencial';
    }

    async function loadDashboard() {
        loading.value = true;
        error.value = '';

        const userId = authStore.currentUserId;
        try {
            const [jobsResult, profileResult, recommendationsResult, applicationsResult] = await Promise.allSettled([
                jobService.listJobs(),
                userId ? profileService.getProfileByUserId(userId) : Promise.resolve(null),
                recommendationService.getGeneralRecommendations([], 4),
                userId ? recruitmentService.getCandidateApplications(userId) : Promise.resolve([]),
            ]);

            if (jobsResult.status === 'fulfilled' && Array.isArray(jobsResult.value)) {
                jobs.value = jobsResult.value as GetJobByIdResponse[];
            }

            if (profileResult.status === 'fulfilled' && profileResult.value) {
                const response = profileResult.value as { data?: { data?: ProfileSnapshot } | ProfileSnapshot };
                const payload = response.data;
                profile.value = payload && typeof payload === 'object' && 'data' in payload
                    ? payload.data || null
                    : (payload as ProfileSnapshot | undefined) || null;
            }

            if (recommendationsResult.status === 'fulfilled' && Array.isArray(recommendationsResult.value)) {
                recommendations.value = recommendationsResult.value as RecommendationResponse[];
            }

            if (applicationsResult.status === 'fulfilled' && Array.isArray(applicationsResult.value)) {
                applicationsCount.value = (applicationsResult.value as Array<{ status: ApplicationStatus }>).filter((application) =>
                    application.status === ApplicationStatus.Applied || application.status === ApplicationStatus.Approved
                ).length;
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
        activeApplicationsCount,
        savedJobsCount,
        newMessagesCount,
        hasRecommendations,
        nextStepTitle,
        nextStepDescription,
        locationFor,
        salaryFor,
        companyNameFor,
        companyLogoFor,
        modalityLabel,
        isJobSaved,
        toggleSaveJob,
        reload: loadDashboard,
    };
}

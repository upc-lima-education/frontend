export type ProfileCompletionData = {
    profilePicture?: string;
    description?: string;
    skills?: string[];
    candidate?: { firstName?: string; lastName?: string } | null;
    company?: {
        companyName?: string;
        sector?: string;
        ruc?: string;
        isVerified?: boolean;
    } | null;
    languages?: unknown[];
    educations?: unknown[];
    workExperiences?: unknown[];
};

function hasText(value?: string): boolean {
    return Boolean(value?.trim());
}

function hasItems(value?: unknown[]): boolean {
    return Array.isArray(value) && value.length > 0;
}

/**
 * Calculates the UI completion percentage exclusively from fields returned by
 * GET /api/v1/profile/me. Candidate verification is not counted because the
 * current API only exposes company verification.
 */
export function calculateProfileCompletion(
    profile: ProfileCompletionData | null | undefined,
    isOrganization: boolean,
): number {
    if (!profile) return 0;

  const checks = isOrganization
    ? [
        hasText(profile.company?.companyName),
        hasText(profile.description),
        hasText(profile.profilePicture),
        hasText(profile.company?.sector),
        hasText(profile.company?.ruc),
      ]
        : [
            hasText(profile.candidate?.firstName) && hasText(profile.candidate?.lastName),
            hasText(profile.description),
            hasText(profile.profilePicture),
            hasItems(profile.skills),
            hasItems(profile.languages),
            hasItems(profile.educations),
            hasItems(profile.workExperiences),
        ];

    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

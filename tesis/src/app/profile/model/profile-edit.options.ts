/** Static select options for profile edit forms (model / configuration). */

export const DISTRICT_OPTIONS = [
    'Miraflores',
    'San Isidro',
    'Santiago de Surco',
    'La Molina',
    'Jesús María',
    'Lince',
    'Barranco',
    'Surquillo',
    'San Borja',
    'Pueblo Libre',
    'Magdalena',
    'Los Olivos',
    'San Miguel',
    'Breña',
    'Cercado de Lima',
] as const;

export const PROFESSION_OPTIONS = [
    'Ingeniería de software',
    'Diseño UX / UI',
    'Marketing digital',
    'Recursos humanos',
    'Ventas y negocios',
    'Administración',
    'Contabilidad / Finanzas',
    'Salud',
    'Educación',
    'Otro',
] as const;

export const INDUSTRY_OPTIONS = [
    'Tecnología',
    'Finanzas',
    'Salud',
    'Educación',
    'Retail',
    'Manufactura',
    'Servicios',
    'Construcción',
    'Otro',
] as const;

export const COMPANY_SIZE_OPTIONS = [
    { value: '1-10', label: '1 – 10' },
    { value: '11-50', label: '11 – 50' },
    { value: '51-200', label: '51 – 200' },
    { value: '201-500', label: '201 – 500' },
    { value: '501+', label: '501+' },
] as const;

export const PROFILE_BIO_MAX_LENGTH = 500;

import ubigeoData from '@/app/shared/data/ubigeo.json';

/** Nombres coloquiales que no coinciden literalmente con `sDistrito` en el catálogo. */
const DISTRICT_ALIASES: Record<string, string> = {
    'CERCADO DE LIMA': 'LIMA',
};

function normalize(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toUpperCase()
        .trim();
}

/**
 * Resuelve el código de ubigeo (departamento+provincia+distrito) de un
 * distrito de Lima a partir de su nombre. El formulario de perfil de
 * candidato solo captura el nombre del distrito (sin departamento/provincia
 * como en la publicación de empleos), así que se asume Lima/Lima, que es
 * donde vive `DISTRICT_OPTIONS`.
 */
export function districtNameToUbigeo(districtName: string): string {
    const normalized = normalize(districtName);
    const target = DISTRICT_ALIASES[normalized] ?? normalized;
    const match = ubigeoData.find(
        (item) => item.sDepartamento === 'LIMA' && item.sProvincia === 'LIMA' && item.sDistrito === target
    );
    return match?.sIdUbigeo ?? '';
}

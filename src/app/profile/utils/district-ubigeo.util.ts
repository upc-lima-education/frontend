/**
 * Resuelve el código de ubigeo (departamento+provincia+distrito) de un
 * distrito de Lima a partir de su nombre.
 *
 * El formulario de perfil de candidato solo captura el nombre del distrito
 * (sin departamento/provincia como en la publicación de empleos), asumiendo Lima/Lima
 * donde residen las opciones de `DISTRICT_OPTIONS`.
 *
 * Optimización de rendimiento: se utiliza un mapa estático indexado de distritos
 * de Lima en lugar de importar todo el catálogo nacional de ubigeo (311 KiB),
 * lo que evita bloquear la carga inicial y el bundle de edición de perfil.
 */

const LIMA_DISTRICT_UBIGEO_MAP: Record<string, string> = {
  'LIMA': '140101',
  'CERCADO DE LIMA': '140101',
  'ANCON': '140102',
  'ATE': '140103',
  'BRENA': '140104',
  'CARABAYLLO': '140105',
  'COMAS': '140106',
  'CHACLACAYO': '140107',
  'CHORRILLOS': '140108',
  'LA VICTORIA': '140109',
  'LA MOLINA': '140110',
  'LINCE': '140111',
  'LURIGANCHO': '140112',
  'CHOSICA': '140112',
  'LURIN': '140113',
  'MAGDALENA': '140114',
  'MAGDALENA DEL MAR': '140114',
  'MIRAFLORES': '140115',
  'PACHACAMAC': '140116',
  'PUEBLO LIBRE': '140117',
  'PUCUSANA': '140118',
  'PUENTE PIEDRA': '140119',
  'PUNTA HERMOSA': '140120',
  'PUNTA NEGRA': '140121',
  'RIMAC': '140122',
  'SAN BARTOLO': '140123',
  'SAN ISIDRO': '140124',
  'BARRANCO': '140125',
  'SAN MARTIN DE PORRES': '140126',
  'SMP': '140126',
  'SAN MIGUEL': '140127',
  'SANTA MARIA DEL MAR': '140128',
  'SANTA ROSA': '140129',
  'SANTIAGO DE SURCO': '140130',
  'SURCO': '140130',
  'SURQUILLO': '140131',
  'VILLA MARIA DEL TRIUNFO': '140132',
  'VMT': '140132',
  'JESUS MARIA': '140133',
  'INDEPENDENCIA': '140134',
  'EL AGUSTINO': '140135',
  'SAN JUAN DE MIRAFLORES': '140136',
  'SJM': '140136',
  'SAN JUAN DE LURIGANCHO': '140137',
  'SJL': '140137',
  'SAN LUIS': '140138',
  'CIENEGUILLA': '140139',
  'SAN BORJA': '140140',
  'VILLA EL SALVADOR': '140141',
  'VES': '140141',
  'LOS OLIVOS': '140142',
  'SANTA ANITA': '140143',
};

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

export function districtNameToUbigeo(districtName: string): string {
  if (!districtName) return '';
  const normalized = normalize(districtName);
  return LIMA_DISTRICT_UBIGEO_MAP[normalized] ?? '';
}

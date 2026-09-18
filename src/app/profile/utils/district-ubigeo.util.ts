/**
 * Resuelve el código de ubigeo (departamento+provincia+distrito) de un
 * distrito de Lima a partir de su nombre.
 *
 * El formulario de perfil de candidato solo captura el nombre del distrito
 * (sin departamento/provincia como en la publicación de empleos), asumiendo Lima/Lima
 * donde residen las opciones de `DISTRICT_OPTIONS`.
 *
 * Catálogo alineado con el backend (.NET 8): Lima = 15, Lima Metropolitana = 1501xx.
 */

const LIMA_DISTRICT_UBIGEO_MAP: Record<string, string> = {
  'LIMA': '150101',
  'CERCADO DE LIMA': '150101',
  'ANCON': '150102',
  'ATE': '150103',
  'BARRANCO': '150104',
  'BRENA': '150105',
  'BREÑA': '150105',
  'CARABAYLLO': '150106',
  'CHACLACAYO': '150107',
  'CHORRILLOS': '150108',
  'CIENEGUILLA': '150109',
  'COMAS': '150110',
  'EL AGUSTINO': '150111',
  'INDEPENDENCIA': '150112',
  'JESUS MARIA': '150113',
  'LA MOLINA': '150114',
  'LA VICTORIA': '150115',
  'LINCE': '150116',
  'LOS OLIVOS': '150117',
  'LURIGANCHO': '150118',
  'CHOSICA': '150118',
  'LURIGANCHO (CHOSICA)': '150118',
  'LURIGANCHO CHOSICA': '150118',
  'LURIN': '150119',
  'MAGDALENA': '150120',
  'MAGDALENA DEL MAR': '150120',
  'PUEBLO LIBRE': '150121',
  'MIRAFLORES': '150122',
  'PACHACAMAC': '150123',
  'PUCUSANA': '150124',
  'PUENTE PIEDRA': '150125',
  'PUNTA HERMOSA': '150126',
  'PUNTA NEGRA': '150127',
  'RIMAC': '150128',
  'SAN BARTOLO': '150129',
  'SAN BORJA': '150130',
  'SAN ISIDRO': '150131',
  'SAN JUAN DE LURIGANCHO': '150132',
  'SJL': '150132',
  'SAN JUAN DE MIRAFLORES': '150133',
  'SJM': '150133',
  'SAN LUIS': '150134',
  'SAN MARTIN DE PORRES': '150135',
  'SMP': '150135',
  'SAN MIGUEL': '150136',
  'SANTA ANITA': '150137',
  'SANTA MARIA DEL MAR': '150138',
  'SANTA ROSA': '150139',
  'SANTIAGO DE SURCO': '150140',
  'SURCO': '150140',
  'SURQUILLO': '150141',
  'VILLA EL SALVADOR': '150142',
  'VES': '150142',
  'VILLA MARIA DEL TRIUNFO': '150143',
  'VMT': '150143',
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

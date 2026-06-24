import { SignUpUserOrganizationRequest } from '../model/organization-profile.request';

/**
 * Data de prueba para crear perfiles de organización / empresa.
 * Empresas peruanas realistas que reflejan la audiencia de Llanqui:
 * no solo tecnología, también comercio, restaurantes, construcción,
 * logística y salud (empleadores de trabajadores operativos).
 *
 * RUC: 11 dígitos, empieza en "20" (persona jurídica).
 * Distritos y sectores reales de Lima, Perú.
 *
 * Uso:
 *   import { mockOrganizationProfiles } from '@/app/profile/mock/organization-profiles.mock';
 *   await profileService.createOrganizationProfile(mockOrganizationProfiles[0]);
 */
export const mockOrganizationProfiles: SignUpUserOrganizationRequest[] = [
  new SignUpUserOrganizationRequest(
    'Minimarket Santa Rosa SAC',
    'contacto@santarosa.pe',
    'Empresa2026*',
    'Cadena de minimarkets de barrio en Lima Sur. Buscamos personal de atención, reposición y caja para nuestras tiendas.',
    ['Comercio', 'Atención al cliente', 'Caja', 'Reposición'],
    '20546789012',
    true,
    'Miraflores',
    'Comercio',
  ),
  new SignUpUserOrganizationRequest(
    'Restaurante Don Pepe EIRL',
    'rrhh@donpepe.pe',
    'Empresa2026*',
    'Restaurante de comida criolla con tres locales en Lima. Contratamos meseros, cocineros, ayudantes de cocina y personal de limpieza.',
    ['Restaurantes', 'Cocina', 'Mesero', 'Atención'],
    '20601234567',
    false,
    'San Isidro',
    'Restaurantes',
  ),
  new SignUpUserOrganizationRequest(
    'Constructora Andina del Perú SAC',
    'reclutamiento@constructoraandina.pe',
    'Empresa2026*',
    'Constructora con 15 años de experiencia en obras civiles y edificaciones. Requerimos operarios, maestros de obra, electricistas y gasfiteros.',
    ['Construcción', 'Obra', 'Operario', 'Electricista'],
    '20512345678',
    true,
    'Surco',
    'Construcción',
  ),
  new SignUpUserOrganizationRequest(
    'Almacenes Logística Express SAC',
    'empleo@logisticaexpress.pe',
    'Empresa2026*',
    'Operador logístico que mueve carga a nivel nacional. Buscamos conductores, almaceneros, montacarguistas y personal de despacho.',
    ['Logística', 'Almacén', 'Conductor', 'Despacho'],
    '20498765432',
    false,
    'Ate',
    'Logística',
  ),
  new SignUpUserOrganizationRequest(
    'Tech Solutions Perú SAC',
    'talento@techsolutions.pe',
    'Empresa2026*',
    'Empresa de desarrollo de software corporativo y soluciones en la nube. Buscamos desarrolladores, soporte técnico y analistas.',
    ['Tecnología', 'Software', 'Soporte', 'Cloud'],
    '20776655441',
    true,
    'San Borja',
    'Tecnología',
  ),
];

/**
 * Perfil único por defecto para pruebas rápidas (llenar formulario, etc.).
 */
export const mockOrganizationProfile = mockOrganizationProfiles[0];

import ubigeoData from '../data/ubigeo.json';

/**
 * Catálogo de ubigeo (departamento/provincia/distrito) del Perú, embebido
 * como JSON estático. Intencional, no deuda técnica: el backend no expone
 * (ni necesita exponer) un endpoint para esta data de referencia.
 */
type UbigeoItem = {
  sIdUbigeo: string;
  sDepartamento: string;
  sProvincia: string;
  sDistrito: string;
};

class UbigeoService {

  private map: Record<string, UbigeoItem> = {};

  constructor() {
    ubigeoData.forEach((item: UbigeoItem) => {
      this.map[item.sIdUbigeo] = item;
    });
  }

  getLocation(ubigeo: string) {
    const item = this.map[ubigeo];
    if (!item) return null;

    return {
      department: item.sDepartamento,
      district: item.sDistrito
    };
  }
}

export const ubigeoService = new UbigeoService();
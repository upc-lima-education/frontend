import ubigeoData from '../data/ubigeo.json';

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
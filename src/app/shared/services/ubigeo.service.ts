import compactData from '../data/ubigeo.compact.json';

/**
 * Catálogo de ubigeo (departamento/provincia/distrito) del Perú.
 * Optimizado con estructura indexada compacta para mínimo peso de bundle y parsing ultrarrápido.
 */
export type UbigeoItem = {
  sIdUbigeo: string;
  sDepartamento: string;
  sProvincia: string;
  sDistrito: string;
};

class UbigeoService {
  public map: Record<string, UbigeoItem> = {};
  private _all: UbigeoItem[] | null = null;
  private _departments: string[] = compactData.deps;

  constructor() {
    const { deps, provs, dists } = compactData;
    for (let i = 0; i < dists.length; i++) {
      const item = dists[i];
      if (item) {
        const id = item[0] as string;
        const dep = deps[item[1] as number] || '';
        const prov = provs[item[2] as number] || '';
        const dist = item[3] as string;
        this.map[id] = {
          sIdUbigeo: id,
          sDepartamento: dep,
          sProvincia: prov,
          sDistrito: dist,
        };
      }
    }
  }

  getLocation(ubigeo: string) {
    const item = this.map[ubigeo];
    if (!item) return null;

    return {
      department: item.sDepartamento,
      district: item.sDistrito,
    };
  }

  getAll(): UbigeoItem[] {
    if (!this._all) {
      this._all = Object.values(this.map);
    }
    return this._all;
  }

  getDepartments(): string[] {
    return this._departments;
  }

  getProvinces(department: string): string[] {
    if (!department) return [];
    const set = new Set<string>();
    const all = this.getAll();
    for (let i = 0; i < all.length; i++) {
      const item = all[i];
      if (item && item.sDepartamento === department) {
        set.add(item.sProvincia);
      }
    }
    return Array.from(set);
  }

  getDistricts(department: string, province: string): string[] {
    if (!department || !province) return [];
    const list: string[] = [];
    const all = this.getAll();
    for (let i = 0; i < all.length; i++) {
      const item = all[i];
      if (item && item.sDepartamento === department && item.sProvincia === province) {
        list.push(item.sDistrito);
      }
    }
    return list;
  }

  getUbigeoCode(department: string, province: string, district: string): string {
    if (!department || !province || !district) return '';
    const all = this.getAll();
    for (let i = 0; i < all.length; i++) {
      const item = all[i];
      if (
        item &&
        item.sDepartamento === department &&
        item.sProvincia === province &&
        item.sDistrito === district
      ) {
        return item.sIdUbigeo;
      }
    }
    return '';
  }
}

export const ubigeoService = new UbigeoService();
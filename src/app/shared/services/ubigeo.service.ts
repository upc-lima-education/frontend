import compactData from '../data/ubigeo.compact.json';

/**
 * Catálogo de ubigeo (departamento/provincia/distrito) del Perú.
 * Optimizado con estructura indexada compacta para mínimo peso de bundle y parsing ultrarrápido.
 * Alineado exactamente con el catálogo del backend (.NET 8):
 * { Departamento, Provincia, Distrito, Ubigeo }
 */
export type UbigeoItem = {
  // Estructura oficial del backend (.NET 8 / PostgreSQL)
  Departamento: string;
  Provincia: string;
  Distrito: string;
  Ubigeo: string;

  // Aliases para compatibilidad hacia atrás
  sIdUbigeo: string;
  sDepartamento: string;
  sProvincia: string;
  sDistrito: string;
};

export type UbigeoLocation = {
  department: string;
  province: string;
  district: string;
  ubigeo: string;
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
          Ubigeo: id,
          Departamento: dep,
          Provincia: prov,
          Distrito: dist,
          sIdUbigeo: id,
          sDepartamento: dep,
          sProvincia: prov,
          sDistrito: dist,
        };
      }
    }
  }

  getLocation(ubigeo: string): UbigeoLocation | null {
    if (!ubigeo) return null;
    const item = this.map[ubigeo.trim()];
    if (!item) return null;

    return {
      department: item.Departamento,
      province: item.Provincia,
      district: item.Distrito,
      ubigeo: item.Ubigeo,
    };
  }

  getByCode(ubigeo: string): UbigeoItem | null {
    if (!ubigeo) return null;
    return this.map[ubigeo.trim()] ?? null;
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
    const normalizedDep = this.normalize(department);
    const set = new Set<string>();
    const all = this.getAll();
    for (let i = 0; i < all.length; i++) {
      const item = all[i];
      if (item && this.normalize(item.Departamento) === normalizedDep) {
        set.add(item.Provincia);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }

  getDistricts(department: string, province: string): string[] {
    if (!department || !province) return [];
    const normalizedDep = this.normalize(department);
    const normalizedProv = this.normalize(province);
    const list: string[] = [];
    const all = this.getAll();
    for (let i = 0; i < all.length; i++) {
      const item = all[i];
      if (
        item &&
        this.normalize(item.Departamento) === normalizedDep &&
        this.normalize(item.Provincia) === normalizedProv
      ) {
        list.push(item.Distrito);
      }
    }
    return list.sort((a, b) => a.localeCompare(b, 'es'));
  }

  getUbigeoCode(department: string, province: string, district: string): string {
    if (!department || !province || !district) return '';
    const normalizedDep = this.normalize(department);
    const normalizedProv = this.normalize(province);
    const normalizedDist = this.normalize(district);
    const all = this.getAll();
    for (let i = 0; i < all.length; i++) {
      const item = all[i];
      if (
        item &&
        this.normalize(item.Departamento) === normalizedDep &&
        this.normalize(item.Provincia) === normalizedProv &&
        this.normalize(item.Distrito) === normalizedDist
      ) {
        return item.Ubigeo;
      }
    }
    return '';
  }

  private normalize(value: string): string {
    return (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim();
  }
}

export const ubigeoService = new UbigeoService();
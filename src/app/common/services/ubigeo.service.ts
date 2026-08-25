import ubigeoData from '../data/ubigeo.json';

type UbigeoItem = {
	Ubigeo: string;
	Departamento: string;
	Provincia: string;
	Distrito: string;
};

export interface UbigeoLocation {
	department: string;
	district: string;
}

class UbigeoService {

	private map: Record<string, UbigeoItem> = {};

	constructor() {
		ubigeoData.forEach((item: UbigeoItem) => {
			this.map[item.Ubigeo] = item;
		});
	}

	getLocation(ubigeo: string) : UbigeoLocation|null {
		const item = this.map[ubigeo];
		if (!item) return null;

		return {
            department: item.Departamento,
            district: item.Distrito,
        };
	}
}

export const ubigeoService = new UbigeoService();
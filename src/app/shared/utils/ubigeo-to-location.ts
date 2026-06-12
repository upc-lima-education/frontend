import ubigeoData from '@/app/shared/data/ubigeo.json';

export interface UbigeoItem {
    Ubigeo: string;
    Departamento: string;
    Provincia: string;
    Distrito: string;
}

export function ubigeoToLocation(ubigeoCode: string): UbigeoItem | undefined {
    return (ubigeoData as UbigeoItem[]).find(item => item.Ubigeo === ubigeoCode);
}
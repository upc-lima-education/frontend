export class LightJobResponse {
    id: string;
    companyName: string;
    companyImage: string;
    title: string;
    department: string;
    district: string;
    type: string;
    closesAt: string;
    /** Vacante destacada por un impulso pagado (aparece con sello "Recomendado"). */
    featured: boolean;

    constructor(
        id: string,
        companyName: string,
        companyImage: string,
        title: string,
        department: string,
        district: string,
        type: string,
        closesAt: string,
        featured: boolean = false
    ){
        this.id = id;
        this.companyName = companyName;
        this.companyImage = companyImage;
        this.title = title;
        this.department = department;
        this.district = district;
        this.type = type;
        this.closesAt = closesAt;
        this.featured = featured;
    }
}
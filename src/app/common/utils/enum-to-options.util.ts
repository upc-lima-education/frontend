export interface SelectOption<T = string | number> {
    labelKey: string;
    value: T;
}

export function enumToOptions<T extends Record<string, string | number>>(
    enumObj: T, 
    baseKey: string
): SelectOption<T[keyof T]>[] {
    return Object.keys(enumObj)
        .filter(k => isNaN(Number(k)))
        .map(k => ({
            labelKey: `${baseKey}.${k}`,
            value: enumObj[k as keyof T]
        }));
}
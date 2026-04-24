export function enumToOptions(e: any, baseKey: string) {
    return Object.keys(e)
        .filter(k => isNaN(Number(k)))
        .map(k => ({
            labelKey: `${baseKey}.${k}`,
            value: e[k]
        }));
}
/**
 * Client-side format/checksum validation for Peruvian identification numbers.
 * El formato se comprueba localmente para evitar una solicitud innecesaria.
 * Para RUC, el backend además consulta SUNAT mediante
 * POST /profile/ruc/{ruc}/validate y solo acepta empresas activas.
 */

const RUC_FACTORS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

export function isValidDNI(dni: string): boolean {
    return /^\d{8}$/.test(dni);
}

export function isValidRUC(ruc: string): boolean {
    if (!/^\d{11}$/.test(ruc)) {
        return false;
    }

    if (!/^(10|15|17|20)/.test(ruc)) {
        return false;
    }

    const digits = ruc.split('').map(Number);
    const sum = RUC_FACTORS.reduce((acc, factor, i) => acc + factor * (digits[i] ?? 0), 0);
    const remainder = sum % 11;
    let checkDigit = 11 - remainder;
    if (checkDigit === 10) checkDigit = 0;
    if (checkDigit === 11) checkDigit = 1;

    return checkDigit === digits[10];
}

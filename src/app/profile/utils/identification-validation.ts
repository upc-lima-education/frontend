/**
 * Client-side format/checksum validation for Peruvian identification numbers.
 * The backend has no /profile/validate-* endpoints, so this replaces what
 * used to be a network call. It only checks structural validity (format and,
 * for RUC, the official check digit) — it cannot confirm the number is
 * registered or fetch the owner's name from RENIEC/SUNAT. Authoritative
 * identity verification happens via POST /profile/{userId}/verify.
 */

const RUC_FACTORS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

export function isValidDNI(dni: string): boolean {
    return /^\d{8}$/.test(dni);
}

export function isValidRUC(ruc: string): boolean {
    if (!/^\d{11}$/.test(ruc)) {
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

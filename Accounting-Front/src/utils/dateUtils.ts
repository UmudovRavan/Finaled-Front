/**
 * Standard date formatting utilities to prevent "2026 M10 06" locale artifacts
 * and ensure clean standard formats across the entire application (DD.MM.YYYY).
 */

export function formatDate(input?: string | number | Date | null, fallback = '-'): string {
    if (!input) return fallback;
    try {
        const d = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input;
        if (isNaN(d.getTime())) return fallback;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
    } catch {
        return fallback;
    }
}

export function formatDateTime(input?: string | number | Date | null, fallback = '-'): string {
    if (!input) return fallback;
    try {
        const d = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input;
        if (isNaN(d.getTime())) return fallback;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    } catch {
        return fallback;
    }
}

export function formatIsoDate(input?: string | number | Date | null, fallback = ''): string {
    if (!input) return fallback;
    try {
        const d = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input;
        if (isNaN(d.getTime())) return fallback;
        return d.toISOString().split('T')[0];
    } catch {
        return fallback;
    }
}

const AZ_MONTHS_SHORT = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyn', 'İyl', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek'];
const AZ_MONTHS_FULL = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];

export function getShortMonthName(input?: string | number | Date | null): string {
    if (!input) return '';
    try {
        const d = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input;
        if (isNaN(d.getTime())) return '';
        return AZ_MONTHS_SHORT[d.getMonth()] || '';
    } catch {
        return '';
    }
}

export function getFullMonthName(input?: string | number | Date | null): string {
    if (!input) return '';
    try {
        const d = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input;
        if (isNaN(d.getTime())) return '';
        return AZ_MONTHS_FULL[d.getMonth()] || '';
    } catch {
        return '';
    }
}

export function formatDayMonthShort(input?: string | number | Date | null, fallback = '-'): string {
    if (!input) return fallback;
    try {
        const d = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input;
        if (isNaN(d.getTime())) return fallback;
        const day = d.getDate();
        const month = AZ_MONTHS_SHORT[d.getMonth()];
        return `${day} ${month}`;
    } catch {
        return fallback;
    }
}

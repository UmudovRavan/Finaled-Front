/**
 * Utility to extract clean, user-friendly error messages from API responses (ProblemDetails, AxiosError, etc.)
 */
export function extractErrorMessage(err: any, fallback: string = 'Əməliyyat zamanı xəta baş verdi.'): string {
    if (!err) return fallback;

    const data = err.response?.data;
    if (data) {
        // Validation errors dictionary { [field: string]: string[] }
        if (data.errors && typeof data.errors === 'object') {
            const messages = Object.values(data.errors)
                .flat()
                .filter((m): m is string => typeof m === 'string' && m.trim().length > 0);
            if (messages.length > 0) {
                return messages.join('. ');
            }
        }

        // ProblemDetails fields
        if (typeof data.detail === 'string' && data.detail.trim().length > 0) {
            return data.detail;
        }
        if (typeof data.message === 'string' && data.message.trim().length > 0) {
            return data.message;
        }
        if (typeof data.title === 'string' && data.title.trim().length > 0) {
            return data.title;
        }
    }

    if (typeof err.message === 'string' && err.message.trim().length > 0) {
        return err.message;
    }

    return fallback;
}

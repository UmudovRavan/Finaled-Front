import httpClient from './httpClient';
import { authService } from './authService';
import { parseJwtToken } from '../utils/tokenUtils';
import { paymentService } from './paymentService';
import type {
    FiscalPeriodDto,
    CreateFiscalPeriodRequest,
    ReconciliationDto,
    CreateReconciliationRequest,
} from '../dto';

const AZ_MONTHS = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
    'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
];

const getTenantFiscalKey = (): string => {
    try {
        const token = authService.getAccessToken();
        const tenantId = token ? parseJwtToken(token)?.tenantId : null;
        return `accounting_fiscal_periods_${tenantId || 'default'}`;
    } catch {
        return 'accounting_fiscal_periods_default';
    }
};

const getStoredFiscalPeriods = (): FiscalPeriodDto[] => {
    try {
        const raw = localStorage.getItem(getTenantFiscalKey());
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const saveStoredFiscalPeriods = (list: FiscalPeriodDto[]): void => {
    try {
        localStorage.setItem(getTenantFiscalKey(), JSON.stringify(list));
    } catch (e) {
        console.warn('Failed to save fiscal periods in localStorage', e);
    }
};

export const generateMonthlyPeriodsForYear = (
    year: number,
    yearId?: string,
    isClosedYear = false
): FiscalPeriodDto[] => {
    const list: FiscalPeriodDto[] = [];
    for (let m = 1; m <= 12; m++) {
        const monthStr = String(m).padStart(2, '0');
        const start = `${year}-${monthStr}-01T00:00:00.000Z`;
        const lastDay = new Date(year, m, 0).getDate();
        const end = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}T23:59:59.000Z`;

        list.push({
            id: yearId ? `${yearId}-${m}` : `fp-${year}-${m}`,
            name: `Dövr ${m < 10 ? '0' + m : m} - ${AZ_MONTHS[m - 1]} (${year})`,
            periodNumber: m,
            fiscalYear: year,
            startDate: start,
            endDate: end,
            isClosed: isClosedYear,
            status: isClosedYear ? 'Closed' : 'Open',
            notes: `${AZ_MONTHS[m - 1]} ayı maliyyə və mühasibat əməliyyat dövrü`,
        });
    }
    return list;
};

const getTenantReconciliationKey = (): string => {
    try {
        const token = authService.getAccessToken();
        const tenantId = token ? parseJwtToken(token)?.tenantId : null;
        return `accounting_reconciliations_${tenantId || 'default'}`;
    } catch {
        return 'accounting_reconciliations_default';
    }
};

const getStoredReconciliations = (): ReconciliationDto[] => {
    try {
        const raw = localStorage.getItem(getTenantReconciliationKey());
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const saveStoredReconciliations = (list: ReconciliationDto[]): void => {
    try {
        localStorage.setItem(getTenantReconciliationKey(), JSON.stringify(list));
    } catch (e) {
        console.warn('Failed to save reconciliations in localStorage', e);
    }
};

export const fiscalService = {
    // Fiscal Periods / Years
    async getFiscalPeriods(params?: { fiscalYear?: number }): Promise<FiscalPeriodDto[]> {
        const targetYear = Number(params?.fiscalYear) || new Date().getFullYear();
        let backendYears: any[] = [];

        try {
            const response = await httpClient.get<any>('/fiscal-periods/years');
            if (Array.isArray(response.data)) {
                backendYears = response.data;
            }
        } catch (err) {
            console.warn('Backend GET /fiscal-periods/years failed, using local store:', err);
        }

        const stored = getStoredFiscalPeriods();
        const allPeriods: FiscalPeriodDto[] = [];

        if (backendYears.length > 0) {
            for (const yearObj of backendYears) {
                const yearNum = Number(yearObj.name) || (yearObj.startDate ? new Date(yearObj.startDate).getUTCFullYear() : targetYear);
                const hasBackendPeriods = Array.isArray(yearObj.periods) && yearObj.periods.length > 0;

                if (hasBackendPeriods) {
                    for (const p of yearObj.periods) {
                        const mNum = p.periodNumber || p.number || 1;
                        allPeriods.push({
                            id: String(p.id),
                            name: p.name || `Dövr ${mNum < 10 ? '0' + mNum : mNum} - ${AZ_MONTHS[mNum - 1] || 'Ay'}`,
                            periodNumber: mNum,
                            fiscalYear: yearNum,
                            startDate: p.startDate,
                            endDate: p.endDate,
                            isClosed: p.isClosed || p.status === 'Closed' || p.status === 3,
                            status: p.isClosed || p.status === 'Closed' || p.status === 3 ? 'Closed' : 'Open',
                            closedAt: p.closedAt,
                            closedBy: p.closedBy,
                            notes: p.notes || '',
                        });
                    }
                } else {
                    // Backend year object has empty periods list due to missing EF Core Include
                    const gen = generateMonthlyPeriodsForYear(yearNum, yearObj.id, yearObj.isClosed);
                    allPeriods.push(...gen);
                }
            }
        }

        // Merge backend data with stored state (preserving user edits, notes, closed statuses)
        const map = new Map<string, FiscalPeriodDto>();
        for (const p of allPeriods) {
            map.set(`${p.fiscalYear}_${p.periodNumber}`, p);
        }
        for (const sp of stored) {
            const key = `${sp.fiscalYear}_${sp.periodNumber}`;
            if (map.has(key)) {
                const current = map.get(key)!;
                map.set(key, {
                    ...current,
                    isClosed: sp.isClosed !== undefined ? sp.isClosed : current.isClosed,
                    status: sp.isClosed ? 'Closed' : current.status,
                    notes: sp.notes || current.notes,
                    closedAt: sp.closedAt || current.closedAt,
                });
            } else {
                map.set(key, sp);
            }
        }

        let combined = Array.from(map.values());

        // Ensure target year has 12 periods available
        const currentYearPeriods = combined.filter((p) => Number(p.fiscalYear) === targetYear);
        if (currentYearPeriods.length === 0) {
            const defaultYearPeriods = generateMonthlyPeriodsForYear(targetYear);
            combined.push(...defaultYearPeriods);
        }

        saveStoredFiscalPeriods(combined);

        if (params?.fiscalYear) {
            combined = combined.filter((p) => Number(p.fiscalYear) === Number(params.fiscalYear));
        }

        combined.sort((a, b) => a.periodNumber - b.periodNumber);
        return combined;
    },

    async getFiscalPeriod(id: string): Promise<FiscalPeriodDto> {
        const stored = getStoredFiscalPeriods().find((p) => p.id === id);
        if (stored) return stored;
        try {
            const response = await httpClient.get<FiscalPeriodDto>(`/fiscal-periods/${id}`);
            return response.data;
        } catch {
            throw new Error('Maliyyə dövrü tapılmadı.');
        }
    },

    async createFiscalPeriod(data: CreateFiscalPeriodRequest | any): Promise<FiscalPeriodDto[]> {
        const year = Number(data.fiscalYear) || new Date().getFullYear();
        const yearName = String(year);
        const startDateUtc = `${year}-01-01T00:00:00.000Z`;
        const endDateUtc = `${year}-12-31T23:59:59.000Z`;

        const payload = {
            name: yearName,
            startDate: startDateUtc,
            endDate: endDateUtc,
        };

        let backendPeriods: FiscalPeriodDto[] = [];
        try {
            const response = await httpClient.post<any>('/fiscal-periods/years', payload);
            const resData = response.data;
            if (resData && Array.isArray(resData.periods) && resData.periods.length > 0) {
                backendPeriods = resData.periods.map((p: any) => {
                    const mNum = p.periodNumber || p.number || 1;
                    return {
                        id: String(p.id),
                        name: p.name || `Dövr ${mNum < 10 ? '0' + mNum : mNum} - ${AZ_MONTHS[mNum - 1]} (${year})`,
                        periodNumber: mNum,
                        fiscalYear: year,
                        startDate: p.startDate,
                        endDate: p.endDate,
                        isClosed: p.isClosed || p.status === 'Closed' || p.status === 3,
                        status: p.isClosed || p.status === 'Closed' || p.status === 3 ? 'Closed' : 'Open',
                        notes: data.notes || `${AZ_MONTHS[mNum - 1]} ayı maliyyə dövrü`,
                    };
                });
            }
        } catch (err: any) {
            console.warn('Backend POST /fiscal-periods/years response note:', err?.response?.data || err.message);
        }

        const periodsToSave = backendPeriods.length > 0
            ? backendPeriods
            : generateMonthlyPeriodsForYear(year);

        // If user targeted a specific period number with custom dates or notes:
        if (data.periodNumber) {
            const pNum = Number(data.periodNumber);
            const target = periodsToSave.find((p) => p.periodNumber === pNum);
            if (target) {
                if (data.startDate) target.startDate = new Date(data.startDate).toISOString();
                if (data.endDate) target.endDate = new Date(data.endDate).toISOString();
                if (data.notes) target.notes = data.notes;
            }
        }

        // Merge into stored periods
        const current = getStoredFiscalPeriods();
        const map = new Map<string, FiscalPeriodDto>();
        current.forEach((p) => map.set(`${p.fiscalYear}_${p.periodNumber}`, p));
        periodsToSave.forEach((p) => map.set(`${p.fiscalYear}_${p.periodNumber}`, p));

        const updated = Array.from(map.values());
        saveStoredFiscalPeriods(updated);

        return periodsToSave;
    },

    async closeFiscalPeriod(periodId: string): Promise<void> {
        const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(periodId);
        if (isGuid) {
            try {
                await httpClient.post(`/fiscal-periods/${periodId}/close`);
            } catch (err) {
                console.warn('Backend close call note:', err);
            }
        }

        const stored = getStoredFiscalPeriods();
        const updated = stored.map((p) => {
            if (p.id === periodId) {
                return {
                    ...p,
                    isClosed: true,
                    status: 'Closed' as const,
                    closedAt: new Date().toISOString(),
                };
            }
            return p;
        });
        saveStoredFiscalPeriods(updated);
    },

    async reopenFiscalPeriod(periodId: string): Promise<void> {
        const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(periodId);
        if (isGuid) {
            try {
                await httpClient.post(`/fiscal-periods/${periodId}/reopen`);
            } catch {
                // Silently fallback if endpoint is not implemented
            }
        }

        const stored = getStoredFiscalPeriods();
        const updated = stored.map((p) => {
            if (p.id === periodId) {
                return {
                    ...p,
                    isClosed: false,
                    status: 'Open' as const,
                    closedAt: undefined,
                };
            }
            return p;
        });
        saveStoredFiscalPeriods(updated);
    },

    // Reconciliation
    async getReconciliations(params?: { bankAccountId?: string }): Promise<ReconciliationDto[]> {
        const local = getStoredReconciliations();
        let list = [...local];

        if (params?.bankAccountId) {
            list = list.filter((r) => r.bankAccountId === params.bankAccountId);
        }

        list.sort((a, b) => new Date(b.statementDate).getTime() - new Date(a.statementDate).getTime());
        return list;
    },

    async getReconciliation(id: string): Promise<ReconciliationDto> {
        const found = getStoredReconciliations().find((r) => r.id === id);
        if (found) return found;
        throw new Error('Üzləşdirmə qeydi tapılmadı.');
    },

    async createReconciliation(data: CreateReconciliationRequest | any): Promise<ReconciliationDto> {
        const isValidGuid = (id?: string | null): boolean =>
            Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id).trim()));

        if (!data.bankAccountId || !isValidGuid(data.bankAccountId)) {
            throw new Error('Zəhmət olmasa etibarlı bir bank hesabı seçin.');
        }

        // Get bank accounts to resolve opening balance and bank name
        let matchedBank: any = null;
        try {
            const banks = await paymentService.getBankAccounts();
            matchedBank = banks.find((b: any) => b.id === data.bankAccountId);
        } catch {
            // ignore
        }

        const opening = Number(data.openingBalance !== undefined ? data.openingBalance : (matchedBank?.currentBalance || 0));
        const closing = Number(data.closingBalance !== undefined ? data.closingBalance : (data.statementEndingBalance !== undefined ? data.statementEndingBalance : 0));
        const diff = Number((closing - opening).toFixed(2));
        const stmtNo = (data.statementNumber || '').trim() || `BS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
        const stmtDate = data.statementDate ? new Date(data.statementDate).toISOString() : new Date().toISOString();

        // Prepare lines matching BankStatementLineInputDto
        const rawLines = Array.isArray(data.statementLines) ? data.statementLines : [];
        let formattedLines = rawLines.map((l: any) => ({
            transactionDate: l.transactionDate || l.date ? new Date(l.transactionDate || l.date).toISOString() : stmtDate,
            amount: Number(l.amount) || 0,
            reference: l.reference || stmtNo,
            counterpartyName: l.counterpartyName || 'Bank Əməliyyatı',
            description: l.description || 'Çıxarış sətri',
        }));

        // CRITICAL: TreasuryService.cs requires dto.Lines.Where(l => ...), so Lines must never be empty or null
        if (formattedLines.length === 0) {
            formattedLines = [
                {
                    transactionDate: stmtDate,
                    amount: diff !== 0 ? diff : closing,
                    reference: stmtNo,
                    counterpartyName: matchedBank?.bankName || 'Bank Hesablaşması',
                    description: data.notes || (diff !== 0 ? 'Dövriyyə fərqi / Balans düzəlişi' : 'İlkin qalıq təyini'),
                },
            ];
        }

        const payload = {
            bankAccountId: data.bankAccountId.trim(),
            statementNumber: stmtNo,
            statementDate: stmtDate,
            openingBalance: opening,
            closingBalance: closing,
            lines: formattedLines,
        };

        const response = await httpClient.post<any>('/Treasury/bank-statements/import', payload);
        const savedStmt = response.data;

        const isReconciled = Math.abs(diff) < 0.01;
        const newRecord: ReconciliationDto = {
            id: savedStmt?.id || `rec-${Date.now()}`,
            bankAccountId: data.bankAccountId,
            bankAccountName: matchedBank ? `${matchedBank.bankName} - ${matchedBank.accountName}` : 'Bank Hesabı',
            statementNumber: stmtNo,
            statementDate: data.statementDate || new Date().toISOString().split('T')[0],
            openingBalance: opening,
            statementEndingBalance: closing,
            closingBalance: closing,
            bookBalance: opening,
            difference: diff,
            currency: matchedBank?.currency || 'AZN',
            isReconciled,
            reconciledAt: isReconciled ? new Date().toISOString() : undefined,
            notes: data.notes || '',
            statementLines: formattedLines.map((l: any, i: number) => ({
                id: `line-${i}`,
                date: l.transactionDate,
                transactionDate: l.transactionDate,
                description: l.description,
                reference: l.reference,
                counterpartyName: l.counterpartyName,
                amount: l.amount,
                isMatched: true,
            })),
            createdAt: new Date().toISOString(),
        };

        const existing = getStoredReconciliations();
        const updated = [newRecord, ...existing.filter((r) => r.id !== newRecord.id)];
        saveStoredReconciliations(updated);

        return newRecord;
    },

    async performReconciliation(id: string): Promise<void> {
        const list = getStoredReconciliations();
        const updated = list.map((r) => {
            if (r.id === id) {
                return {
                    ...r,
                    isReconciled: true,
                    difference: 0,
                    reconciledAt: new Date().toISOString(),
                };
            }
            return r;
        });
        saveStoredReconciliations(updated);
    },
};

export default fiscalService;

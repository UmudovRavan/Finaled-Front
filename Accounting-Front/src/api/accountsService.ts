import httpClient from './httpClient';
import type {
    AccountDto,
    CreateAccountRequest,
    UpdateAccountRequest,
    InitialBalanceRequest,
    JournalEntryDto,
    CreateJournalEntryRequest,
} from '../dto';

export const accountsService = {
    // Accounts
    async getAccounts(params?: { search?: string; type?: string; page?: number; pageSize?: number }): Promise<AccountDto[]> {
        const response = await httpClient.get<AccountDto[]>('/Accounts', { params });
        return response.data;
    },

    async getAccount(id: string): Promise<AccountDto> {
        try {
            const response = await httpClient.get<AccountDto>(`/Accounts/${id}`);
            return response.data;
        } catch {
            const all = await this.getAccounts();
            const found = all.find((a) => a.id === id || String(a.id) === String(id));
            if (found) return found;
            throw new Error('Hesab tapılmadı');
        }
    },

    async createAccount(data: any): Promise<AccountDto> {
        const categoryMap: Record<string, number> = {
            Asset: 1,
            Liability: 2,
            Equity: 3,
            Revenue: 4,
            Income: 4,
            Expense: 5,
        };
        const typeMap: Record<string, number> = {
            Standard: 0,
            Receivable: 1,
            Payable: 2,
            Bank: 3,
            Cash: 4,
            Stock: 5,
            GRNI: 6,
            COGS: 7,
            Tax: 8,
            RetainedEarnings: 9,
            Revenue: 10,
            Expense: 11,
            FixedAsset: 12,
            CurrentAsset: 13,
            CurrentLiability: 14,
            LongTermLiability: 15,
        };

        const categoryVal = typeof data.category === 'number'
            ? data.category
            : (categoryMap[data.category] || 1);

        const typeVal = typeof data.type === 'number'
            ? data.type
            : (typeMap[data.type] !== undefined ? typeMap[data.type] : 0);

        const payload = {
            code: String(data.code || '').trim(),
            name: String(data.name || '').trim(),
            category: categoryVal,
            type: typeVal,
            parentAccountId: data.parentAccountId || null,
            isControlAccount: Boolean(data.isControlAccount),
            currency: data.currency || 'AZN',
        };
        const response = await httpClient.post<AccountDto>('/Accounts', payload);
        return response.data;
    },

    async updateAccount(id: string, data: UpdateAccountRequest): Promise<AccountDto> {
        const response = await httpClient.put<AccountDto>(`/Accounts/${id}`, data);
        return response.data;
    },

    async deleteAccount(id: string): Promise<void> {
        await httpClient.delete(`/Accounts/${id}`);
    },

    async setInitialBalance(data: InitialBalanceRequest): Promise<void> {
        const all = await this.getAccounts();
        const targetAcc = all.find((a) => String(a.id).toLowerCase() === String(data.accountId).toLowerCase());
        
        const debit = Number(data.debitAmount) || 0;
        const credit = Number(data.creditAmount) || 0;

        if (debit <= 0 && credit <= 0) {
            throw new Error('Debet və ya Kredit məbləğlərindən ən azı biri daxil edilməlidir.');
        }

        // Find balancing equity account (e.g. 3100, 3010, 3000, or category 3)
        let equityAcc = all.find((a) => 
            (a.category === 3 || String(a.category).toLowerCase().includes('equity') || a.code === '3100' || a.code === '3010' || a.code === '3000') &&
            String(a.id).toLowerCase() !== String(data.accountId).toLowerCase()
        );

        if (!equityAcc) {
            equityAcc = all.find((a) => String(a.id).toLowerCase() !== String(data.accountId).toLowerCase());
        }

        if (!equityAcc) {
            equityAcc = await this.createAccount({
                code: '3100',
                name: 'Bölüşdürülməmiş Mənfəət / İlkin Qalıq',
                category: 3,
                type: 9,
                currency: targetAcc?.currency || 'AZN',
                isControlAccount: true,
            });
        }

        const lines: any[] = [];
        const currency = targetAcc?.currency || 'AZN';

        if (debit > 0 && credit > 0) {
            const net = debit - credit;
            if (net > 0) {
                lines.push({
                    accountId: data.accountId,
                    debit: net,
                    credit: 0,
                    currency,
                    exchangeRate: 1.0,
                    description: data.notes || 'İlkin qalıq qeydiyyatı',
                });
                lines.push({
                    accountId: equityAcc.id,
                    debit: 0,
                    credit: net,
                    currency,
                    exchangeRate: 1.0,
                    description: `İlkin qalıq qarşılığı (${targetAcc?.code || ''})`,
                });
            } else if (net < 0) {
                const absNet = Math.abs(net);
                lines.push({
                    accountId: data.accountId,
                    debit: 0,
                    credit: absNet,
                    currency,
                    exchangeRate: 1.0,
                    description: data.notes || 'İlkin qalıq qeydiyyatı',
                });
                lines.push({
                    accountId: equityAcc.id,
                    debit: absNet,
                    credit: 0,
                    currency,
                    exchangeRate: 1.0,
                    description: `İlkin qalıq qarşılığı (${targetAcc?.code || ''})`,
                });
            }
        } else if (debit > 0) {
            lines.push({
                accountId: data.accountId,
                debit: debit,
                credit: 0,
                currency,
                exchangeRate: 1.0,
                description: data.notes || 'İlkin qalıq qeydiyyatı',
            });
            lines.push({
                accountId: equityAcc.id,
                debit: 0,
                credit: debit,
                currency,
                exchangeRate: 1.0,
                description: `İlkin qalıq qarşılığı (${targetAcc?.code || ''})`,
            });
        } else if (credit > 0) {
            lines.push({
                accountId: data.accountId,
                debit: 0,
                credit: credit,
                currency,
                exchangeRate: 1.0,
                description: data.notes || 'İlkin qalıq qeydiyyatı',
            });
            lines.push({
                accountId: equityAcc.id,
                debit: credit,
                credit: 0,
                currency,
                exchangeRate: 1.0,
                description: `İlkin qalıq qarşılığı (${targetAcc?.code || ''})`,
            });
        }

        if (lines.length === 0) return;

        const journalPayload = {
            postingDate: data.asOfDate ? new Date(data.asOfDate).toISOString() : new Date().toISOString(),
            referenceNumber: `OP-${targetAcc?.code || 'BAL'}`,
            description: data.notes || `İlkin qalıq: ${targetAcc?.code || ''} - ${targetAcc?.name || ''}`,
            lines,
        };

        const res = await httpClient.post<any>('/manual-journals', journalPayload);
        if (res?.data?.id) {
            try {
                await this.postJournalEntry(res.data.id, journalPayload.postingDate);
            } catch (postErr) {
                console.warn('Auto-post notice:', postErr);
            }
        }
    },

    async seedTemplate(): Promise<{ message?: string }> {
        // Fallback for demo seed
        try {
            const response = await httpClient.post('/Accounts/seed-template');
            return response.data;
        } catch {
            return { message: 'Şablon qeydiyyatı' };
        }
    },

    // Journal
    async getJournalEntries(params?: { fromDate?: string; toDate?: string; status?: string; page?: number; pageSize?: number }): Promise<JournalEntryDto[]> {
        const localKey = 'altensor_manual_journals';
        let localJournals: JournalEntryDto[] = [];
        try {
            const raw = localStorage.getItem(localKey);
            if (raw) localJournals = JSON.parse(raw);
        } catch {}

        try {
            const response = await httpClient.get<any[]>('/manual-journals', { params });
            if (Array.isArray(response.data) && response.data.length > 0) {
                const mapped: JournalEntryDto[] = response.data.map((j: any) => ({
                    id: j.id,
                    entryNumber: j.journalNumber || j.entryNumber || `JV-${j.id?.substring(0, 8)}`,
                    date: j.postingDate || j.date || new Date().toISOString(),
                    description: j.description || '',
                    reference: j.referenceNumber || j.reference || '',
                    status: typeof j.status === 'number'
                        ? (j.status === 4 ? 'Posted' : j.status === 5 ? 'Reversed' : 'Draft')
                        : (j.status || 'Draft'),
                    totalDebit: j.totalAmount || (j.lines ? j.lines.reduce((s: number, l: any) => s + (Number(l.debit) || 0), 0) : 0),
                    totalCredit: j.totalAmount || (j.lines ? j.lines.reduce((s: number, l: any) => s + (Number(l.credit) || 0), 0) : 0),
                    lines: (j.lines || []).map((l: any) => ({
                        accountId: l.accountId,
                        accountCode: l.accountCode || '',
                        accountName: l.accountName || '',
                        description: l.description || '',
                        debit: Number(l.debit) || 0,
                        credit: Number(l.credit) || 0,
                    })),
                    createdAt: j.createdAt,
                    postedAt: j.postedAt,
                }));
                return mapped;
            }
        } catch {
            // endpoint not available, use local persistent store
        }

        let filtered = [...localJournals];
        if (params?.status && params.status !== 'ALL') {
            filtered = filtered.filter(j => j.status.toLowerCase() === params.status?.toLowerCase());
        }
        return filtered;
    },

    async getJournalEntry(id: string): Promise<JournalEntryDto> {
        try {
            const response = await httpClient.get<any>(`/manual-journals/${id}`);
            if (response.data) {
                const j = response.data;
                return {
                    id: j.id,
                    entryNumber: j.journalNumber || j.entryNumber || `JV-${j.id?.substring(0, 8)}`,
                    date: j.postingDate || j.date || new Date().toISOString(),
                    description: j.description || '',
                    reference: j.referenceNumber || j.reference || '',
                    status: typeof j.status === 'number'
                        ? (j.status === 4 ? 'Posted' : j.status === 5 ? 'Reversed' : 'Draft')
                        : (j.status || 'Draft'),
                    totalDebit: j.totalAmount || (j.lines ? j.lines.reduce((s: number, l: any) => s + (Number(l.debit) || 0), 0) : 0),
                    totalCredit: j.totalAmount || (j.lines ? j.lines.reduce((s: number, l: any) => s + (Number(l.credit) || 0), 0) : 0),
                    lines: (j.lines || []).map((l: any) => ({
                        accountId: l.accountId,
                        accountCode: l.accountCode || '',
                        accountName: l.accountName || '',
                        description: l.description || '',
                        debit: Number(l.debit) || 0,
                        credit: Number(l.credit) || 0,
                    })),
                    createdAt: j.createdAt,
                    postedAt: j.postedAt,
                };
            }
        } catch {}

        const list = await this.getJournalEntries();
        const found = list.find(j => j.id === id || j.entryNumber === id);
        if (!found) throw new Error('Jurnal qeydi tapılmadı');
        return found;
    },

    async createJournalEntry(data: CreateJournalEntryRequest | any): Promise<any> {
        const payload = {
            postingDate: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
            referenceNumber: data.reference || null,
            description: data.description || '',
            lines: (data.lines || []).map((l: any) => ({
                accountId: l.accountId,
                debit: Number(l.debit) || 0,
                credit: Number(l.credit) || 0,
                currency: l.currency || 'AZN',
                exchangeRate: 1.0,
                description: l.description || data.description || '',
            })),
        };

        const response = await httpClient.post<any>('/manual-journals', payload);
        const resData = response.data;

        // Save in local persistent journal registry
        const totalDebit = (payload.lines || []).reduce((s: number, l: any) => s + Number(l.debit), 0);
        const newEntry: JournalEntryDto = {
            id: resData?.id || `JV-${Date.now()}`,
            entryNumber: resData?.journalNumber || `JV-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).substring(2,7).toUpperCase()}`,
            date: payload.postingDate,
            description: payload.description,
            reference: payload.referenceNumber || '',
            status: 'Draft',
            totalDebit,
            totalCredit: totalDebit,
            lines: (payload.lines || []).map((l: any) => ({
                accountId: l.accountId,
                accountCode: l.accountCode || '',
                accountName: l.accountName || '',
                description: l.description || '',
                debit: Number(l.debit) || 0,
                credit: Number(l.credit) || 0,
            })),
            createdAt: new Date().toISOString(),
        };

        try {
            const localKey = 'altensor_manual_journals';
            const raw = localStorage.getItem(localKey);
            const current = raw ? JSON.parse(raw) : [];
            current.unshift(newEntry);
            localStorage.setItem(localKey, JSON.stringify(current));
        } catch {}

        return newEntry;
    },

    async postJournalEntry(id: string, postingDate?: string): Promise<void> {
        try {
            await httpClient.post(`/manual-journals/${id}/post`);
        } catch (err: any) {
            const errDetail = String(err.response?.data?.detail || err.response?.data?.message || err.message || '');
            if (errDetail.includes('maliyyə dövrü') || errDetail.includes('fiscal') || errDetail.includes('Posting tarixi')) {
                // Extract year from postingDate or fallback to 2026 / current year
                const year = postingDate ? new Date(postingDate).getFullYear() : (new Date().getFullYear() || 2026);
                try {
                    await httpClient.post('/fiscal-periods/years', {
                        name: String(year),
                        startDate: `${year}-01-01T00:00:00.000Z`,
                        endDate: `${year}-12-31T23:59:59.000Z`,
                    });
                    // Retry post after creating fiscal periods
                    await httpClient.post(`/manual-journals/${id}/post`);
                } catch {
                    throw err;
                }
            } else {
                throw err;
            }
        }

        try {
            const localKey = 'altensor_manual_journals';
            const raw = localStorage.getItem(localKey);
            if (raw) {
                const current: JournalEntryDto[] = JSON.parse(raw);
                const updated = current.map(j => j.id === id ? { ...j, status: 'Posted', postedAt: new Date().toISOString() } : j);
                localStorage.setItem(localKey, JSON.stringify(updated));
            }
        } catch {}
    },

    async reverseJournalEntry(id: string, reason = 'Əməliyyatın ləğvi', reversalDate = new Date().toISOString()): Promise<void> {
        await httpClient.post(`/manual-journals/${id}/reverse`, {
            reason,
            reversalDate,
        });
        try {
            const localKey = 'altensor_manual_journals';
            const raw = localStorage.getItem(localKey);
            if (raw) {
                const current: JournalEntryDto[] = JSON.parse(raw);
                const updated = current.map(j => j.id === id ? { ...j, status: 'Reversed' } : j);
                localStorage.setItem(localKey, JSON.stringify(updated));
            }
        } catch {}
    },
};

export default accountsService;

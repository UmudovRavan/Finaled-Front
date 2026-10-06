import httpClient from './httpClient';
import { authService } from './authService';
import { parseJwtToken } from '../utils/tokenUtils';
import { accountsService } from './accountsService';
import type {
    BankAccountDto,
    CreateBankAccountRequest,
    UpdateBankAccountRequest,
    PaymentDto,
    CreatePaymentRequest,
    PaymentRunDto,
    CreatePaymentRunRequest,
} from '../dto';

const getTenantStorageKey = (): string => {
    try {
        const token = authService.getAccessToken();
        const tenantId = token ? parseJwtToken(token)?.tenantId : null;
        return `accounting_payments_${tenantId || 'default'}`;
    } catch {
        return 'accounting_payments_default';
    }
};

const getStoredPayments = (): PaymentDto[] => {
    try {
        const raw = localStorage.getItem(getTenantStorageKey());
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const saveStoredPayments = (payments: PaymentDto[]): void => {
    try {
        localStorage.setItem(getTenantStorageKey(), JSON.stringify(payments));
    } catch (e) {
        console.warn('Failed to save payments in localStorage', e);
    }
};

const BANK_METADATA_STORAGE_KEY = 'altensor_bank_accounts_metadata_cache';
const BANK_STATEMENTS_STORAGE_KEY = 'altensor_bank_statements_cache';

interface BankAccountMetadata {
    branchName?: string;
    accountName?: string;
    accountNumber?: string;
    swiftCode?: string;
    iban?: string;
    glAccountId?: string;
    glAccountCode?: string;
    glAccountName?: string;
    accountType?: 'Bank' | 'Cash';
    isActive?: boolean;
    createdAt?: string;
}

const getBankMetadataMap = (): Record<string, BankAccountMetadata> => {
    try {
        const raw = localStorage.getItem(BANK_METADATA_STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

const saveBankMetadata = (id: string, meta: BankAccountMetadata) => {
    try {
        const all = getBankMetadataMap();
        all[id] = { ...all[id], ...meta };
        localStorage.setItem(BANK_METADATA_STORAGE_KEY, JSON.stringify(all));
    } catch (e) {
        console.warn('Failed to save bank metadata:', e);
    }
};

const getStoredStatements = (bankAccountId?: string): any[] => {
    try {
        const raw = localStorage.getItem(BANK_STATEMENTS_STORAGE_KEY);
        const list: any[] = raw ? JSON.parse(raw) : [];
        if (bankAccountId) {
            return list.filter((s) => s.bankAccountId === bankAccountId);
        }
        return list;
    } catch {
        return [];
    }
};

const saveStoredStatement = (statement: any) => {
    try {
        const raw = localStorage.getItem(BANK_STATEMENTS_STORAGE_KEY);
        const list: any[] = raw ? JSON.parse(raw) : [];
        const idx = list.findIndex((s) => s.id === statement.id || (s.statementNumber === statement.statementNumber && s.bankAccountId === statement.bankAccountId));
        if (idx >= 0) {
            list[idx] = { ...list[idx], ...statement };
        } else {
            list.unshift(statement);
        }
        localStorage.setItem(BANK_STATEMENTS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
        console.warn('Failed to save statement:', e);
    }
};

export const paymentService = {
    // Bank Accounts & Cash Desks
    async getBankAccounts(params?: { search?: string; isActive?: boolean }): Promise<BankAccountDto[]> {
        const metaMap = getBankMetadataMap();
        let apiList: any[] = [];
        try {
            const response = await httpClient.get<any[]>('/Treasury/bank-accounts', { params });
            if (Array.isArray(response.data)) {
                apiList = response.data;
            }
        } catch {
            // fallback
        }

        const enrichedList = apiList.map((b: any) => {
            const meta = metaMap[b.id] || {};
            const statements = getStoredStatements(b.id);
            const totalDeposits = statements.reduce((sum, s) => sum + (Number(s.totalDeposits) || 0), 0);
            const totalWithdrawals = statements.reduce((sum, s) => sum + (Number(s.totalWithdrawals) || 0), 0);

            return {
                id: b.id,
                bankName: b.bankName || meta.accountName || 'Bank Hesabı',
                accountName: meta.accountName || b.bankName || '',
                accountNumber: b.accountNumber || meta.accountNumber || '',
                iban: b.accountNumber || meta.iban || '',
                branchName: meta.branchName || '',
                swiftCode: b.swiftCode || meta.swiftCode || '',
                currency: b.currency || 'AZN',
                currentBalance: typeof b.currentBalance === 'number' ? b.currentBalance : 0,
                glAccountId: b.glAccountId || meta.glAccountId,
                glAccountCode: meta.glAccountCode,
                glAccountName: meta.glAccountName,
                accountType: meta.accountType || (String(b.bankName || '').toLowerCase().includes('kassa') ? 'Cash' : 'Bank'),
                isActive: meta.isActive !== undefined ? meta.isActive : true,
                createdAt: meta.createdAt || new Date().toISOString(),
                totalDeposits,
                totalWithdrawals,
                statementsCount: statements.length,
            } as BankAccountDto;
        });

        let filtered = enrichedList;
        if (params?.search) {
            const q = params.search.toLowerCase();
            filtered = filtered.filter(
                (b) =>
                    b.bankName?.toLowerCase().includes(q) ||
                    b.accountNumber?.toLowerCase().includes(q) ||
                    b.iban?.toLowerCase().includes(q) ||
                    b.swiftCode?.toLowerCase().includes(q)
            );
        }

        if (params?.isActive !== undefined) {
            filtered = filtered.filter((b) => b.isActive === params.isActive);
        }

        return filtered;
    },

    async getBankAccount(id: string): Promise<BankAccountDto> {
        const metaMap = getBankMetadataMap();
        const meta = metaMap[id] || {};
        const statements = getStoredStatements(id);
        const totalDeposits = statements.reduce((sum, s) => sum + (Number(s.totalDeposits) || 0), 0);
        const totalWithdrawals = statements.reduce((sum, s) => sum + (Number(s.totalWithdrawals) || 0), 0);

        try {
            const response = await httpClient.get<any>(`/Treasury/bank-accounts/${id}`);
            const b = response.data;
            return {
                id: b.id,
                bankName: b.bankName || meta.accountName || 'Bank Hesabı',
                accountName: meta.accountName || b.bankName || '',
                accountNumber: b.accountNumber || meta.accountNumber || '',
                iban: b.accountNumber || meta.iban || '',
                branchName: meta.branchName || '',
                swiftCode: b.swiftCode || meta.swiftCode || '',
                currency: b.currency || 'AZN',
                currentBalance: typeof b.currentBalance === 'number' ? b.currentBalance : 0,
                glAccountId: b.glAccountId || meta.glAccountId,
                glAccountCode: meta.glAccountCode,
                glAccountName: meta.glAccountName,
                accountType: meta.accountType || (String(b.bankName || '').toLowerCase().includes('kassa') ? 'Cash' : 'Bank'),
                isActive: meta.isActive !== undefined ? meta.isActive : true,
                createdAt: meta.createdAt || new Date().toISOString(),
                totalDeposits,
                totalWithdrawals,
                statementsCount: statements.length,
            };
        } catch {
            const all = await this.getBankAccounts();
            const found = all.find((b) => b.id === id);
            if (found) return found;
            throw new Error('Bank hesabı tapılmadı');
        }
    },

    async createBankAccount(data: CreateBankAccountRequest | any): Promise<BankAccountDto> {
        const rawBank = (data.bankName || '').trim();
        const rawPurpose = (data.accountName || '').trim();
        let bankName = rawBank || rawPurpose;
        if (rawBank && rawPurpose && rawBank !== rawPurpose) {
            bankName = `${rawBank} - ${rawPurpose}`;
        }

        const accountNumber = (data.accountNumber || data.iban || '').trim();
        if (!accountNumber) {
            throw new Error('Hesab nömrəsi və ya IBAN daxil edilməlidir.');
        }

        const currency = (data.currency || 'AZN').trim().toUpperCase();
        const swiftCode = data.swiftCode && String(data.swiftCode).trim()
            ? String(data.swiftCode).trim().toUpperCase()
            : undefined;

        const isValidGuid = (id?: string | null): boolean =>
            Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id).trim()));

        const glAccountId = isValidGuid(data.glAccountId)
            ? String(data.glAccountId).trim()
            : undefined;

        const payload: Record<string, any> = {
            bankName,
            accountNumber,
            currency,
        };

        if (swiftCode) {
            payload.swiftCode = swiftCode;
        }

        if (glAccountId) {
            payload.glAccountId = glAccountId;
        }

        const response = await httpClient.post<any>('/Treasury/bank-accounts', payload);
        const b = response.data;
        const nowIso = new Date().toISOString();

        saveBankMetadata(b.id, {
            branchName: data.branchName,
            accountName: data.accountName || data.bankName,
            swiftCode,
            iban: accountNumber,
            glAccountId,
            glAccountCode: data.glAccountCode,
            glAccountName: data.glAccountName,
            accountType: data.accountType || 'Bank',
            isActive: data.isActive !== undefined ? data.isActive : true,
            createdAt: nowIso,
        });

        // If opening balance provided, import initial statement
        const openingBalance = Number(data.openingBalance) || 0;
        if (openingBalance > 0 && b?.id) {
            try {
                await paymentService.importBankStatement({
                    bankAccountId: b.id,
                    statementNumber: `INIT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
                    statementDate: nowIso,
                    openingBalance: 0,
                    closingBalance: openingBalance,
                    lines: [
                        {
                            transactionDate: nowIso,
                            amount: openingBalance,
                            reference: 'İlkin Qalıq',
                            counterpartyName: 'Hesab Sahibi',
                            description: 'Bank hesabının açılış qalığı',
                        },
                    ],
                });
                b.currentBalance = openingBalance;
            } catch (stmtErr) {
                console.warn('Initial balance statement error:', stmtErr);
            }
        }

        return {
            id: b.id,
            bankName: b.bankName || bankName,
            accountName: data.accountName || bankName,
            accountNumber: b.accountNumber || accountNumber,
            iban: b.accountNumber || accountNumber,
            branchName: data.branchName,
            swiftCode,
            currency: b.currency || currency,
            currentBalance: typeof b.currentBalance === 'number' ? b.currentBalance : openingBalance,
            glAccountId,
            glAccountCode: data.glAccountCode,
            glAccountName: data.glAccountName,
            accountType: data.accountType || 'Bank',
            isActive: true,
            createdAt: nowIso,
            totalDeposits: openingBalance,
            totalWithdrawals: 0,
            statementsCount: openingBalance > 0 ? 1 : 0,
        };
    },

    async createCashDesk(data: {
        name: string;
        currency?: string;
        glAccountId?: string;
        openingBalance?: number;
    }): Promise<any> {
        const currency = (data.currency || 'AZN').trim().toUpperCase();
        const isValidGuid = (id?: string | null): boolean =>
            Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id).trim()));

        const glAccountId = isValidGuid(data.glAccountId) ? String(data.glAccountId).trim() : undefined;

        const payload: Record<string, any> = {
            name: data.name.trim(),
            currency,
        };
        if (glAccountId) {
            payload.glAccountId = glAccountId;
        }

        const response = await httpClient.post<any>('/Treasury/cash-desks', payload);
        const cd = response.data;
        const nowIso = new Date().toISOString();

        saveBankMetadata(cd.id, {
            accountName: cd.name,
            glAccountId,
            accountType: 'Cash',
            isActive: true,
            createdAt: nowIso,
        });

        return cd;
    },

    async updateBankAccount(id: string, data: UpdateBankAccountRequest): Promise<BankAccountDto> {
        saveBankMetadata(id, {
            branchName: data.branchName,
            accountName: data.accountName,
            swiftCode: data.swiftCode,
            iban: data.accountNumber || data.iban,
            glAccountId: data.glAccountId,
            isActive: data.isActive,
        });

        try {
            const response = await httpClient.put<BankAccountDto>(`/Treasury/bank-accounts/${id}`, data);
            return response.data;
        } catch {
            return await this.getBankAccount(id);
        }
    },

    async importBankStatement(dto: {
        bankAccountId: string;
        statementNumber?: string;
        statementDate?: string;
        openingBalance?: number;
        closingBalance: number;
        lines?: Array<{
            transactionDate?: string;
            amount: number;
            reference?: string;
            counterpartyName?: string;
            description?: string;
        }>;
    }): Promise<any> {
        const opening = Number(dto.openingBalance) || 0;
        const closing = Number(dto.closingBalance) || 0;
        const diff = closing - opening;
        const nowIso = new Date().toISOString();
        const stmtDate = dto.statementDate ? new Date(dto.statementDate).toISOString() : nowIso;
        const stmtNum = dto.statementNumber || `BS-${nowIso.slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

        const lines = (dto.lines && dto.lines.length > 0)
            ? dto.lines.map((l, idx) => ({
                id: `stmt-line-${Date.now()}-${idx}`,
                transactionDate: l.transactionDate ? new Date(l.transactionDate).toISOString() : stmtDate,
                amount: Number(l.amount) || 0,
                reference: l.reference || 'Mədaxil/Məxaric',
                counterpartyName: l.counterpartyName || 'Bank Əməliyyatı',
                description: l.description || 'Hesab hərəkəti',
                status: 'Reconciled',
            }))
            : [
                {
                    id: `stmt-line-${Date.now()}-0`,
                    transactionDate: stmtDate,
                    amount: diff !== 0 ? diff : closing,
                    reference: 'Balans Təyini / Mədaxil',
                    counterpartyName: 'Hesab Sahibi',
                    description: 'İlkin qalıq və ya balans artırılması',
                    status: 'Reconciled',
                },
            ];

        const payload = {
            bankAccountId: dto.bankAccountId,
            statementNumber: stmtNum,
            statementDate: stmtDate,
            openingBalance: opening,
            closingBalance: closing,
            lines: lines.map((l) => ({
                transactionDate: l.transactionDate,
                amount: l.amount,
                reference: l.reference,
                counterpartyName: l.counterpartyName,
                description: l.description,
            })),
        };

        const response = await httpClient.post<any>('/Treasury/bank-statements/import', payload);
        const resData = response.data;

        const fullStatement = {
            id: resData.id || `BS-ID-${Date.now()}`,
            bankAccountId: dto.bankAccountId,
            statementNumber: resData.statementNumber || stmtNum,
            statementDate: stmtDate,
            openingBalance: opening,
            closingBalance: closing,
            totalDeposits: lines.filter((l) => l.amount > 0).reduce((sum, l) => sum + l.amount, 0),
            totalWithdrawals: lines.filter((l) => l.amount < 0).reduce((sum, l) => sum + Math.abs(l.amount), 0),
            lines,
            createdAt: nowIso,
        };

        saveStoredStatement(fullStatement);
        return fullStatement;
    },

    async getBankStatements(bankAccountId?: string): Promise<any[]> {
        return getStoredStatements(bankAccountId);
    },

    // Payments
    async getPayments(params?: {
        paymentType?: string;
        partyType?: string;
        partyId?: string;
        bankAccountId?: string;
        fromDate?: string;
        toDate?: string;
        page?: number;
        pageSize?: number;
    }): Promise<PaymentDto[]> {
        const localPayments = getStoredPayments();
        let apiPayments: PaymentDto[] = [];

        try {
            const response = await httpClient.get<any[]>('/payments', { params });
            if (Array.isArray(response.data)) {
                apiPayments = response.data.map((p: any) => ({
                    id: p.id,
                    paymentNumber: p.paymentNumber,
                    paymentType: (p.type === 1 || p.type === 2) ? 'Incoming' : 'Outgoing',
                    rawType: p.type,
                    partyType: p.partyType || (p.type <= 2 ? 'Customer' : 'Supplier'),
                    partyId: p.partyId,
                    paymentDate: p.paymentDate,
                    postingDate: p.postingDate,
                    amount: p.totalAmount,
                    allocatedAmount: p.allocatedAmount,
                    unallocatedAmount: p.unallocatedAmount,
                    currency: p.currency || 'AZN',
                    paymentMethod: 'BankTransfer',
                    status: p.status === 4 ? 'Posted' : 'Draft',
                    rawStatus: p.status,
                    bankAccountId: '',
                }));
            }
        } catch {
            // Backend has no GET /api/payments, local storage handles persistence cleanly
        }

        // Merge API records with local cache
        const mergedMap = new Map<string, PaymentDto>();
        for (const p of apiPayments) {
            mergedMap.set(p.id, p);
        }
        for (const p of localPayments) {
            const existing = mergedMap.get(p.id);
            if (existing) {
                mergedMap.set(p.id, { ...p, ...existing, status: existing.status || p.status });
            } else {
                mergedMap.set(p.id, p);
            }
        }

        let list = Array.from(mergedMap.values());

        // Apply filters
        if (params?.paymentType && params.paymentType !== 'ALL') {
            list = list.filter((p) => p.paymentType === params.paymentType);
        }
        if (params?.partyType) {
            list = list.filter((p) => p.partyType === params.partyType);
        }
        if (params?.partyId) {
            list = list.filter((p) => p.partyId === params.partyId);
        }

        // Sort by date descending
        list.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

        return list;
    },

    async getPayment(id: string): Promise<PaymentDto> {
        const local = getStoredPayments().find((p) => p.id === id);
        try {
            const response = await httpClient.get<any>(`/payments/${id}`);
            const p = response.data;
            return {
                ...(local || {}),
                id: p.id,
                paymentNumber: p.paymentNumber,
                paymentType: (p.type === 1 || p.type === 2) ? 'Incoming' : 'Outgoing',
                rawType: p.type,
                partyType: p.partyType || (p.type <= 2 ? 'Customer' : 'Supplier'),
                partyId: p.partyId,
                paymentDate: p.paymentDate,
                postingDate: p.postingDate,
                amount: p.totalAmount,
                allocatedAmount: p.allocatedAmount,
                unallocatedAmount: p.unallocatedAmount,
                currency: p.currency || 'AZN',
                status: p.status === 4 ? 'Posted' : 'Draft',
                rawStatus: p.status,
            } as PaymentDto;
        } catch {
            if (local) return local;
            throw new Error('Ödəniş tapılmadı.');
        }
    },

    async createPayment(data: CreatePaymentRequest | any): Promise<PaymentDto> {
        const isValidGuid = (id?: string | null): boolean =>
            Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id).trim()));

        // 1. Resolve Bank/Cash GL Account ID (Must reference Accounts table)
        let glAccountId = isValidGuid(data.glAccountId)
            ? String(data.glAccountId).trim()
            : (isValidGuid(data.bankOrCashAccountId) ? String(data.bankOrCashAccountId).trim() : undefined);

        // If not directly given, check bankAccountId
        if (!glAccountId && data.bankAccountId) {
            try {
                const banks = await paymentService.getBankAccounts();
                const matchedBank = banks.find((b) => b.id === data.bankAccountId);
                if (matchedBank?.glAccountId && isValidGuid(matchedBank.glAccountId)) {
                    glAccountId = matchedBank.glAccountId;
                }
            } catch {
                // ignore
            }
        }

        // If still not resolved, query GL accounts from accountsService
        if (!glAccountId) {
            try {
                const accounts = await accountsService.getAccounts();
                const isCash = data.paymentMethod === 'Cash' || String(data.bankAccountName || '').toLowerCase().includes('kassa');

                if (isCash) {
                    const cashAcc = accounts.find((a: any) => a.code === '1010' || String(a.name || '').toLowerCase().includes('kassa') || Number(a.type) === 2);
                    if (cashAcc?.id && isValidGuid(cashAcc.id)) {
                        glAccountId = cashAcc.id;
                    }
                } else {
                    const bankAcc = accounts.find((a: any) => a.code === '1020' || String(a.name || '').toLowerCase().includes('bank') || Number(a.type) === 3);
                    if (bankAcc?.id && isValidGuid(bankAcc.id)) {
                        glAccountId = bankAcc.id;
                    }
                }

                // If still not found, fallback to any Asset account
                if (!glAccountId) {
                    const assetAcc = accounts.find((a: any) => Number(a.category) === 1 || String(a.category || a.type || '').toLowerCase() === 'asset');
                    if (assetAcc?.id && isValidGuid(assetAcc.id)) {
                        glAccountId = assetAcc.id;
                    }
                }
            } catch {
                // ignore
            }
        }

        if (!glAccountId || !isValidGuid(glAccountId)) {
            throw new Error('Bank və ya Kassa üçün Mühasibatlıq Hesabı (GL Account) tapılmadı. Hesablar Planında 1020 və ya 1010 hesabının mövcud olduğunu yoxlayın.');
        }

        // 2. Resolve PaymentType enum (1: CustomerReceipt, 2: CustomerAdvance, 3: SupplierPayment, 4: SupplierAdvance, 5: InternalTransfer)
        let paymentTypeEnum = 1;
        if (typeof data.type === 'number' && data.type >= 1 && data.type <= 5) {
            paymentTypeEnum = data.type;
        } else if (data.paymentType === 'Outgoing' || data.partyType === 'Supplier') {
            paymentTypeEnum = data.isAdvance ? 4 : 3;
        } else {
            paymentTypeEnum = data.isAdvance ? 2 : 1;
        }

        // 3. Resolve PartyId & PartyType
        const partyId = isValidGuid(data.partyId) ? String(data.partyId).trim() : null;
        let partyType: string | null = null;
        if (partyId) {
            partyType = data.partyType || (paymentTypeEnum <= 2 ? 'Customer' : 'Supplier');
        }

        // 4. Resolve Amount & Dates
        const totalAmount = Number(data.amount) || Number(data.totalAmount) || 0;
        if (totalAmount <= 0) {
            throw new Error('Ödəniş məbləği 0-dan böyük olmalıdır.');
        }

        const nowIso = new Date().toISOString();
        const paymentDate = data.paymentDate ? new Date(data.paymentDate).toISOString() : nowIso;
        const postingDate = data.postingDate ? new Date(data.postingDate).toISOString() : paymentDate;

        // 5. Construct CreatePaymentDto payload for backend
        const payload: Record<string, any> = {
            type: paymentTypeEnum,
            paymentDate,
            postingDate,
            bankOrCashAccountId: glAccountId,
            currency: (data.currency || 'AZN').trim().toUpperCase(),
            exchangeRate: Number(data.exchangeRate) || 1.0,
            totalAmount,
            allocations: Array.isArray(data.allocations) ? data.allocations : [],
        };

        if (partyId) {
            payload.partyId = partyId;
            payload.partyType = partyType;
        }

        if (data.reference || data.referenceNumber) {
            payload.referenceNumber = String(data.reference || data.referenceNumber).trim();
        }

        if (data.notes) {
            payload.notes = String(data.notes).trim();
        }

        // Send to backend POST /api/payments
        const response = await httpClient.post<any>('/payments', payload);
        const resData = response.data;

        // Check if autoPost requested
        let finalStatus = resData?.status === 4 ? 'Posted' : 'Draft';
        let rawStatus = resData?.status ?? 1;

        if (data.autoPost && resData?.id) {
            try {
                const postRes = await httpClient.post<any>(`/payments/${resData.id}/post`);
                finalStatus = 'Posted';
                rawStatus = postRes.data?.status ?? 4;
            } catch (postErr) {
                console.warn('Payment created as draft, but auto-post failed:', postErr);
            }
        }

        // Assemble full DTO
        const created: PaymentDto = {
            id: resData.id,
            paymentNumber: resData.paymentNumber || `PAY-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
            paymentType: (paymentTypeEnum === 1 || paymentTypeEnum === 2) ? 'Incoming' : 'Outgoing',
            rawType: paymentTypeEnum,
            partyType: partyType || (paymentTypeEnum <= 2 ? 'Customer' : 'Supplier'),
            partyId: partyId || '',
            partyName: data.partyName || (partyType === 'Customer' ? 'Müştəri' : 'Təchizatçı'),
            bankAccountId: data.bankAccountId || '',
            bankAccountName: data.bankAccountName || (data.paymentMethod === 'Cash' ? 'Kassa' : 'Bank Hesabı'),
            glAccountId,
            paymentDate: resData.paymentDate || paymentDate,
            postingDate: resData.postingDate || postingDate,
            amount: resData.totalAmount || totalAmount,
            allocatedAmount: resData.allocatedAmount || 0,
            unallocatedAmount: resData.unallocatedAmount !== undefined ? resData.unallocatedAmount : totalAmount,
            currency: payload.currency,
            exchangeRate: payload.exchangeRate,
            paymentMethod: data.paymentMethod || 'BankTransfer',
            reference: payload.referenceNumber || '',
            notes: payload.notes || '',
            status: finalStatus,
            rawStatus,
            createdAt: new Date().toISOString(),
        };

        // Cache in localStorage
        const stored = getStoredPayments();
        const filtered = stored.filter((p) => p.id !== created.id);
        filtered.unshift(created);
        saveStoredPayments(filtered);

        return created;
    },

    async postPayment(id: string): Promise<PaymentDto> {
        const response = await httpClient.post<any>(`/payments/${id}/post`);
        const resData = response.data;

        // Update in localStorage
        const stored = getStoredPayments();
        let updatedItem: PaymentDto | null = null;
        const updated: PaymentDto[] = stored.map((p) => {
            if (p.id === id) {
                const item: PaymentDto = {
                    ...p,
                    ...(resData || {}),
                    status: 'Posted',
                    rawStatus: 4,
                    allocatedAmount: resData?.allocatedAmount ?? p.allocatedAmount ?? p.amount,
                    unallocatedAmount: resData?.unallocatedAmount ?? 0,
                };
                updatedItem = item;
                return item;
            }
            return p;
        });
        saveStoredPayments(updated);

        return updatedItem || (resData ? { ...resData, status: 'Posted', rawStatus: 4 } : ({ id, status: 'Posted', rawStatus: 4 } as any));
    },

    async cancelPayment(id: string): Promise<void> {
        // Fallback backward compatibility: redirects to postPayment
        await paymentService.postPayment(id);
    },

    // Payment Runs
    async getPaymentRuns(params?: { bankAccountId?: string; status?: string; page?: number; pageSize?: number }): Promise<PaymentRunDto[]> {
        try {
            const response = await httpClient.get<PaymentRunDto[]>('/Treasury/payment-runs', { params });
            return Array.isArray(response.data) ? response.data : [];
        } catch {
            return [];
        }
    },

    async getPaymentRun(id: string): Promise<PaymentRunDto> {
        const response = await httpClient.get<PaymentRunDto>(`/Treasury/payment-runs/${id}`);
        return response.data;
    },

    async createPaymentRun(data: CreatePaymentRunRequest | any): Promise<PaymentRunDto> {
        const response = await httpClient.post<PaymentRunDto>('/Treasury/payment-runs', data);
        return response.data;
    },

    async executePaymentRun(id: string): Promise<void> {
        await httpClient.post(`/Treasury/payment-runs/${id}/post`);
    },
};

export default paymentService;

import httpClient from './httpClient';
import type {
    TrialBalanceResponse,
    BalanceSheetResponse,
    IncomeStatementResponse,
    AgingReportResponse,
} from '../dto';

function normalizeAgingReport(data: any, defaultPartyType: 'Customer' | 'Supplier'): AgingReportResponse {
    const rawParties = Array.isArray(data?.parties)
        ? data.parties
        : Array.isArray(data?.entries)
        ? data.entries
        : Array.isArray(data)
        ? data
        : [];

    const parties: any[] = rawParties.map((p: any) => {
        const cur = Number(p.currentNotDue ?? p.current ?? 0);
        const d1 = Number(p.days1To30 ?? 0);
        const d31 = Number(p.days31To60 ?? 0);
        const d61 = Number(p.days61To90 ?? 0);
        const d90 = Number(p.days90Plus ?? p.daysOver90 ?? 0);
        const tot = Number(p.totalOutstanding ?? p.total ?? (cur + d1 + d31 + d61 + d90));

        return {
            partyId: p.partyId || `party-${Math.random()}`,
            partyCode: p.partyCode || '',
            partyName: p.partyName || 'Naməlum Tərəf',
            currentNotDue: cur,
            days1To30: d1,
            days31To60: d31,
            days61To90: d61,
            days90Plus: d90,
            totalOutstanding: tot,
            current: cur,
            daysOver90: d90,
            total: tot,
        };
    });

    const curTotal = Number(data?.currentNotDue ?? data?.totalCurrent ?? parties.reduce((sum, p) => sum + p.currentNotDue, 0));
    const d1Total = Number(data?.days1To30 ?? data?.total1To30 ?? parties.reduce((sum, p) => sum + p.days1To30, 0));
    const d31Total = Number(data?.days31To60 ?? data?.total31To60 ?? parties.reduce((sum, p) => sum + p.days31To60, 0));
    const d61Total = Number(data?.days61To90 ?? data?.total61To90 ?? parties.reduce((sum, p) => sum + p.days61To90, 0));
    const d90Total = Number(data?.days90Plus ?? data?.totalOver90 ?? parties.reduce((sum, p) => sum + p.days90Plus, 0));
    const grandTot = Number(data?.totalOutstanding ?? data?.grandTotal ?? (curTotal + d1Total + d31Total + d61Total + d90Total));

    return {
        asOfDate: data?.asOfDate || new Date().toISOString(),
        partyType: data?.partyType || defaultPartyType,
        reportType: defaultPartyType === 'Customer' ? 'AR' : 'AP',
        totalOutstanding: grandTot,
        currentNotDue: curTotal,
        days1To30: d1Total,
        days31To60: d31Total,
        days61To90: d61Total,
        days90Plus: d90Total,
        parties,
        entries: parties,
        totalCurrent: curTotal,
        total1To30: d1Total,
        total31To60: d31Total,
        total61To90: d61Total,
        totalOver90: d90Total,
        grandTotal: grandTot,
    };
}

function normalizeSection(rawSection: any): any {
    if (!rawSection) return { title: '', subtotal: 0, lines: [] };
    const accounts = Array.isArray(rawSection.accounts) ? rawSection.accounts : Array.isArray(rawSection.lines) ? rawSection.lines : [];
    const lines = accounts.map((a: any) => ({
        accountCode: a.code || a.accountCode || '',
        accountName: a.name || a.accountName || '',
        amount: Number(a.amount ?? 0),
        level: a.level || 1,
    }));
    const subtotal = Number(rawSection.subTotal ?? rawSection.subtotal ?? lines.reduce((sum: number, l: any) => sum + l.amount, 0));
    return {
        title: rawSection.sectionName || rawSection.title || '',
        subtotal,
        lines,
    };
}

export const reportsService = {
    async getTrialBalance(asOfDate?: string): Promise<TrialBalanceResponse> {
        const response = await httpClient.get<any>('/Reports/trial-balance', {
            params: { asOfDate: asOfDate || new Date().toISOString().split('T')[0] },
        });
        const data = response.data || {};
        const rawLines = Array.isArray(data.lines) ? data.lines : Array.isArray(data.items) ? data.items : [];

        const items = rawLines.map((l: any) => {
            const deb = Number(l.debit ?? l.debitTotal ?? 0);
            const crd = Number(l.credit ?? l.creditTotal ?? 0);
            const net = Number(l.netBalance ?? l.closingBalance ?? (deb - crd));
            return {
                accountId: l.accountId || `acc-${Math.random()}`,
                accountCode: l.accountCode || '',
                accountName: l.accountName || '',
                accountType: l.category || l.accountType || 'Asset',
                openingBalance: Number(l.openingBalance ?? 0),
                debitTotal: deb,
                creditTotal: crd,
                closingBalance: net,
                debit: deb,
                credit: crd,
                netBalance: net,
            };
        });

        const totalDebit = Number(data.totalDebit ?? items.reduce((sum: number, i: any) => sum + i.debitTotal, 0));
        const totalCredit = Number(data.totalCredit ?? items.reduce((sum: number, i: any) => sum + i.creditTotal, 0));
        const isBalanced = data.isBalanced !== undefined ? Boolean(data.isBalanced) : Math.abs(totalDebit - totalCredit) < 0.001;

        return {
            asOfDate: data.asOfDate || asOfDate || new Date().toISOString(),
            totalDebit,
            totalCredit,
            isBalanced,
            items,
            lines: items,
        } as any;
    },

    async getBalanceSheet(asOfDate?: string): Promise<BalanceSheetResponse> {
        const response = await httpClient.get<any>('/Reports/balance-sheet', {
            params: { asOfDate: asOfDate || new Date().toISOString().split('T')[0] },
        });
        const data = response.data || {};

        const rawAssets = Array.isArray(data.assetSections) ? data.assetSections : Array.isArray(data.assets) ? data.assets : [];
        const rawLiabs = Array.isArray(data.liabilitySections) ? data.liabilitySections : Array.isArray(data.liabilities) ? data.liabilities : [];
        const rawEquity = Array.isArray(data.equitySections) ? data.equitySections : Array.isArray(data.equity) ? data.equity : [];

        const assets = rawAssets.map(normalizeSection);
        const liabilities = rawLiabs.map(normalizeSection);
        const equity = rawEquity.map(normalizeSection);

        const totalAssets = Number(data.totalAssets ?? assets.reduce((sum: number, s: any) => sum + s.subtotal, 0));
        const totalLiabilities = Number(data.totalLiabilities ?? liabilities.reduce((sum: number, s: any) => sum + s.subtotal, 0));
        const totalEquity = Number(data.totalEquity ?? equity.reduce((sum: number, s: any) => sum + s.subtotal, 0));
        const retainedEarnings = Number(data.retainedEarningsCurrentYear ?? 0);

        return {
            asOfDate: data.asOfDate || asOfDate || new Date().toISOString(),
            currency: 'AZN',
            assets,
            assetSections: assets,
            totalAssets,
            liabilities,
            liabilitySections: liabilities,
            totalLiabilities,
            equity,
            equitySections: equity,
            totalEquity,
            retainedEarningsCurrentYear: retainedEarnings,
            totalLiabilitiesAndEquity: totalLiabilities + totalEquity + retainedEarnings,
        } as any;
    },

    async getIncomeStatement(fromDate?: string, toDate?: string): Promise<IncomeStatementResponse> {
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        const endOfToday = today.toISOString().split('T')[0];

        const response = await httpClient.get<any>('/Reports/income-statement', {
            params: {
                fromDate: fromDate || startOfYear,
                toDate: toDate || endOfToday,
            },
        });
        const data = response.data || {};

        const rawRevs = Array.isArray(data.revenueSections) ? data.revenueSections : Array.isArray(data.revenues) ? data.revenues : [];
        const rawCogs = Array.isArray(data.cogsSections) ? data.cogsSections : Array.isArray(data.costOfGoodsSold) ? data.costOfGoodsSold : [];
        const rawExps = Array.isArray(data.expenseSections) ? data.expenseSections : Array.isArray(data.expenses) ? data.expenses : [];

        const revenues = rawRevs.map(normalizeSection);
        const costOfGoodsSold = rawCogs.map(normalizeSection);
        const expenses = rawExps.map(normalizeSection);

        const totalRevenue = Number(data.totalRevenue ?? revenues.reduce((sum: number, s: any) => sum + s.subtotal, 0));
        const totalCostOfGoodsSold = Number(data.totalCostOfGoodsSold ?? costOfGoodsSold.reduce((sum: number, s: any) => sum + s.subtotal, 0));
        const totalOperatingExpenses = Number(data.totalOperatingExpenses ?? expenses.reduce((sum: number, s: any) => sum + s.subtotal, 0));
        const grossProfit = Number(data.grossProfit ?? (totalRevenue - totalCostOfGoodsSold));
        const netIncome = Number(data.netIncome ?? data.netProfit ?? (grossProfit - totalOperatingExpenses));

        return {
            fromDate: data.fromDate || fromDate || startOfYear,
            toDate: data.toDate || toDate || endOfToday,
            currency: 'AZN',
            revenues,
            revenueSections: revenues,
            totalRevenue,
            costOfGoodsSold,
            totalCostOfGoodsSold,
            grossProfit,
            expenses,
            expenseSections: expenses,
            totalExpenses: totalOperatingExpenses,
            totalOperatingExpenses,
            operatingIncome: grossProfit - totalOperatingExpenses,
            netIncome,
            netProfit: netIncome,
        } as any;
    },

    async getArAging(asOfDate?: string): Promise<AgingReportResponse> {
        const response = await httpClient.get<any>('/Reports/aging', {
            params: {
                partyType: 'Customer',
                asOfDate: asOfDate ? new Date(asOfDate).toISOString() : new Date().toISOString(),
            },
        });
        return normalizeAgingReport(response.data, 'Customer');
    },

    async getApAging(asOfDate?: string): Promise<AgingReportResponse> {
        const response = await httpClient.get<any>('/Reports/aging', {
            params: {
                partyType: 'Supplier',
                asOfDate: asOfDate ? new Date(asOfDate).toISOString() : new Date().toISOString(),
            },
        });
        return normalizeAgingReport(response.data, 'Supplier');
    },
};

export default reportsService;

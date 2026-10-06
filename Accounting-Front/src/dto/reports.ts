export interface TrialBalanceItemDto {
    accountId: string;
    accountCode: string;
    accountName: string;
    accountType?: string;
    category?: string;
    openingBalance?: number;
    debitTotal?: number;
    creditTotal?: number;
    closingBalance?: number;
    debit?: number;
    credit?: number;
    netBalance?: number;
}

export interface TrialBalanceResponse {
    asOfDate: string;
    totalDebit: number;
    totalCredit: number;
    isBalanced: boolean;
    items?: TrialBalanceItemDto[];
    lines?: TrialBalanceItemDto[];
}

export interface FinancialStatementLineDto {
    accountCode: string;
    accountName: string;
    amount: number;
    level?: number;
    isGroup?: boolean;
    code?: string;
    name?: string;
}

export interface FinancialStatementSectionDto {
    title?: string;
    sectionName?: string;
    lines?: FinancialStatementLineDto[];
    accounts?: FinancialStatementLineDto[];
    subtotal?: number;
    subTotal?: number;
}

export interface BalanceSheetResponse {
    asOfDate: string;
    currency?: string;
    assets?: FinancialStatementSectionDto[];
    assetSections?: FinancialStatementSectionDto[];
    totalAssets: number;
    liabilities?: FinancialStatementSectionDto[];
    liabilitySections?: FinancialStatementSectionDto[];
    totalLiabilities: number;
    equity?: FinancialStatementSectionDto[];
    equitySections?: FinancialStatementSectionDto[];
    totalEquity: number;
    retainedEarningsCurrentYear?: number;
    equationHolds?: boolean;
    totalLiabilitiesAndEquity?: number;
}

export interface IncomeStatementResponse {
    fromDate: string;
    toDate: string;
    currency?: string;
    revenues?: FinancialStatementSectionDto[];
    revenueSections?: FinancialStatementSectionDto[];
    totalRevenue: number;
    costOfGoodsSold?: FinancialStatementSectionDto[];
    cogsSections?: FinancialStatementSectionDto[];
    totalCostOfGoodsSold: number;
    grossProfit: number;
    expenses?: FinancialStatementSectionDto[];
    expenseSections?: FinancialStatementSectionDto[];
    totalExpenses?: number;
    totalOperatingExpenses?: number;
    operatingIncome?: number;
    netOperatingProfit?: number;
    netIncome?: number;
    netProfit?: number;
}

export interface AgingBucketDto {
    partyId: string;
    partyCode?: string;
    partyName: string;
    currentNotDue: number;
    days1To30: number;
    days31To60: number;
    days61To90: number;
    days90Plus: number;
    totalOutstanding: number;

    // Backward compatibility aliases
    current?: number;
    daysOver90?: number;
    total?: number;
}

export interface AgingReportResponse {
    asOfDate: string;
    partyType: 'Customer' | 'Supplier' | string;
    totalOutstanding: number;
    currentNotDue: number;
    days1To30: number;
    days31To60: number;
    days61To90: number;
    days90Plus: number;
    parties: AgingBucketDto[];

    // Backward compatibility aliases
    reportType?: 'AR' | 'AP' | string;
    totalCurrent?: number;
    total1To30?: number;
    total31To60?: number;
    total61To90?: number;
    totalOver90?: number;
    grandTotal?: number;
    entries?: AgingBucketDto[];
}


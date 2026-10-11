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
    balance?: number;
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

export interface FinancialPositionReportDto {
    asOfDate: string;
    currency: string;
    nonCurrentAssetsTotal: number;
    nonCurrentAssets: FinancialStatementLineDto[];
    currentAssetsTotal: number;
    currentAssets: FinancialStatementLineDto[];
    totalAssets: number;
    nonCurrentLiabilitiesTotal: number;
    nonCurrentLiabilities: FinancialStatementLineDto[];
    currentLiabilitiesTotal: number;
    currentLiabilities: FinancialStatementLineDto[];
    totalLiabilities: number;
    shareCapitalTotal: number;
    shareCapitalAccounts: FinancialStatementLineDto[];
    retainedEarningsTotal: number;
    retainedEarningsAccounts: FinancialStatementLineDto[];
    otherEquityReservesTotal: number;
    otherEquityAccounts: FinancialStatementLineDto[];
    currentYearProfitOrLoss: number;
    totalEquity: number;
    totalLiabilitiesAndEquity: number;
    equationHolds: boolean;
}

export interface ProfitOrLossReportDto {
    fromDate: string;
    toDate: string;
    currency: string;
    operatingRevenueTotal: number;
    operatingRevenueItems: FinancialStatementLineDto[];
    costOfGoodsSoldTotal: number;
    costOfGoodsSoldItems: FinancialStatementLineDto[];
    grossProfit: number;
    otherOperatingIncomeTotal: number;
    otherOperatingIncomeItems: FinancialStatementLineDto[];
    sellingAndMarketingExpensesTotal: number;
    sellingAndMarketingExpensesItems: FinancialStatementLineDto[];
    administrativeExpensesTotal: number;
    administrativeExpensesItems: FinancialStatementLineDto[];
    operatingProfit: number;
    financialIncomeTotal: number;
    financialIncomeItems: FinancialStatementLineDto[];
    financialExpensesTotal: number;
    financialExpensesItems: FinancialStatementLineDto[];
    profitBeforeTax: number;
    taxExpensesTotal: number;
    taxExpensesItems: FinancialStatementLineDto[];
    otherIncomeTotal: number;
    otherExpensesTotal: number;
    netProfitOrLoss: number;
}

export interface EquityMovementRowDto {
    description: string;
    shareCapital: number;
    retainedEarnings: number;
    otherReserves: number;
    totalEquity: number;
}

export interface ChangesInEquityReportDto {
    fromDate: string;
    toDate: string;
    currency: string;
    openingBalance: EquityMovementRowDto;
    netProfitForPeriod: EquityMovementRowDto;
    capitalContributions: EquityMovementRowDto;
    dividendsDistributed: EquityMovementRowDto;
    closingBalance: EquityMovementRowDto;
}

export interface CashFlowReportDto {
    fromDate: string;
    toDate: string;
    currency: string;
    customerReceipts: number;
    supplierPayments: number;
    operatingCashExpenses: number;
    netCashFromOperatingActivities: number;
    fixedAssetPurchases: number;
    fixedAssetSales: number;
    netCashFromInvestingActivities: number;
    loansReceived: number;
    loansRepaid: number;
    capitalInjections: number;
    netCashFromFinancingActivities: number;
    netIncreaseInCash: number;
    openingCashAndEquivalents: number;
    closingCashAndEquivalents: number;
}



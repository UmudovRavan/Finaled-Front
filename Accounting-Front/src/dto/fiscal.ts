export interface FiscalPeriodDto {
    id: string;
    name?: string;
    periodNumber: number;
    fiscalYear: number;
    startDate: string;
    endDate: string;
    isClosed: boolean;
    status?: 'Open' | 'Closed' | 'SoftClosed' | 'Locked' | number;
    fiscalYearId?: string;
    closedAt?: string;
    closedBy?: string;
    notes?: string;
}

export interface CreateFiscalPeriodRequest {
    periodNumber?: number;
    fiscalYear: number;
    startDate?: string;
    endDate?: string;
    notes?: string;
    createFullYear?: boolean;
}

export interface BankStatementLineDto {
    id?: string;
    date?: string;
    transactionDate?: string;
    description: string;
    reference?: string;
    counterpartyName?: string;
    amount: number;
    isMatched?: boolean;
}

export interface ReconciliationDto {
    id: string;
    bankAccountId: string;
    bankAccountName?: string;
    statementNumber?: string;
    statementDate: string;
    openingBalance?: number;
    statementEndingBalance: number;
    closingBalance?: number;
    bookBalance: number;
    difference: number;
    currency?: string;
    isReconciled: boolean;
    reconciledAt?: string;
    notes?: string;
    statementLines?: BankStatementLineDto[];
    createdAt?: string;
}

export interface CreateReconciliationRequest {
    bankAccountId: string;
    statementNumber?: string;
    statementDate: string;
    openingBalance?: number;
    statementEndingBalance: number;
    closingBalance?: number;
    notes?: string;
    statementLines?: {
        date?: string;
        transactionDate?: string;
        description?: string;
        reference?: string;
        counterpartyName?: string;
        amount: number;
    }[];
}

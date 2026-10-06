export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';

export interface AccountDto {
    id: string;
    code: string;
    name: string;
    type: AccountType | string | any;
    category?: any;
    isLeaf?: boolean;
    isControlAccount?: boolean;
    parentAccountId?: string | null;
    parentAccountName?: string | null;
    currency: string;
    balance: number;
    isActive: boolean;
    description?: string;
    subAccounts?: AccountDto[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateAccountRequest {
    code: string;
    name: string;
    type: AccountType | string;
    parentAccountId?: string | null;
    currency?: string;
    description?: string;
    isActive?: boolean;
}

export interface UpdateAccountRequest {
    code?: string;
    name?: string;
    type?: AccountType | string;
    parentAccountId?: string | null;
    currency?: string;
    description?: string;
    isActive?: boolean;
}

export interface InitialBalanceRequest {
    accountId: string;
    debitAmount: number;
    creditAmount: number;
    asOfDate: string;
    notes?: string;
}

export interface JournalLineDto {
    id?: string;
    accountId: string;
    accountCode?: string;
    accountName?: string;
    description?: string;
    debit: number;
    credit: number;
}

export interface JournalEntryDto {
    id: string;
    entryNumber: string;
    date: string;
    description: string;
    reference?: string;
    referenceNumber?: string;
    status: 'Draft' | 'Posted' | 'Reversed' | string;
    totalDebit: number;
    totalCredit: number;
    lines: JournalLineDto[];
    postedAt?: string;
    createdAt?: string;

    // Backward compatibility aliases
    journalNumber?: string;
    postingDate?: string;
    totalAmount?: number;
}

export interface CreateJournalEntryRequest {
    date: string;
    description: string;
    reference?: string;
    referenceNumber?: string;
    postingDate?: string;
    lines: {
        accountId: string;
        description?: string;
        debit: number;
        credit: number;
        currency?: string;
        exchangeRate?: number;
    }[];
}


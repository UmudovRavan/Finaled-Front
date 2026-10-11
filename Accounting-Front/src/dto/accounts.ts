export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';

export interface AccountDto {
    id: string;
    code: string;
    name: string;
    type: AccountType | string | any;
    typeName?: string;
    category?: any;
    categoryName?: string;
    subcategory?: number | null;
    subcategoryName?: string | null;
    isLeaf?: boolean;
    isControlAccount?: boolean;
    parentAccountId?: string | null;
    parentAccountName?: string | null;
    currency: string;
    balance: number;
    currentBalance?: number;
    openingDebit?: number;
    openingCredit?: number;
    turnoverDebit?: number;
    turnoverCredit?: number;
    closingDebit?: number;
    closingCredit?: number;
    isActive: boolean;
    description?: string;
    subAccounts?: AccountDto[];
    createdAt?: string;
    updatedAt?: string;
}

export interface AccountTreeNodeDto {
    id: string;
    code: string;
    name: string;
    category: number | string;
    categoryName: string;
    subcategory?: number | null;
    subcategoryName?: string | null;
    type: number | string;
    typeName: string;
    parentAccountId?: string | null;
    level: number;
    isLeaf: boolean;
    isControlAccount: boolean;
    isActive: boolean;
    currency: string;
    openingDebit: number;
    openingCredit: number;
    turnoverDebit: number;
    turnoverCredit: number;
    closingDebit: number;
    closingCredit: number;
    currentBalance: number;
    children: AccountTreeNodeDto[];
}

export interface AccountBalanceRowDto {
    accountId: string;
    code: string;
    name: string;
    category: number | string;
    categoryName: string;
    subcategory?: number | null;
    subcategoryName?: string | null;
    level: number;
    isLeaf: boolean;
    openingDebit: number;
    openingCredit: number;
    turnoverDebit: number;
    turnoverCredit: number;
    closingDebit: number;
    closingCredit: number;
}

export interface AccountTypeOptionDto {
    id: number;
    code: string;
    name: string;
    description: string;
}

export interface SubcategoryOptionDto {
    id: number;
    code: string;
    name: string;
}

export interface CategorySubcategoryMappingDto {
    categoryId: number;
    categoryCode: string;
    categoryName: string;
    subcategories: SubcategoryOptionDto[];
}

export interface CreateAccountRequest {
    code: string;
    name: string;
    category?: number;
    subcategory?: number | null;
    type: AccountType | string | number;
    parentAccountId?: string | null;
    currency?: string;
    isControlAccount?: boolean;
    description?: string;
    isActive?: boolean;
}

export interface UpdateAccountRequest {
    code?: string;
    name?: string;
    category?: number;
    subcategory?: number | null;
    type?: AccountType | string | number;
    parentAccountId?: string | null;
    currency?: string;
    isControlAccount?: boolean;
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


import type { BankStatementLineDto } from './fiscal';

export interface BankAccountDto {
    id: string;
    accountName: string;
    accountNumber: string;
    bankName: string;
    branchName?: string;
    swiftCode?: string;
    iban?: string;
    currency: string;
    currentBalance: number;
    glAccountId?: string;
    glAccountCode?: string;
    glAccountName?: string;
    accountType?: 'Bank' | 'Cash';
    isActive: boolean;
    createdAt?: string;
    totalDeposits?: number;
    totalWithdrawals?: number;
    statementsCount?: number;
}

export interface CreateBankAccountRequest {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branchName?: string;
    swiftCode?: string;
    iban?: string;
    currency?: string;
    glAccountId?: string;
    openingBalance?: number;
    accountType?: 'Bank' | 'Cash';
    isActive?: boolean;
}

export interface UpdateBankAccountRequest extends Partial<CreateBankAccountRequest> {}

export interface CashDeskDto {
    id: string;
    name: string;
    currency: string;
    currentBalance: number;
    glAccountId?: string;
    glAccountCode?: string;
    glAccountName?: string;
    isActive?: boolean;
    createdAt?: string;
}

export interface CreateCashDeskRequest {
    name: string;
    currency?: string;
    glAccountId?: string;
    openingBalance?: number;
}

export interface BankStatementDto {
    id: string;
    bankAccountId: string;
    bankAccountName?: string;
    statementNumber: string;
    statementDate: string;
    openingBalance: number;
    closingBalance: number;
    totalDeposits: number;
    totalWithdrawals: number;
    lines?: BankStatementLineDto[];
    createdAt?: string;
}

export interface ImportBankStatementRequest {
    bankAccountId: string;
    statementNumber?: string;
    statementDate?: string;
    openingBalance?: number;
    closingBalance: number;
    lines?: BankStatementLineDto[];
}

export interface PaymentAllocationDto {
    id?: string;
    targetDocumentType: number | string;
    targetDocumentId: string;
    targetDocumentNumber?: string;
    allocatedAmount: number;
    allocationDate?: string;
}

export interface PaymentDto {
    id: string;
    paymentNumber: string;
    paymentType: 'Incoming' | 'Outgoing' | string;
    rawType?: number;
    partyType: 'Customer' | 'Supplier' | string;
    partyId?: string;
    partyName?: string;
    bankAccountId?: string;
    bankAccountName?: string;
    glAccountId?: string;
    glAccountCode?: string;
    glAccountName?: string;
    paymentDate: string;
    postingDate?: string;
    amount: number;
    allocatedAmount?: number;
    unallocatedAmount?: number;
    currency: string;
    exchangeRate?: number;
    paymentMethod: 'BankTransfer' | 'Cash' | 'CreditCard' | 'Cheque' | string;
    reference?: string;
    invoiceId?: string;
    invoiceNumber?: string;
    status: 'Draft' | 'Submitted' | 'Approved' | 'Posted' | 'Completed' | 'Cancelled' | string;
    rawStatus?: number;
    notes?: string;
    allocations?: PaymentAllocationDto[];
    createdAt?: string;
}

export interface CreatePaymentRequest {
    paymentType: 'Incoming' | 'Outgoing' | string;
    type?: number;
    isAdvance?: boolean;
    partyType?: 'Customer' | 'Supplier' | string;
    partyId: string;
    partyName?: string;
    bankAccountId: string;
    bankAccountName?: string;
    glAccountId?: string;
    bankOrCashAccountId?: string;
    paymentDate: string;
    amount: number;
    currency?: string;
    exchangeRate?: number;
    paymentMethod: string;
    reference?: string;
    invoiceId?: string;
    notes?: string;
    autoPost?: boolean;
    allocations?: Array<{
        targetDocumentType: number;
        targetDocumentId: string;
        allocatedAmount: number;
    }>;
}

export interface PaymentRunDto {
    id: string;
    runNumber: string;
    runDate: string;
    bankAccountId: string;
    bankAccountName?: string;
    totalAmount: number;
    currency: string;
    status: 'Draft' | 'Executed' | 'Cancelled' | string;
    paymentCount: number;
    executedAt?: string;
    notes?: string;
    createdAt?: string;
}

export interface CreatePaymentRunRequest {
    runDate: string;
    bankAccountId: string;
    supplierInvoiceIds: string[];
    notes?: string;
}

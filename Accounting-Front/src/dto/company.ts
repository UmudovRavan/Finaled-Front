export interface CompanyHeaderDto {
    companyName: string;
    taxNumber: string;
    baseCurrency: string;
    logoUrl?: string | null;
    activeFiscalYear?: string | null;
    activeFiscalPeriod?: string | null;
}

export interface CompanyProfileDto {
    id: string;
    name: string;
    taxNumber: string; // VÖEN
    baseCurrency: string;
    country: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    legalForm: string; // MMC, ASC, etc.
    taxRegime: string; // ƏDV ödəyicisi
    isVatPayer: boolean;
    vatRate: number; // 18.0
    fiscalYearStartMonth: number;
    fiscalYearEndMonth: number;
    logoUrl?: string | null;
    directorName?: string | null;
    chiefAccountantName?: string | null;
    bankName?: string | null;
    bankCode?: string | null;
    bankAccountNumber?: string | null;
    iban?: string | null;
    swiftBic?: string | null;
    correspondentAccount?: string | null;
    statisticalCode?: string | null;
    asanLoginId?: string | null;
}

export interface UpdateCompanyProfileDto {
    name: string;
    taxNumber: string;
    baseCurrency: string;
    country: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    legalForm: string;
    taxRegime: string;
    isVatPayer: boolean;
    vatRate: number;
    fiscalYearStartMonth: number;
    fiscalYearEndMonth: number;
    logoUrl?: string | null;
    directorName?: string | null;
    chiefAccountantName?: string | null;
    bankName?: string | null;
    bankCode?: string | null;
    bankAccountNumber?: string | null;
    iban?: string | null;
    swiftBic?: string | null;
    correspondentAccount?: string | null;
    statisticalCode?: string | null;
    asanLoginId?: string | null;
}

export interface CompanyDefaultAccountsDto {
    defaultReceivableAccountId?: string | null;
    defaultPayableAccountId?: string | null;
    defaultStockAccountId?: string | null;
    defaultGRNIAccountId?: string | null;
    defaultCOGSAccountId?: string | null;
    defaultRetainedEarningsAccountId?: string | null;
    defaultInputVatAccountId?: string | null;
    defaultOutputVatAccountId?: string | null;
    defaultRevenueAccountId?: string | null;
    defaultFXGainLossAccountId?: string | null;
}

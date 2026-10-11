export interface MasterDataSummaryDto {
    customersCount: number;
    suppliersCount: number;
    warehousesCount: number;
    itemsCount: number;
    fixedAssetsCount: number;
    bankAccountsCount: number;
    taxCodesCount: number;
    accountsCount: number;
}

export interface MasterDataTabItemDto {
    key: string;
    titleAz: string;
    titleEn: string;
    count: number;
    apiEndpoint: string;
}

export interface InitialBalanceLineInputDto {
    accountId: string;
    debit: number;
    credit: number;
    description?: string;
}

export interface SetInitialBalancesDto {
    actNumber: string;
    actDate: string;
    attachmentUrl?: string | null;
    notes?: string | null;
    lines: InitialBalanceLineInputDto[];
}

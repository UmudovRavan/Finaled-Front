export interface WarehouseDto {
    id: string;
    code: string;
    name: string;
    location?: string;
    managerName?: string;
    phone?: string;
    notes?: string;
    defaultInventoryAccountId?: string;
    defaultInventoryAccountName?: string;
    isActive: boolean;
    stockItemsCount?: number;
    totalStockOnHand?: number;
    totalStockValue?: number;
    createdAt?: string;
}

export interface CreateWarehouseRequest {
    code: string;
    name: string;
    location?: string;
    managerName?: string;
    phone?: string;
    notes?: string;
    defaultInventoryAccountId?: string;
    isActive?: boolean;
}

export interface UpdateWarehouseRequest extends Partial<CreateWarehouseRequest> {}

export type StockTransactionType = 'Receipt' | 'Issue' | 'Transfer' | 'Adjustment' | string | number;

export interface StockTransactionLineInputDto {
    itemId: string;
    quantity: number;
    unitCost: number;
    costCenterId?: string;
    projectId?: string;
    description?: string;
    itemCode?: string;
    itemName?: string;
}

export interface StockTransactionLineDto extends StockTransactionLineInputDto {
    id?: string;
    totalCost?: number;
}

export interface StockTransactionDto {
    id: string;
    transactionNumber: string;
    type: StockTransactionType;
    transactionDate: string;
    postingDate: string;
    status: 'Draft' | 'Submitted' | 'Approved' | 'Posted' | 'Cancelled' | number | string;
    totalValue: number;
    sourceWarehouseId?: string;
    sourceWarehouseName?: string;
    sourceWarehouseCode?: string;
    targetWarehouseId?: string;
    targetWarehouseName?: string;
    targetWarehouseCode?: string;
    referenceNumber?: string;
    notes?: string;
    lines?: StockTransactionLineDto[];
    createdAt?: string;
}

export interface CreateStockTransactionRequest {
    type: StockTransactionType;
    transactionDate: string;
    postingDate: string;
    sourceWarehouseId: string;
    sourceWarehouseName?: string;
    targetWarehouseId?: string;
    targetWarehouseName?: string;
    referenceNumber?: string;
    notes?: string;
    lines: StockTransactionLineInputDto[];
}

export interface StockLedgerEntryDto {
    id: string;
    postingDate?: string;
    date?: string;
    itemId?: string;
    itemCode?: string;
    itemName?: string;
    warehouseId?: string;
    warehouseCode?: string;
    warehouseName?: string;
    transactionType?: string;
    sourceDocumentType?: string | number;
    sourceDocumentNumber?: string;
    referenceNumber?: string;
    qtyIn?: number;
    quantityIn?: number;
    qtyOut?: number;
    quantityOut?: number;
    unitCost?: number;
    valuationRate?: number;
    totalCost?: number;
    balanceQty?: number;
    runningBalance?: number;
    balanceValue?: number;
    notes?: string;
}

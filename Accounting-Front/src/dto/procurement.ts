export interface SupplierDto {
    id: string;
    code: string;
    name: string;
    companyName?: string;
    email?: string;
    phone?: string;
    taxNumber?: string;
    address?: string;
    city?: string;
    country?: string;
    currency?: string;
    bankAccountDetails?: string;
    paymentTermsDays?: number;
    outstandingPayable?: number;
    balance?: number;
    isActive?: boolean;
    createdAt?: string;
}

export interface CreateSupplierRequest {
    code: string;
    name: string;
    companyName?: string;
    email?: string;
    phone?: string;
    taxNumber?: string;
    address?: string;
    city?: string;
    country?: string;
    currency?: string;
    bankAccountDetails?: string;
    paymentTermsDays?: number;
    isActive?: boolean;
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {}

export interface PurchaseOrderLineDto {
    id?: string;
    itemId?: string;
    itemCode?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    lineTotal: number;
}

export interface PurchaseOrderDto {
    id: string;
    orderNumber: string;
    supplierId: string;
    supplierName?: string;
    orderDate: string;
    expectedDeliveryDate?: string;
    status: 'Draft' | 'Approved' | 'Received' | 'Cancelled' | string;
    subTotal?: number;
    taxTotal?: number;
    totalAmount?: number;
    grandTotal?: number;
    currency: string;
    notes?: string;
    lines?: PurchaseOrderLineDto[];
    createdAt?: string;
}

export interface CreatePurchaseOrderRequest {
    supplierId: string;
    orderDate: string;
    expectedDeliveryDate?: string;
    currency?: string;
    notes?: string;
    lines: {
        itemId?: string;
        description: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
    }[];
}

export interface GoodsReceiptLineDto {
    id?: string;
    purchaseOrderLineId?: string;
    itemId?: string;
    itemCode?: string;
    description: string;
    quantityReceived: number;
    receivedQuantity?: number;
    warehouseId?: string;
    warehouseName?: string;
    unitCost?: number;
    totalCost?: number;
}

export interface GoodsReceiptDto {
    id: string;
    receiptNumber: string;
    purchaseOrderId?: string;
    purchaseOrderNumber?: string;
    supplierId: string;
    supplierName?: string;
    receiptDate: string;
    postingDate?: string;
    warehouseId?: string;
    warehouseName?: string;
    waybillNumber?: string;
    status: 'Draft' | 'Submitted' | 'Approved' | 'Posted' | 'Cancelled' | number | string;
    totalValue?: number;
    notes?: string;
    lines?: GoodsReceiptLineDto[];
    createdAt?: string;
}

export interface CreateGoodsReceiptRequest {
    purchaseOrderId?: string;
    supplierId: string;
    receiptDate: string;
    postingDate?: string;
    warehouseId: string;
    waybillNumber?: string;
    notes?: string;
    lines: {
        purchaseOrderLineId?: string;
        itemId: string;
        description?: string;
        quantityReceived?: number;
        receivedQuantity?: number;
        unitCost?: number;
    }[];
}

export interface SupplierInvoiceLineDto {
    id?: string;
    itemId?: string;
    itemCode?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
    lineTotal?: number;
    expenseOrAssetAccountId?: string;
    taxCodeId?: string;
    costCenterId?: string;
    projectId?: string;
}

export interface SupplierInvoiceDto {
    id: string;
    invoiceNumber: string;
    supplierInvoiceNumber?: string;
    supplierInvoiceReference?: string;
    supplierId: string;
    supplierName?: string;
    purchaseOrderId?: string;
    goodsReceiptId?: string;
    issueDate: string;
    invoiceDate?: string;
    dueDate: string;
    postingDate?: string;
    status: 'Draft' | 'Approved' | 'Paid' | 'PartiallyPaid' | 'Cancelled' | string;
    documentStatus?: number | string;
    settlementStatus?: number | string;
    threeWayMatchStatus?: number | string;
    subTotal: number;
    taxTotal: number;
    totalAmount: number;
    grandTotal?: number;
    paidAmount: number;
    remainingAmount: number;
    outstandingAmount?: number;
    currency: string;
    notes?: string;
    lines: SupplierInvoiceLineDto[];
    createdAt?: string;
}

export interface CreateSupplierInvoiceRequest {
    supplierId: string;
    supplierInvoiceNumber?: string;
    supplierInvoiceReference?: string;
    purchaseOrderId?: string;
    goodsReceiptId?: string;
    issueDate?: string;
    invoiceDate?: string;
    dueDate?: string;
    postingDate?: string;
    currency?: string;
    exchangeRate?: number;
    isGRNIBased?: boolean;
    notes?: string;
    lines: {
        itemId?: string;
        description: string;
        quantity: number;
        unitPrice: number;
        taxRate?: number;
        expenseOrAssetAccountId?: string;
        taxCodeId?: string;
        costCenterId?: string;
        projectId?: string;
    }[];
}

export interface ThreeWayMatchResultDto {
    isMatched: boolean;
    status: 'NotApplicable' | 'Pending' | 'Matched' | 'DiscrepancyWithinTolerance' | 'OnHoldToleranceExceeded' | 'OverrideApproved' | number | string;
    quantityDifference: number;
    priceDifference: number;
    totalAmountDifference: number;
    message: string;
}

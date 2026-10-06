export interface CustomerDto {
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
    creditLimit?: number;
    paymentTermsDays?: number;
    outstandingBalance?: number;
    balance?: number;
    isActive: boolean;
    createdAt?: string;
}

export interface CreateCustomerRequest {
    code?: string;
    name: string;
    companyName?: string;
    email?: string;
    phone?: string;
    taxNumber?: string;
    address?: string;
    city?: string;
    country?: string;
    currency?: string;
    creditLimit?: number;
    paymentTermsDays?: number;
    isActive?: boolean;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {}

export interface InvoiceLineItemDto {
    id?: string;
    itemId?: string;
    itemCode?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxAmount?: number;
    lineTotal: number;
}

export interface CustomerInvoiceDto {
    id: string;
    invoiceNumber: string;
    customerId: string;
    customerName?: string;
    issueDate: string;
    invoiceDate?: string;
    dueDate: string;
    postingDate?: string;
    status: 'Draft' | 'Approved' | 'Posted' | 'Paid' | 'PartiallyPaid' | 'Overdue' | 'Cancelled' | string;
    documentStatus?: number | string;
    settlementStatus?: number | string;
    subTotal: number;
    taxTotal: number;
    totalAmount: number;
    grandTotal?: number;
    paidAmount: number;
    remainingAmount: number;
    outstandingAmount?: number;
    currency: string;
    notes?: string;
    lines: InvoiceLineItemDto[];
    createdAt?: string;
}

export interface CreateCustomerInvoiceRequest {
    customerId: string;
    issueDate: string;
    dueDate: string;
    currency?: string;
    exchangeRate?: number;
    notes?: string;
    lines: {
        itemId?: string | null;
        description: string;
        quantity: number;
        unitPrice: number;
        taxRate?: number;
        discountPercent?: number;
        revenueAccountId?: string | null;
    }[];
}

export interface PayInvoiceRequest {
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    bankAccountId?: string;
    reference?: string;
    notes?: string;
}

export interface ItemDto {
    id: string;
    code: string;
    name: string;
    type: 'StockItem' | 'NonStockItem' | 'Service' | string | number;
    rawType?: number;
    valuationMethod?: 'MovingAverage' | 'FIFO' | string | number;
    rawValuationMethod?: number;
    baseUOM?: string;
    unitOfMeasure?: string;
    description?: string;
    standardBuyingPrice?: number;
    standardSellingPrice?: number;
    unitPrice?: number;
    costPrice?: number;
    currentValuationRate?: number;
    totalStockOnHand?: number;
    totalStockValue?: number;
    inventoryAccountId?: string;
    inventoryAccountCode?: string;
    inventoryAccountName?: string;
    cogsAccountId?: string;
    cogsAccountCode?: string;
    cogsAccountName?: string;
    revenueAccountId?: string;
    revenueAccountCode?: string;
    revenueAccountName?: string;
    taxRate?: number;
    accountId?: string;
    isActive: boolean;
    createdAt?: string;
}

export interface CreateItemRequest {
    code: string;
    name: string;
    type?: 'StockItem' | 'NonStockItem' | 'Service' | number | string;
    valuationMethod?: 'MovingAverage' | 'FIFO' | number | string;
    baseUOM?: string;
    unitOfMeasure?: string;
    description?: string;
    standardBuyingPrice?: number;
    standardSellingPrice?: number;
    unitPrice?: number;
    costPrice?: number;
    inventoryAccountId?: string;
    cogsAccountId?: string;
    revenueAccountId?: string;
    taxRate?: number;
    accountId?: string;
    isActive?: boolean;
}

export interface UpdateItemRequest extends Partial<CreateItemRequest> {}

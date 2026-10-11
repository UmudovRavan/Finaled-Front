export type SalesOrderStatus = 'Draft' | 'Confirmed' | 'PartiallyDelivered' | 'FullyDelivered' | 'Invoiced' | 'Cancelled' | number;
export type DeliveryNoteStatus = 'Draft' | 'Posted' | 'Invoiced' | 'Cancelled' | number;

export interface CreateSalesOrderLineDto {
    itemId?: string | null;
    description: string;
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
    taxCodeId?: string | null;
    taxRate?: number;
}

export interface CreateSalesOrderDto {
    customerId: string;
    orderDate?: string;
    expectedDeliveryDate?: string | null;
    currency?: string;
    customerReference?: string | null;
    notes?: string | null;
    lines: CreateSalesOrderLineDto[];
}

export interface SalesOrderLineDto {
    id: string;
    itemId?: string | null;
    itemCode?: string | null;
    description: string;
    quantity: number;
    deliveredQuantity: number;
    invoicedQuantity: number;
    remainingDeliveryQuantity: number;
    unitPrice: number;
    discountPercent: number;
    taxRate: number;
    lineTotal: number;
}

export interface SalesOrderDto {
    id: string;
    orderNumber: string;
    customerId: string;
    customerName: string;
    orderDate: string;
    expectedDeliveryDate?: string | null;
    status: SalesOrderStatus;
    statusName: string;
    currency: string;
    subTotal: number;
    taxTotal: number;
    grandTotal: number;
    customerReference?: string | null;
    notes?: string | null;
    lines: SalesOrderLineDto[];
}

export interface CreateDeliveryNoteLineDto {
    salesOrderLineId?: string | null;
    itemId: string;
    description: string;
    quantity: number;
}

export interface CreateDeliveryNoteDto {
    salesOrderId?: string | null;
    customerId: string;
    warehouseId: string;
    deliveryDate?: string;
    driverName?: string | null;
    vehicleNumber?: string | null;
    trackingNumber?: string | null;
    notes?: string | null;
    lines: CreateDeliveryNoteLineDto[];
}

export interface DeliveryNoteLineDto {
    id: string;
    salesOrderLineId?: string | null;
    itemId: string;
    itemCode: string;
    itemName: string;
    description: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
}

export interface DeliveryNoteDto {
    id: string;
    deliveryNumber: string;
    salesOrderId?: string | null;
    salesOrderNumber?: string | null;
    customerId: string;
    customerName: string;
    warehouseId: string;
    warehouseName: string;
    deliveryDate: string;
    postingDate?: string | null;
    status: DeliveryNoteStatus;
    statusName: string;
    driverName?: string | null;
    vehicleNumber?: string | null;
    trackingNumber?: string | null;
    totalCost: number;
    notes?: string | null;
    lines: DeliveryNoteLineDto[];
}

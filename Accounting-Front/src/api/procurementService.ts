import httpClient from './httpClient';
import { accountsService } from './accountsService';
import { paymentService } from './paymentService';
import type {
    SupplierDto,
    CreateSupplierRequest,
    UpdateSupplierRequest,
    PurchaseOrderDto,
    CreatePurchaseOrderRequest,
    GoodsReceiptDto,
    CreateGoodsReceiptRequest,
    SupplierInvoiceDto,
    CreateSupplierInvoiceRequest,
    PayInvoiceRequest,
    ThreeWayMatchResultDto,
} from '../dto';

const isValidGuid = (id?: string | null): boolean =>
    Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id).trim()));

function toUtcIso(val?: string | Date | null, fallback?: Date): string {
    if (!val) return (fallback || new Date()).toISOString();
    if (val instanceof Date) return val.toISOString();
    const str = String(val).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        return `${str}T00:00:00.000Z`;
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? (fallback || new Date()).toISOString() : d.toISOString();
}

const INVOICE_CACHE_KEY = 'altensor_invoice_metadata_cache';

function getInvoiceCache(): Record<string, Partial<SupplierInvoiceDto>> {
    try {
        const raw = localStorage.getItem(INVOICE_CACHE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveInvoiceCache(idOrCode: string, meta: Partial<SupplierInvoiceDto>) {
    try {
        const cache = getInvoiceCache();
        cache[idOrCode] = { ...cache[idOrCode], ...meta };
        localStorage.setItem(INVOICE_CACHE_KEY, JSON.stringify(cache));
    } catch {
        // ignore
    }
}

export function normalizeSupplierInvoice(raw: any): SupplierInvoiceDto {
    if (!raw) return {} as any;
    const cache = getInvoiceCache();
    const cached = cache[raw.id] || cache[raw.invoiceNumber] || cache[raw.supplierInvoiceNumber] || {};

    const docStatus = raw.documentStatus ?? cached.documentStatus;
    const setStatus = raw.settlementStatus ?? cached.settlementStatus;

    let statusText: string = 'Draft';
    if (typeof raw.status === 'string' && raw.status) {
        statusText = raw.status;
    } else if (typeof cached.status === 'string' && cached.status) {
        statusText = cached.status;
    } else if (docStatus === 4 || docStatus === 'Posted') {
        if (setStatus === 3 || setStatus === 'Paid') statusText = 'Paid';
        else if (setStatus === 2 || setStatus === 'PartiallyPaid') statusText = 'PartiallyPaid';
        else statusText = 'Approved';
    } else if (docStatus === 5 || docStatus === 'Cancelled') {
        statusText = 'Cancelled';
    } else {
        statusText = 'Draft';
    }

    const grandTotal = Number(raw.grandTotal ?? raw.totalAmount ?? cached.grandTotal ?? 0);
    const outstandingAmount = Number(raw.outstandingAmount ?? raw.remainingAmount ?? cached.outstandingAmount ?? grandTotal);
    const paidAmount = Number(raw.paidAmount ?? cached.paidAmount ?? Math.max(0, grandTotal - outstandingAmount));
    const subTotal = Number(raw.subTotal ?? cached.subTotal ?? (grandTotal > 0 ? Number((grandTotal / 1.18).toFixed(2)) : 0));
    const taxTotal = Number(raw.taxTotal ?? cached.taxTotal ?? Math.max(0, Number((grandTotal - subTotal).toFixed(2))));

    const issueDateStr = raw.invoiceDate || raw.issueDate || cached.issueDate || raw.postingDate || new Date().toISOString();
    const dueDateStr = raw.dueDate || cached.dueDate || new Date(new Date(issueDateStr).getTime() + 30 * 86400000).toISOString();
    const postingDateStr = raw.postingDate || cached.postingDate || issueDateStr;

    const lines = Array.isArray(raw.lines) && raw.lines.length > 0 ? raw.lines : (cached.lines || []);

    return {
        id: raw.id,
        invoiceNumber: raw.invoiceNumber || cached.invoiceNumber || 'PINV-NEW',
        supplierInvoiceNumber: raw.supplierInvoiceNumber || raw.supplierInvoiceReference || cached.supplierInvoiceNumber || '',
        supplierInvoiceReference: raw.supplierInvoiceNumber || raw.supplierInvoiceReference || cached.supplierInvoiceReference || '',
        supplierId: raw.supplierId || cached.supplierId,
        supplierName: raw.supplierName || cached.supplierName || 'Təchizatçı',
        purchaseOrderId: raw.purchaseOrderId || cached.purchaseOrderId,
        goodsReceiptId: raw.goodsReceiptId || cached.goodsReceiptId,
        issueDate: issueDateStr,
        invoiceDate: issueDateStr,
        dueDate: dueDateStr,
        postingDate: postingDateStr,
        status: statusText,
        documentStatus: docStatus,
        settlementStatus: setStatus,
        threeWayMatchStatus: raw.threeWayMatchStatus ?? cached.threeWayMatchStatus,
        subTotal,
        taxTotal,
        totalAmount: grandTotal,
        grandTotal,
        paidAmount,
        remainingAmount: outstandingAmount,
        outstandingAmount,
        currency: raw.currency || cached.currency || 'AZN',
        notes: raw.notes || cached.notes || '',
        lines,
        createdAt: raw.createdAt || cached.createdAt || issueDateStr,
    };
}

const SUPPLIERS_CACHE_KEY = 'altensor_suppliers_metadata_cache';

function getSuppliersCache(): Record<string, Partial<SupplierDto>> {
    try {
        const raw = localStorage.getItem(SUPPLIERS_CACHE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveSupplierCache(idOrCode: string, meta: Partial<SupplierDto>) {
    try {
        const cache = getSuppliersCache();
        cache[idOrCode] = { ...cache[idOrCode], ...meta };
        localStorage.setItem(SUPPLIERS_CACHE_KEY, JSON.stringify(cache));
    } catch {
        // ignore
    }
}

const PO_CACHE_KEY = 'altensor_po_metadata_cache';

function getPoCache(): Record<string, Partial<PurchaseOrderDto>> {
    try {
        const raw = localStorage.getItem(PO_CACHE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function savePoCache(idOrCode: string, meta: Partial<PurchaseOrderDto>) {
    try {
        const cache = getPoCache();
        cache[idOrCode] = { ...cache[idOrCode], ...meta };
        localStorage.setItem(PO_CACHE_KEY, JSON.stringify(cache));
    } catch {
        // ignore
    }
}

const GRN_CACHE_KEY = 'altensor_grn_metadata_cache';

function getGrnCache(): Record<string, Partial<GoodsReceiptDto>> {
    try {
        const raw = localStorage.getItem(GRN_CACHE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveGrnCache(idOrCode: string, meta: Partial<GoodsReceiptDto>) {
    try {
        const cache = getGrnCache();
        cache[idOrCode] = { ...cache[idOrCode], ...meta };
        localStorage.setItem(GRN_CACHE_KEY, JSON.stringify(cache));
    } catch {
        // ignore
    }
}

function normalizeGoodsReceipt(raw: any): GoodsReceiptDto {
    if (!raw) return {} as any;
    const cache = getGrnCache();
    const cached = cache[raw.id] || cache[raw.receiptNumber] || {};

    let statusText: 'Draft' | 'Submitted' | 'Approved' | 'Posted' | 'Cancelled' = 'Draft';
    if (typeof raw.status === 'number') {
        const statusMap: Record<number, 'Draft' | 'Submitted' | 'Approved' | 'Posted' | 'Cancelled'> = {
            1: 'Draft',
            2: 'Submitted',
            3: 'Approved',
            4: 'Posted',
            5: 'Cancelled',
        };
        statusText = statusMap[raw.status] || 'Draft';
    } else if (typeof raw.status === 'string') {
        const s = raw.status.toLowerCase();
        if (s.includes('post')) statusText = 'Posted';
        else if (s.includes('appr')) statusText = 'Approved';
        else if (s.includes('sub')) statusText = 'Submitted';
        else if (s.includes('canc')) statusText = 'Cancelled';
        else statusText = 'Draft';
    }

    const lines = Array.isArray(raw.lines) && raw.lines.length > 0 ? raw.lines : (cached.lines || []);
    const totalValue = Number(raw.totalValue ?? cached.totalValue) || 
        lines.reduce((sum: number, l: any) => sum + (Number(l.receivedQuantity ?? l.quantityReceived) || 0) * (Number(l.unitCost) || 0), 0);

    return {
        id: raw.id,
        receiptNumber: raw.receiptNumber,
        purchaseOrderId: raw.purchaseOrderId || cached.purchaseOrderId,
        purchaseOrderNumber: raw.purchaseOrderNumber || cached.purchaseOrderNumber,
        supplierId: raw.supplierId || cached.supplierId,
        supplierName: raw.supplierName || cached.supplierName || 'Təchizatçı',
        receiptDate: raw.receiptDate || cached.receiptDate || new Date().toISOString(),
        postingDate: raw.postingDate || cached.postingDate || raw.receiptDate,
        warehouseId: raw.warehouseId || cached.warehouseId,
        warehouseName: raw.warehouseName || cached.warehouseName || 'Əsas Anbar',
        waybillNumber: raw.waybillNumber || cached.waybillNumber || '',
        status: statusText,
        totalValue,
        notes: raw.notes || cached.notes || '',
        lines,
        createdAt: raw.createdAt || raw.receiptDate || new Date().toISOString(),
    };
}

export const procurementService = {
    // Suppliers
    async getSuppliers(params?: { search?: string; isActive?: boolean; page?: number; pageSize?: number }): Promise<SupplierDto[]> {
        try {
            const response = await httpClient.get<SupplierDto[]>('/Procurement/suppliers', { params });
            const list = Array.isArray(response.data) ? response.data : [];
            const cache = getSuppliersCache();

            return list.map((s) => {
                const cached = cache[s.id] || cache[s.code] || {};
                return {
                    ...s,
                    phone: s.phone || cached.phone || '',
                    address: s.address || cached.address || '',
                    bankAccountDetails: s.bankAccountDetails || cached.bankAccountDetails || '',
                    companyName: s.companyName || cached.companyName || '',
                    paymentTermsDays: s.paymentTermsDays ?? cached.paymentTermsDays ?? 30,
                    outstandingPayable: Number(s.outstandingPayable ?? s.balance ?? 0),
                    balance: Number(s.outstandingPayable ?? s.balance ?? 0),
                    isActive: s.isActive ?? cached.isActive ?? true,
                    currency: s.currency || cached.currency || 'AZN',
                };
            });
        } catch (err) {
            console.error('[procurementService] Failed to load suppliers:', err);
            return [];
        }
    },

    async getSupplier(id: string): Promise<SupplierDto> {
        const cache = getSuppliersCache();
        try {
            const response = await httpClient.get<SupplierDto>(`/Procurement/suppliers/${id}`);
            const s = response.data;
            const cached = cache[s.id] || cache[s.code] || {};
            return {
                ...s,
                phone: s.phone || cached.phone || '',
                address: s.address || cached.address || '',
                bankAccountDetails: s.bankAccountDetails || cached.bankAccountDetails || '',
                companyName: s.companyName || cached.companyName || '',
                paymentTermsDays: s.paymentTermsDays ?? cached.paymentTermsDays ?? 30,
                outstandingPayable: Number(s.outstandingPayable ?? s.balance ?? 0),
                balance: Number(s.outstandingPayable ?? s.balance ?? 0),
                isActive: s.isActive ?? cached.isActive ?? true,
                currency: s.currency || cached.currency || 'AZN',
            };
        } catch {
            // Fallback: list all suppliers and find by ID or Code
            const all = await this.getSuppliers();
            const found = all.find((s) => s.id === id || s.code?.toLowerCase() === id.toLowerCase());
            if (found) return found;
            throw new Error('Təchizatçı tapılmadı.');
        }
    },

    async createSupplier(data: CreateSupplierRequest | any): Promise<SupplierDto> {
        const genCode = data.code?.trim() || `SUP-${Math.floor(1000 + Math.random() * 9000)}`;
        const payload = {
            code: genCode,
            name: (data.name || '').trim(),
            taxNumber: (data.taxNumber || data.tin || '').trim(),
            email: (data.email || '').trim(),
            phone: (data.phone || '').trim(),
            address: (data.address || '').trim(),
            paymentTermsDays: Number(data.paymentTermsDays) || 30,
        };

        const response = await httpClient.post<SupplierDto>('/Procurement/suppliers', payload);
        const created = response.data;

        // Persist rich metadata to cache
        if (created?.id || genCode) {
            const metaToSave: Partial<SupplierDto> = {
                phone: payload.phone,
                address: payload.address,
                companyName: data.companyName,
                bankAccountDetails: data.bankAccountDetails,
                paymentTermsDays: payload.paymentTermsDays,
                isActive: true,
                currency: data.currency || 'AZN',
            };
            if (created?.id) saveSupplierCache(created.id, metaToSave);
            saveSupplierCache(genCode, metaToSave);
        }

        return {
            ...created,
            phone: payload.phone,
            address: payload.address,
            companyName: data.companyName,
            bankAccountDetails: data.bankAccountDetails,
            paymentTermsDays: payload.paymentTermsDays,
            isActive: true,
            outstandingPayable: 0,
            balance: 0,
        };
    },

    async updateSupplier(id: string, data: UpdateSupplierRequest): Promise<SupplierDto> {
        try {
            const response = await httpClient.put<SupplierDto>(`/Procurement/suppliers/${id}`, data);
            return response.data;
        } catch {
            // Save to local cache
            saveSupplierCache(id, data);
            return this.getSupplier(id);
        }
    },

    // Purchase Orders
    async getPurchaseOrders(params?: { supplierId?: string; status?: string; page?: number; pageSize?: number }): Promise<PurchaseOrderDto[]> {
        try {
            const response = await httpClient.get<PurchaseOrderDto[]>('/Procurement/purchase-orders', { params });
            const list = Array.isArray(response.data) ? response.data : [];
            const cache = getPoCache();

            return list.map((po) => {
                const cached = cache[po.id] || cache[po.orderNumber] || {};
                return {
                    ...po,
                    currency: po.currency || cached.currency || 'AZN',
                    expectedDeliveryDate: po.expectedDeliveryDate || cached.expectedDeliveryDate,
                    notes: po.notes || cached.notes || '',
                    subTotal: Number(po.subTotal ?? cached.subTotal ?? po.grandTotal ?? 0),
                    taxTotal: Number(po.taxTotal ?? cached.taxTotal ?? 0),
                    grandTotal: Number(po.grandTotal ?? po.totalAmount ?? 0),
                    totalAmount: Number(po.grandTotal ?? po.totalAmount ?? 0),
                    lines: Array.isArray(po.lines) && po.lines.length > 0 ? po.lines : (cached.lines || []),
                };
            });
        } catch {
            return [];
        }
    },

    async getPurchaseOrder(id: string): Promise<PurchaseOrderDto> {
        const cache = getPoCache();
        try {
            const response = await httpClient.get<PurchaseOrderDto>(`/Procurement/purchase-orders/${id}`);
            const po = response.data;
            const cached = cache[po.id] || cache[po.orderNumber] || {};
            return {
                ...po,
                currency: po.currency || cached.currency || 'AZN',
                expectedDeliveryDate: po.expectedDeliveryDate || cached.expectedDeliveryDate,
                notes: po.notes || cached.notes || '',
                subTotal: Number(po.subTotal ?? cached.subTotal ?? po.grandTotal ?? 0),
                taxTotal: Number(po.taxTotal ?? cached.taxTotal ?? 0),
                grandTotal: Number(po.grandTotal ?? po.totalAmount ?? 0),
                totalAmount: Number(po.grandTotal ?? po.totalAmount ?? 0),
                lines: Array.isArray(po.lines) && po.lines.length > 0 ? po.lines : (cached.lines || []),
            };
        } catch {
            // Fallback: list all orders and find by ID or OrderNumber
            const all = await this.getPurchaseOrders();
            const found = all.find((p) => p.id === id || p.orderNumber?.toLowerCase() === id.toLowerCase());
            if (found) return found;
            throw new Error('Satınalma sifarişi tapılmadı.');
        }
    },

    async createPurchaseOrder(data: CreatePurchaseOrderRequest | any): Promise<PurchaseOrderDto> {
        const orderDate = data.orderDate ? new Date(data.orderDate) : new Date();
        const defaultDelivery = new Date(orderDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        const expectedDeliveryDate = data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : defaultDelivery;

        const formattedLines = (data.lines || []).map((l: any) => ({
            itemId: l.itemId || undefined,
            description: (l.description || '').trim() || 'Məhsul',
            orderedQuantity: Number(l.quantity ?? l.orderedQuantity) || 1,
            unitPrice: Number(l.unitPrice) || 0,
            discountPercent: Number(l.discountPercent) || 0,
            taxPercent: Number(l.taxRate ?? l.taxPercent) || 18,
        }));

        const payload = {
            supplierId: data.supplierId,
            orderDate: orderDate.toISOString(),
            expectedDeliveryDate: expectedDeliveryDate.toISOString(),
            currency: data.currency || 'AZN',
            exchangeRate: Number(data.exchangeRate) || 1,
            termsAndConditions: data.notes || data.termsAndConditions || '',
            lines: formattedLines,
        };

        const response = await httpClient.post<PurchaseOrderDto>('/Procurement/purchase-orders', payload);
        const created = response.data;

        // Calculate totals for cache
        const subTotal = formattedLines.reduce((sum: number, l: any) => sum + l.orderedQuantity * l.unitPrice * (1 - l.discountPercent / 100), 0);
        const taxTotal = subTotal * 0.18;
        const grandTotal = subTotal + taxTotal;

        const metaToSave: Partial<PurchaseOrderDto> = {
            supplierId: data.supplierId,
            orderDate: payload.orderDate,
            expectedDeliveryDate: payload.expectedDeliveryDate,
            currency: payload.currency,
            notes: payload.termsAndConditions,
            subTotal,
            taxTotal,
            grandTotal,
            totalAmount: grandTotal,
            lines: formattedLines.map((l: any, idx: number) => ({
                id: `line-${idx + 1}`,
                itemId: l.itemId,
                description: l.description,
                quantity: l.orderedQuantity,
                unitPrice: l.unitPrice,
                taxRate: l.taxPercent,
                lineTotal: l.orderedQuantity * l.unitPrice * (1 + l.taxPercent / 100),
            })),
        };

        if (created?.id) savePoCache(created.id, metaToSave);
        if (created?.orderNumber) savePoCache(created.orderNumber, metaToSave);

        return {
            ...created,
            ...metaToSave,
        };
    },

    async approvePurchaseOrder(id: string): Promise<void> {
        await httpClient.post(`/Procurement/purchase-orders/${id}/approve`);
    },

    async cancelPurchaseOrder(id: string): Promise<void> {
        try {
            await httpClient.post(`/Procurement/purchase-orders/${id}/cancel`);
        } catch {
            // Silently fallback if endpoint is not implemented
        }
    },

    // Goods Receipts
    async getGoodsReceipts(params?: { purchaseOrderId?: string; supplierId?: string; page?: number; pageSize?: number }): Promise<GoodsReceiptDto[]> {
        try {
            const response = await httpClient.get<any[]>('/Procurement/goods-receipts', { params });
            const list = Array.isArray(response.data) ? response.data : [];
            const normalized = list.map(normalizeGoodsReceipt);
            normalized.sort((a, b) => new Date(b.receiptDate).getTime() - new Date(a.receiptDate).getTime());
            return normalized;
        } catch {
            return [];
        }
    },

    async getGoodsReceipt(id: string): Promise<GoodsReceiptDto> {
        try {
            const response = await httpClient.get<any>(`/Procurement/goods-receipts/${id}`);
            return normalizeGoodsReceipt(response.data);
        } catch {
            const all = await this.getGoodsReceipts();
            const found = all.find((g) => g.id === id || g.receiptNumber === id);
            if (found) return found;
            const cache = getGrnCache();
            if (cache[id]) {
                return normalizeGoodsReceipt({ id, ...cache[id] });
            }
            throw new Error('Malların qəbulu sənədi tapılmadı.');
        }
    },

    async createGoodsReceipt(data: CreateGoodsReceiptRequest | any): Promise<GoodsReceiptDto> {
        const receiptDate = data.receiptDate ? new Date(data.receiptDate) : new Date();
        const postingDate = data.postingDate ? new Date(data.postingDate) : receiptDate;
        
        const formattedLines = (data.lines || []).map((l: any) => ({
            purchaseOrderLineId: l.purchaseOrderLineId || undefined,
            itemId: l.itemId,
            description: (l.description || '').trim() || 'Məhsul',
            receivedQuantity: Number(l.receivedQuantity ?? l.quantityReceived) || 1,
            unitCost: Number(l.unitCost) || 0,
        }));

        const payload = {
            supplierId: data.supplierId,
            warehouseId: data.warehouseId,
            purchaseOrderId: data.purchaseOrderId || undefined,
            receiptDate: receiptDate.toISOString(),
            postingDate: postingDate.toISOString(),
            waybillNumber: data.waybillNumber || data.notes || '',
            lines: formattedLines,
        };

        const response = await httpClient.post<any>('/Procurement/goods-receipts', payload);
        const created = response.data;

        const totalValue = formattedLines.reduce((sum: number, l: any) => sum + l.receivedQuantity * l.unitCost, 0);

        const metaToSave: Partial<GoodsReceiptDto> = {
            supplierId: data.supplierId,
            supplierName: data.supplierName,
            warehouseId: data.warehouseId,
            warehouseName: data.warehouseName,
            purchaseOrderId: data.purchaseOrderId,
            purchaseOrderNumber: data.purchaseOrderNumber,
            receiptDate: payload.receiptDate,
            postingDate: payload.postingDate,
            waybillNumber: payload.waybillNumber,
            notes: data.notes || '',
            totalValue,
            lines: formattedLines.map((l: any, idx: number) => ({
                id: `line-${idx + 1}`,
                itemId: l.itemId,
                description: l.description,
                quantityReceived: l.receivedQuantity,
                receivedQuantity: l.receivedQuantity,
                unitCost: l.unitCost,
                totalCost: l.receivedQuantity * l.unitCost,
                warehouseId: data.warehouseId,
                warehouseName: data.warehouseName,
            })),
        };

        if (created?.id) saveGrnCache(created.id, metaToSave);
        if (created?.receiptNumber) saveGrnCache(created.receiptNumber, metaToSave);

        return normalizeGoodsReceipt({
            ...created,
            ...metaToSave,
        });
    },

    async postGoodsReceipt(receiptId: string): Promise<GoodsReceiptDto> {
        const response = await httpClient.post<any>(`/Procurement/goods-receipts/${receiptId}/post`);
        saveGrnCache(receiptId, { status: 'Posted' });
        return normalizeGoodsReceipt(response.data);
    },

    // Supplier Invoices
    async getSupplierInvoices(params?: { supplierId?: string; status?: string; page?: number; pageSize?: number }): Promise<SupplierInvoiceDto[]> {
        try {
            const response = await httpClient.get<any[]>('/Procurement/supplier-invoices', { params });
            const list = Array.isArray(response.data) ? response.data : [];
            const normalized = list.map(normalizeSupplierInvoice);
            normalized.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
            return normalized;
        } catch (err) {
            console.error('[procurementService] Failed to load supplier invoices:', err);
            return [];
        }
    },

    async getSupplierInvoice(id: string): Promise<SupplierInvoiceDto> {
        try {
            const response = await httpClient.get<any>(`/Procurement/supplier-invoices/${id}`);
            return normalizeSupplierInvoice(response.data);
        } catch {
            // Fallback: load all and find by ID
            const all = await this.getSupplierInvoices();
            const found = all.find((i) => i.id === id);
            if (found) return found;
            throw new Error('Alış fakturası tapılmadı.');
        }
    },

    async createSupplierInvoice(data: CreateSupplierInvoiceRequest | any): Promise<SupplierInvoiceDto> {
        if (!data.supplierId || !isValidGuid(data.supplierId)) {
            throw new Error('Zəhmət olmasa etibarlı bir təchizatçı seçin.');
        }

        const now = new Date();
        const invoiceDate = toUtcIso(data.issueDate || data.invoiceDate, now);
        const dueDate = toUtcIso(data.dueDate, new Date(now.getTime() + 30 * 86400000));
        const postingDate = toUtcIso(data.postingDate || data.issueDate || data.invoiceDate, now);

        // Resolve a guaranteed valid GL Expense/Stock account
        let defaultStockOrExpenseAccountId: string | null = null;
        try {
            const glAccounts = await accountsService.getAccounts();
            if (Array.isArray(glAccounts) && glAccounts.length > 0) {
                const isMatch = (a: any) =>
                    Number(a.category) === 5 || // Expense
                    Number(a.category) === 1 || // Asset
                    String(a.category || '').toLowerCase().includes('exp') ||
                    String(a.category || '').toLowerCase().includes('asset') ||
                    String(a.name || '').toLowerCase().includes('xərc') ||
                    String(a.name || '').toLowerCase().includes('maya') ||
                    String(a.name || '').toLowerCase().includes('mal') ||
                    String(a.name || '').toLowerCase().includes('material') ||
                    String(a.name || '').toLowerCase().includes('xammal') ||
                    String(a.name || '').toLowerCase().includes('stok') ||
                    (typeof a.code === 'string' && (a.code.startsWith('7') || a.code.startsWith('2') || a.code.startsWith('1') || a.code.startsWith('8')));

                const matchLeaf = glAccounts.find((a: any) => isMatch(a) && a.isLeaf !== false);
                const matchAny = glAccounts.find(isMatch);
                const anyLeaf = glAccounts.find((a: any) => a.isLeaf !== false);
                const fallback = matchLeaf || matchAny || anyLeaf || glAccounts[0];

                if (fallback && isValidGuid(fallback.id)) {
                    defaultStockOrExpenseAccountId = fallback.id;
                }
            }
        } catch (e) {
            console.warn('[procurementService] Failed to load GL accounts for purchase invoice line', e);
        }

        const rawLines = Array.isArray(data.lines) ? data.lines : [];
        const validLines = rawLines.filter((l: any) => {
            const qty = Number(l.quantity);
            const desc = typeof l.description === 'string' ? l.description.trim() : '';
            return qty > 0 && (desc.length > 0 || isValidGuid(l.itemId));
        });

        if (validLines.length === 0) {
            throw new Error('Alış fakturasında ən azı bir sətir və miqdar (0-dan böyük) olmalıdır.');
        }

        const formattedLines = validLines.map((l: any) => {
            const qty = Math.max(0.01, Number(l.quantity) || 1);
            const price = Math.max(0, Number(l.unitPrice) || 0);

            const lineObj: Record<string, any> = {
                description: (l.description || '').trim() || 'Alış fakturası sətri',
                quantity: qty,
                unitPrice: price,
            };

            if (isValidGuid(l.itemId)) {
                lineObj.itemId = l.itemId.trim();
            }

            const targetExpAcc = isValidGuid(l.expenseOrAssetAccountId)
                ? l.expenseOrAssetAccountId.trim()
                : (defaultStockOrExpenseAccountId && isValidGuid(defaultStockOrExpenseAccountId) ? defaultStockOrExpenseAccountId : undefined);

            if (targetExpAcc) {
                lineObj.expenseOrAssetAccountId = targetExpAcc;
            }

            if (isValidGuid(l.taxCodeId)) {
                lineObj.taxCodeId = l.taxCodeId.trim();
            }
            if (isValidGuid(l.costCenterId)) {
                lineObj.costCenterId = l.costCenterId.trim();
            }
            if (isValidGuid(l.projectId)) {
                lineObj.projectId = l.projectId.trim();
            }

            return lineObj;
        });

        const rawRef = (data.supplierInvoiceReference || data.supplierInvoiceNumber || '').trim();
        const uniqueRef = rawRef || `FA-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

        const payload: Record<string, any> = {
            supplierId: data.supplierId.trim(),
            supplierInvoiceNumber: uniqueRef,
            supplierInvoiceReference: uniqueRef,
            invoiceDate,
            dueDate,
            postingDate,
            currency: data.currency || 'AZN',
            exchangeRate: Number(data.exchangeRate) || 1.0,
            isGRNIBased: Boolean(data.isGRNIBased || false),
            notes: (data.notes || '').trim(),
            lines: formattedLines,
        };

        if (isValidGuid(data.purchaseOrderId)) {
            payload.purchaseOrderId = data.purchaseOrderId.trim();
        }
        if (isValidGuid(data.goodsReceiptId)) {
            payload.goodsReceiptId = data.goodsReceiptId.trim();
        }

        const response = await httpClient.post<any>('/Procurement/supplier-invoices', payload);
        const created = response.data;

        const subTotal = formattedLines.reduce((s: number, l: any) => s + (l.quantity * l.unitPrice), 0);
        const taxTotal = subTotal * 0.18;
        const grandTotal = subTotal + taxTotal;

        const metaToSave: Partial<SupplierInvoiceDto> = {
            supplierId: payload.supplierId,
            supplierName: data.supplierName,
            supplierInvoiceNumber: payload.supplierInvoiceNumber,
            supplierInvoiceReference: payload.supplierInvoiceReference,
            purchaseOrderId: payload.purchaseOrderId,
            goodsReceiptId: payload.goodsReceiptId,
            issueDate: payload.invoiceDate,
            invoiceDate: payload.invoiceDate,
            dueDate: payload.dueDate,
            postingDate: payload.postingDate,
            currency: payload.currency,
            notes: payload.notes,
            subTotal,
            taxTotal,
            grandTotal,
            totalAmount: grandTotal,
            outstandingAmount: grandTotal,
            lines: formattedLines.map((l: any, idx: number) => ({
                id: `line-${idx + 1}`,
                itemId: l.itemId,
                description: l.description,
                quantity: l.quantity,
                unitPrice: l.unitPrice,
                lineSubTotal: l.quantity * l.unitPrice,
                taxRate: 18,
                taxAmount: l.quantity * l.unitPrice * 0.18,
                lineTotal: l.quantity * l.unitPrice * 1.18,
                expenseOrAssetAccountId: l.expenseOrAssetAccountId,
            })),
        };

        if (created?.id) saveInvoiceCache(created.id, metaToSave);
        if (created?.invoiceNumber) saveInvoiceCache(created.invoiceNumber, metaToSave);

        return normalizeSupplierInvoice({
            ...created,
            ...metaToSave,
        });
    },

    async approveSupplierInvoice(id: string): Promise<SupplierInvoiceDto> {
        const response = await httpClient.post<any>(`/Procurement/supplier-invoices/${id}/post`);
        saveInvoiceCache(id, { status: 'Approved', documentStatus: 4 });
        return normalizeSupplierInvoice(response.data);
    },

    async postSupplierInvoice(id: string): Promise<SupplierInvoiceDto> {
        const response = await httpClient.post<any>(`/Procurement/supplier-invoices/${id}/post`);
        saveInvoiceCache(id, { status: 'Approved', documentStatus: 4 });
        return normalizeSupplierInvoice(response.data);
    },

    async evaluateThreeWayMatch(id: string): Promise<ThreeWayMatchResultDto> {
        const response = await httpClient.get<ThreeWayMatchResultDto>(`/Procurement/supplier-invoices/${id}/3-way-match`);
        return response.data;
    },

    async paySupplierInvoice(id: string, data: PayInvoiceRequest | any): Promise<void> {
        // Backend processes payments via POST /api/payments with GL accounting & invoice allocation
        const paymentPayload: any = {
            type: 3, // SupplierPayment
            paymentType: 'Outgoing',
            partyType: 'Supplier',
            partyId: data.supplierId || data.partyId,
            bankAccountId: data.bankAccountId,
            totalAmount: Number(data.amount) || 0,
            paymentDate: data.paymentDate ? new Date(data.paymentDate).toISOString() : new Date().toISOString(),
            referenceNumber: data.reference || `SUPP-${id.slice(0, 8)}`,
            notes: data.notes || 'Qaimə ödənişi',
            allocations: [
                {
                    targetDocumentType: 'SupplierInvoice',
                    targetDocumentId: id,
                    allocatedAmount: Number(data.amount) || 0,
                },
            ],
        };

        await paymentService.createPayment(paymentPayload);
    },
};

export default procurementService;

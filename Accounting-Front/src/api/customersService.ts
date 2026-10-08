import httpClient from './httpClient';
import { accountsService } from './accountsService';
import { paymentService } from './paymentService';
import type {
    CustomerDto,
    CreateCustomerRequest,
    UpdateCustomerRequest,
    CustomerInvoiceDto,
    CreateCustomerInvoiceRequest,
    PayInvoiceRequest,
    ItemDto,
    CreateItemRequest,
    UpdateItemRequest,
} from '../dto';

function isValidGuid(id: any): boolean {
    if (!id || typeof id !== 'string') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.trim());
}

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

export function normalizeCustomerInvoice(inv: any): CustomerInvoiceDto {
    const documentStatusMap: Record<number, string> = {
        1: 'Draft',
        2: 'Submitted',
        3: 'Approved',
        4: 'Posted',
        5: 'Cancelled',
    };
    const settlementStatusMap: Record<number, string> = {
        1: 'Unpaid',
        2: 'PartiallyPaid',
        3: 'Paid',
        4: 'Overdue',
    };

    const rawDocStatus = typeof inv.documentStatus === 'number'
        ? (documentStatusMap[inv.documentStatus] || 'Draft')
        : (inv.documentStatus || inv.status || 'Draft');

    const rawSettStatus = typeof inv.settlementStatus === 'number'
        ? (settlementStatusMap[inv.settlementStatus] || 'Unpaid')
        : (inv.settlementStatus || 'Unpaid');

    const totalAmount = Number(inv.grandTotal !== undefined ? inv.grandTotal : inv.totalAmount) || 0;
    const paidAmount = Number(inv.paidAmount) || 0;
    const remainingAmount = Number(inv.outstandingAmount !== undefined ? inv.outstandingAmount : inv.remainingAmount) || 0;

    let displayStatus = rawDocStatus;
    if (rawDocStatus === 'Posted' || rawDocStatus === 'Approved') {
        if (remainingAmount <= 0 && totalAmount > 0) {
            displayStatus = 'Paid';
        } else if (paidAmount > 0) {
            displayStatus = 'PartiallyPaid';
        } else {
            displayStatus = 'Unpaid';
        }
    }

    const issueDateStr = inv.invoiceDate || inv.issueDate || inv.createdAt || new Date().toISOString();
    const dueDateStr = inv.dueDate || issueDateStr;
    const postingDateStr = inv.postingDate || issueDateStr;

    return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber || 'INV-0000',
        customerId: inv.customerId,
        customerName: inv.customerName || 'Müştəri',
        issueDate: issueDateStr,
        invoiceDate: issueDateStr,
        dueDate: dueDateStr,
        postingDate: postingDateStr,
        status: displayStatus,
        documentStatus: rawDocStatus,
        settlementStatus: rawSettStatus,
        subTotal: Number(inv.subTotal) || 0,
        taxTotal: Number(inv.taxTotal) || 0,
        totalAmount,
        grandTotal: totalAmount,
        paidAmount,
        remainingAmount,
        outstandingAmount: remainingAmount,
        currency: inv.currency || 'AZN',
        notes: inv.notes || '',
        lines: Array.isArray(inv.lines) ? inv.lines : [],
        createdAt: inv.createdAt || issueDateStr,
    };
}

const CUSTOMERS_META_KEY = 'altensor_customers_metadata_cache';

function getStoredCustomerMeta(): Record<string, Partial<CustomerDto>> {
    try {
        const raw = localStorage.getItem(CUSTOMERS_META_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveCustomerMeta(key: string, meta: Partial<CustomerDto>) {
    if (!key) return;
    try {
        const current = getStoredCustomerMeta();
        current[key.toLowerCase()] = {
            ...(current[key.toLowerCase()] || {}),
            ...meta,
        };
        localStorage.setItem(CUSTOMERS_META_KEY, JSON.stringify(current));
    } catch {}
}

const ITEMS_META_KEY = 'altensor_items_metadata_cache';

function getStoredItemsMeta(): Record<string, Partial<ItemDto>> {
    try {
        const raw = localStorage.getItem(ITEMS_META_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveItemMeta(key: string, meta: Partial<ItemDto>) {
    if (!key) return;
    try {
        const current = getStoredItemsMeta();
        current[key.toLowerCase()] = {
            ...(current[key.toLowerCase()] || {}),
            ...meta,
        };
        localStorage.setItem(ITEMS_META_KEY, JSON.stringify(current));
    } catch {}
}

function normalizeItem(raw: any): ItemDto {
    const metaMap = getStoredItemsMeta();
    const meta = metaMap[String(raw.id || '').toLowerCase()] ||
                 metaMap[String(raw.code || '').toLowerCase()] ||
                 metaMap[String(raw.name || '').toLowerCase()] || {};

    const typeMap: Record<number, 'StockItem' | 'NonStockItem' | 'Service'> = {
        1: 'StockItem',
        2: 'NonStockItem',
        3: 'Service',
    };

    const valMap: Record<number, 'MovingAverage' | 'FIFO'> = {
        1: 'MovingAverage',
        2: 'FIFO',
    };

    const itemType = typeof raw.type === 'number'
        ? (typeMap[raw.type] || 'StockItem')
        : (raw.type || meta.type || 'StockItem');

    const valMethod = typeof raw.valuationMethod === 'number'
        ? (valMap[raw.valuationMethod] || 'MovingAverage')
        : (raw.valuationMethod || meta.valuationMethod || 'MovingAverage');

    const buyingPrice = Number(raw.standardBuyingPrice !== undefined ? raw.standardBuyingPrice : (raw.costPrice !== undefined ? raw.costPrice : (meta.standardBuyingPrice ?? meta.costPrice))) || 0;
    const sellingPrice = Number(raw.standardSellingPrice !== undefined ? raw.standardSellingPrice : (raw.unitPrice !== undefined ? raw.unitPrice : (meta.standardSellingPrice ?? meta.unitPrice))) || 0;

    return {
        id: raw.id,
        code: raw.code || meta.code || 'SKU-000',
        name: raw.name || meta.name || '',
        description: raw.description || meta.description || '',
        baseUOM: raw.baseUOM || raw.unitOfMeasure || meta.baseUOM || 'PCS',
        unitOfMeasure: raw.baseUOM || raw.unitOfMeasure || meta.baseUOM || 'PCS',
        type: itemType,
        rawType: typeof raw.type === 'number' ? raw.type : (itemType === 'Service' ? 3 : (itemType === 'NonStockItem' ? 2 : 1)),
        valuationMethod: valMethod,
        rawValuationMethod: typeof raw.valuationMethod === 'number' ? raw.valuationMethod : (valMethod === 'FIFO' ? 2 : 1),
        standardBuyingPrice: buyingPrice,
        costPrice: buyingPrice,
        standardSellingPrice: sellingPrice,
        unitPrice: sellingPrice,
        currentValuationRate: Number(raw.currentValuationRate) || buyingPrice,
        totalStockOnHand: Number(raw.totalStockOnHand) || 0,
        totalStockValue: Number(raw.totalStockValue) || 0,
        inventoryAccountId: raw.inventoryAccountId || meta.inventoryAccountId,
        cogsAccountId: raw.cogsAccountId || meta.cogsAccountId,
        revenueAccountId: raw.revenueAccountId || meta.revenueAccountId,
        isActive: raw.isActive !== false,
        createdAt: raw.createdAt || new Date().toISOString(),
    };
}

export const customersService = {
    // Customers
    async getCustomers(params?: { search?: string; isActive?: boolean; page?: number; pageSize?: number }): Promise<CustomerDto[]> {
        const metaMap = getStoredCustomerMeta();
        try {
            const response = await httpClient.get<CustomerDto[]>('/customers', { params });
            const list = Array.isArray(response.data) ? response.data : [];
            return list.map((c: any) => {
                const meta = metaMap[String(c.id).toLowerCase()] ||
                             metaMap[String(c.code).toLowerCase()] ||
                             metaMap[String(c.name).toLowerCase()] || {};

                return {
                    id: c.id,
                    code: c.code || meta.code || `CUST-${c.id?.substring(0, 4) || '001'}`,
                    name: c.name || meta.name || '',
                    companyName: c.name || c.companyName || meta.companyName || '',
                    taxNumber: c.taxNumber || meta.taxNumber || '',
                    email: c.email || meta.email || '',
                    phone: c.phone || meta.phone || '',
                    address: c.address || meta.address || '',
                    creditLimit: Number(c.creditLimit !== undefined && c.creditLimit !== 0 ? c.creditLimit : meta.creditLimit) || 0,
                    paymentTermsDays: Number(c.paymentTermsDays !== undefined && c.paymentTermsDays !== 0 ? c.paymentTermsDays : (meta.paymentTermsDays || 30)),
                    outstandingBalance: Number(c.outstandingBalance) || 0,
                    balance: Number(c.outstandingBalance) || 0,
                    currency: c.currency || meta.currency || 'AZN',
                    isActive: c.isActive !== false,
                };
            });
        } catch (err) {
            console.warn('[customersService] getCustomers error:', err);
            return [];
        }
    },

    async getCustomer(id: string): Promise<CustomerDto> {
        const metaMap = getStoredCustomerMeta();
        try {
            const response = await httpClient.get<CustomerDto>(`/customers/${id}`);
            if (response.data) {
                const c = response.data;
                const meta = metaMap[String(c.id).toLowerCase()] ||
                             metaMap[String(c.code).toLowerCase()] ||
                             metaMap[String(c.name).toLowerCase()] || {};
                return {
                    id: c.id,
                    code: c.code || meta.code || `CUST-${c.id?.substring(0, 4) || '001'}`,
                    name: c.name || meta.name || '',
                    companyName: c.name || c.companyName || meta.companyName || '',
                    taxNumber: c.taxNumber || meta.taxNumber || '',
                    email: c.email || meta.email || '',
                    phone: c.phone || meta.phone || '',
                    address: c.address || meta.address || '',
                    creditLimit: Number(c.creditLimit !== undefined && c.creditLimit !== 0 ? c.creditLimit : meta.creditLimit) || 0,
                    paymentTermsDays: Number(c.paymentTermsDays !== undefined && c.paymentTermsDays !== 0 ? c.paymentTermsDays : (meta.paymentTermsDays || 30)),
                    outstandingBalance: Number(c.outstandingBalance) || 0,
                    balance: Number(c.outstandingBalance) || 0,
                    currency: c.currency || meta.currency || 'AZN',
                    isActive: c.isActive !== false,
                };
            }
        } catch {}

        const all = await this.getCustomers();
        const found = all.find(c => String(c.id).toLowerCase() === String(id).toLowerCase() || c.code?.toLowerCase() === String(id).toLowerCase());
        if (found) return found;
        throw new Error('Müştəri tapılmadı.');
    },

    async createCustomer(data: CreateCustomerRequest | any): Promise<CustomerDto> {
        const code = data.code || `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
        const payload = {
            code,
            name: (data.name || '').trim(),
            taxNumber: (data.taxNumber || data.tin || '').trim() || null,
            email: (data.email || '').trim() || null,
            phone: (data.phone || '').trim() || null,
            address: (data.address || '').trim() || null,
            creditLimit: Number(data.creditLimit) || 0,
            paymentTermsDays: Number(data.paymentTermsDays) || 30,
        };

        // Cache customer metadata by code and name
        saveCustomerMeta(code, payload);
        if (payload.name) saveCustomerMeta(payload.name, payload);

        const response = await httpClient.post<CustomerDto>('/customers', payload);
        const created = response.data;
        if (created?.id) {
            saveCustomerMeta(created.id, payload);
        }

        return {
            ...created,
            phone: payload.phone || undefined,
            address: payload.address || undefined,
            creditLimit: payload.creditLimit,
            paymentTermsDays: payload.paymentTermsDays,
        };
    },

    async updateCustomer(id: string, data: UpdateCustomerRequest): Promise<CustomerDto> {
        saveCustomerMeta(id, data);
        const response = await httpClient.put<CustomerDto>(`/customers/${id}`, data);
        return response.data;
    },

    // Customer Invoices
    async getInvoices(params?: { customerId?: string; status?: string; fromDate?: string; toDate?: string; page?: number; pageSize?: number }): Promise<CustomerInvoiceDto[]> {
        try {
            const response = await httpClient.get<any[]>('/customer-invoices', { params });
            const raw = Array.isArray(response.data) ? response.data : [];
            return raw.map(normalizeCustomerInvoice);
        } catch (err) {
            console.warn('[customersService] getInvoices error:', err);
            return [];
        }
    },

    async getInvoice(id: string): Promise<CustomerInvoiceDto | null> {
        if (!id) return null;
        try {
            const response = await httpClient.get<any>(`/customer-invoices/${id}`);
            if (response.data) {
                return normalizeCustomerInvoice(response.data);
            }
        } catch {
            // Backend only exposes GET /api/customer-invoices list
        }

        try {
            const list = await this.getInvoices();
            const cleanId = String(id || '').toLowerCase().trim();
            const found = list.find((inv) =>
                String(inv.id || '').toLowerCase() === cleanId ||
                String(inv.invoiceNumber || '').toLowerCase() === cleanId
            );
            if (found) {
                return found;
            }
        } catch (err) {
            console.warn('[customersService] getInvoice fallback error:', err);
        }

        return null;
    },

    async createInvoice(data: CreateCustomerInvoiceRequest | any): Promise<CustomerInvoiceDto> {
        if (!data.customerId || !isValidGuid(data.customerId)) {
            throw new Error('Zəhmət olmasa etibarlı bir müştəri seçin.');
        }

        const now = new Date();
        const invoiceDate = toUtcIso(data.issueDate || data.invoiceDate, now);
        const dueDate = toUtcIso(data.dueDate, new Date(now.getTime() + 30 * 86400000));
        const postingDate = toUtcIso(data.postingDate || data.issueDate || data.invoiceDate, now);

        // Resolve a guaranteed valid GL Revenue account
        let defaultRevAccountId: string | null = null;
        try {
            const glAccounts = await accountsService.getAccounts();
            if (Array.isArray(glAccounts) && glAccounts.length > 0) {
                const isMatch = (a: any) =>
                    Number(a.category) === 4 ||
                    String(a.category || '').toLowerCase().includes('income') ||
                    String(a.category || '').toLowerCase().includes('rev') ||
                    String(a.name || '').toLowerCase().includes('satış') ||
                    String(a.name || '').toLowerCase().includes('gəlir') ||
                    (typeof a.code === 'string' && a.code.startsWith('6'));

                const matchLeaf = glAccounts.find((a: any) => isMatch(a) && a.isLeaf !== false);
                const matchAny = glAccounts.find(isMatch);
                const anyLeaf = glAccounts.find((a: any) => a.isLeaf !== false);
                const fallback = matchLeaf || matchAny || anyLeaf || glAccounts[0];

                if (fallback && isValidGuid(fallback.id)) {
                    defaultRevAccountId = fallback.id;
                }
            }
        } catch (e) {
            console.warn('[customersService] Failed to load GL accounts for invoice line', e);
        }

        const rawLines = Array.isArray(data.lines) ? data.lines : [];
        const validLines = rawLines.filter((l: any) => {
            const qty = Number(l.quantity);
            const desc = typeof l.description === 'string' ? l.description.trim() : '';
            return qty > 0 && (desc.length > 0 || isValidGuid(l.itemId));
        });

        if (validLines.length === 0) {
            throw new Error('Fakturada ən azı bir sətir və miqdar (0-dan böyük) olmalıdır.');
        }

        const formattedLines = validLines.map((l: any) => {
            const qty = Math.max(0.01, Number(l.quantity) || 1);
            const price = Math.max(0, Number(l.unitPrice) || 0);
            const discount = Math.max(0, Math.min(100, Number(l.discountPercent) || 0));

            const lineObj: Record<string, any> = {
                description: (l.description || '').trim() || 'Xidmət / Məhsul',
                quantity: qty,
                unitPrice: price,
                discountPercent: discount,
            };

            if (isValidGuid(l.itemId)) {
                lineObj.itemId = l.itemId.trim();
            }

            const targetRevAcc = isValidGuid(l.revenueAccountId)
                ? l.revenueAccountId.trim()
                : (defaultRevAccountId && isValidGuid(defaultRevAccountId) ? defaultRevAccountId : undefined);

            if (targetRevAcc) {
                lineObj.revenueAccountId = targetRevAcc;
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
            if (isValidGuid(l.departmentId)) {
                lineObj.departmentId = l.departmentId.trim();
            }

            return lineObj;
        });

        const payload: Record<string, any> = {
            customerId: data.customerId.trim(),
            invoiceDate,
            dueDate,
            postingDate,
            currency: data.currency || 'AZN',
            exchangeRate: Number(data.exchangeRate) || 1.0,
            lines: formattedLines,
        };

        if (data.notes && String(data.notes).trim()) {
            payload.notes = String(data.notes).trim();
        }

        const response = await httpClient.post<any>('/customer-invoices', payload);
        return normalizeCustomerInvoice(response.data);
    },

    async approveInvoice(id: string, invoiceDate?: string): Promise<CustomerInvoiceDto> {
        if (!isValidGuid(id)) {
            throw new Error('Yanlış qaimə ID-si.');
        }

        const executePostWithFiscalRecovery = async () => {
            try {
                const response = await httpClient.post<any>(`/customer-invoices/${id}/post`);
                return normalizeCustomerInvoice(response.data);
            } catch (err: any) {
                const errDetail = String(err.response?.data?.detail || err.response?.data?.message || err.message || '');
                if (errDetail.includes('maliyyə dövrü') || errDetail.includes('fiscal') || errDetail.includes('Posting tarixi')) {
                    const year = invoiceDate ? new Date(invoiceDate).getFullYear() : (new Date().getFullYear() || 2026);
                    try {
                        await httpClient.post('/fiscal-periods/years', {
                            name: String(year),
                            startDate: `${year}-01-01T00:00:00.000Z`,
                            endDate: `${year}-12-31T23:59:59.000Z`,
                        });
                        const retry = await httpClient.post<any>(`/customer-invoices/${id}/post`);
                        return normalizeCustomerInvoice(retry.data);
                    } catch {
                        throw err;
                    }
                }
                throw err;
            }
        };

        return await executePostWithFiscalRecovery();
    },

    async postInvoice(id: string, invoiceDate?: string): Promise<CustomerInvoiceDto> {
        return this.approveInvoice(id, invoiceDate);
    },

    async payInvoice(id: string, data: PayInvoiceRequest & { customerId?: string }): Promise<void> {
        if (!isValidGuid(id)) {
            throw new Error('Yanlış qaimə ID-si.');
        }

        const amount = Number(data.amount) || 0;
        if (amount <= 0) {
            throw new Error('Ödəniş məbləği 0-dan böyük olmalıdır.');
        }

        const pDate = data.paymentDate ? new Date(data.paymentDate).toISOString() : new Date().toISOString();

        // Backend records receipt via POST /api/payments with allocation to CustomerInvoice
        const paymentPayload = {
            type: 1, // PaymentType.CustomerReceipt = 1
            paymentDate: pDate,
            postingDate: pDate,
            partyId: data.customerId && isValidGuid(data.customerId) ? data.customerId : undefined,
            partyType: 'Customer',
            bankAccountId: data.bankAccountId,
            paymentMethod: data.paymentMethod || 'BankTransfer',
            currency: 'AZN',
            exchangeRate: 1.0,
            totalAmount: amount,
            referenceNumber: data.reference || `INV-PAY-${Date.now().toString().slice(-4)}`,
            allocations: [
                {
                    targetDocumentType: 2, // DocumentType.CustomerInvoice = 2
                    targetDocumentId: id,
                    allocatedAmount: amount,
                },
            ],
        };

        const payment = await paymentService.createPayment(paymentPayload);
        if (payment?.id) {
            try {
                await paymentService.postPayment(payment.id);
            } catch (err) {
                console.warn('[customersService] Payment created but auto-post failed:', err);
            }
        }
    },

    // Items (Inventory / Items)
    async getItems(params?: { search?: string; type?: string; isActive?: boolean; page?: number; pageSize?: number }): Promise<ItemDto[]> {
        try {
            const response = await httpClient.get<any[]>('/Inventory/items', { params });
            const list = Array.isArray(response.data) ? response.data : [];
            let normalized = list.map(normalizeItem);

            if (params?.search && params.search.trim()) {
                const q = params.search.toLowerCase().trim();
                normalized = normalized.filter(
                    (it) =>
                        it.name.toLowerCase().includes(q) ||
                        it.code.toLowerCase().includes(q) ||
                        (it.description && it.description.toLowerCase().includes(q))
                );
            }

            if (params?.type && params.type !== 'ALL') {
                normalized = normalized.filter((it) => String(it.type).toLowerCase() === params.type?.toLowerCase());
            }

            return normalized;
        } catch (err) {
            console.warn('[customersService] getItems error:', err);
            return [];
        }
    },

    async getItem(id: string): Promise<ItemDto | null> {
        if (!id) return null;
        try {
            const response = await httpClient.get<any>(`/Inventory/items/${id}`);
            if (response.data) {
                return normalizeItem(response.data);
            }
        } catch {
            // Backend only provides GET /api/Inventory/items
        }

        try {
            const list = await this.getItems();
            const cleanId = String(id || '').toLowerCase().trim();
            const found = list.find(
                (it) =>
                    String(it.id || '').toLowerCase() === cleanId ||
                    String(it.code || '').toLowerCase() === cleanId
            );
            if (found) return found;
        } catch (err) {
            console.warn('[customersService] getItem fallback search error:', err);
        }

        return null;
    },

    async createItem(data: CreateItemRequest | any): Promise<ItemDto> {
        if (!data.name || !String(data.name).trim()) {
            throw new Error('Məhsul və ya xidmətin adı qeyd olunmalıdır.');
        }

        const rawTypeNum = data.type === 'Service' || data.type === 3 || data.type === '3'
            ? 3
            : (data.type === 'NonStockItem' || data.type === 2 || data.type === '2' ? 2 : 1);

        const rawValMap = data.valuationMethod === 'FIFO' || data.valuationMethod === 2 || data.valuationMethod === '2'
            ? 2
            : 1;

        const buying = Number(data.standardBuyingPrice !== undefined ? data.standardBuyingPrice : data.costPrice) || 0;
        const selling = Number(data.standardSellingPrice !== undefined ? data.standardSellingPrice : data.unitPrice) || 0;

        const payload: Record<string, any> = {
            code: (data.code && String(data.code).trim()) || `SKU-${Date.now().toString().slice(-5)}`,
            name: String(data.name).trim(),
            description: data.description ? String(data.description).trim() : '',
            baseUOM: data.baseUOM || data.unitOfMeasure || 'PCS',
            type: rawTypeNum,
            valuationMethod: rawValMap,
            standardBuyingPrice: buying,
            standardSellingPrice: selling,
        };

        if (data.inventoryAccountId && isValidGuid(data.inventoryAccountId)) {
            payload.inventoryAccountId = data.inventoryAccountId.trim();
        }
        if (data.cogsAccountId && isValidGuid(data.cogsAccountId)) {
            payload.cogsAccountId = data.cogsAccountId.trim();
        }
        if (data.revenueAccountId && isValidGuid(data.revenueAccountId)) {
            payload.revenueAccountId = data.revenueAccountId.trim();
        }

        const response = await httpClient.post<any>('/Inventory/items', payload);
        const result = normalizeItem(response.data || payload);

        // Cache metadata
        if (result?.id) {
            saveItemMeta(result.id, {
                ...payload,
                standardBuyingPrice: buying,
                costPrice: buying,
                standardSellingPrice: selling,
                unitPrice: selling,
            });
        }
        if (result?.code) {
            saveItemMeta(result.code, {
                ...payload,
                standardBuyingPrice: buying,
                costPrice: buying,
                standardSellingPrice: selling,
                unitPrice: selling,
            });
        }

        return result;
    },

    async updateItem(id: string, data: UpdateItemRequest): Promise<ItemDto> {
        saveItemMeta(id, data);
        try {
            const response = await httpClient.put<any>(`/Inventory/items/${id}`, data);
            return normalizeItem(response.data || data);
        } catch {
            return normalizeItem({ id, ...data });
        }
    },
};

export default customersService;

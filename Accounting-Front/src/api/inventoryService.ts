import httpClient from './httpClient';
import type {
    WarehouseDto,
    CreateWarehouseRequest,
    UpdateWarehouseRequest,
    StockLedgerEntryDto,
    StockTransactionDto,
    CreateStockTransactionRequest,
} from '../dto';

const WAREHOUSE_METADATA_STORAGE_KEY = 'altensor_warehouses_metadata_cache';
const STOCK_TX_STORAGE_KEY = 'altensor_stock_tx_metadata_cache';

interface WarehouseMetadata {
    managerName?: string;
    phone?: string;
    notes?: string;
    isActive?: boolean;
    defaultInventoryAccountId?: string;
    defaultInventoryAccountName?: string;
}

const getStoredMetadata = (): Record<string, WarehouseMetadata> => {
    try {
        const stored = localStorage.getItem(WAREHOUSE_METADATA_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
};

const saveStoredMetadata = (id: string, meta: WarehouseMetadata) => {
    try {
        const all = getStoredMetadata();
        all[id] = { ...all[id], ...meta };
        localStorage.setItem(WAREHOUSE_METADATA_STORAGE_KEY, JSON.stringify(all));
    } catch (e) {
        console.error('Failed to save warehouse metadata cache:', e);
    }
};

const getStoredTxList = (): StockTransactionDto[] => {
    try {
        const stored = localStorage.getItem(STOCK_TX_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const saveStoredTx = (tx: StockTransactionDto) => {
    try {
        const list = getStoredTxList();
        const idx = list.findIndex((t) => t.id === tx.id || t.transactionNumber === tx.transactionNumber);
        if (idx >= 0) {
            list[idx] = { ...list[idx], ...tx };
        } else {
            list.unshift(tx);
        }
        localStorage.setItem(STOCK_TX_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
        console.error('Failed to save stock tx cache:', e);
    }
};

export const inventoryService = {
    // Warehouses
    async getWarehouses(params?: { search?: string; isActive?: boolean }): Promise<WarehouseDto[]> {
        const response = await httpClient.get<WarehouseDto[]>('/Inventory/warehouses');
        const rawList = Array.isArray(response.data) ? response.data : [];
        const metadata = getStoredMetadata();

        let ledgerEntries: StockLedgerEntryDto[] = [];
        try {
            const ledgerRes = await httpClient.get<StockLedgerEntryDto[]>('/Inventory/stock-ledger');
            if (Array.isArray(ledgerRes.data)) {
                ledgerEntries = ledgerRes.data;
            }
        } catch {
            // non-blocking
        }

        const enrichedList = rawList.map((wh) => {
            const meta = metadata[wh.id] || {};
            const whLedger = ledgerEntries.filter(
                (e) => e.warehouseId === wh.id || (e.warehouseCode && e.warehouseCode === wh.code)
            );

            const itemMap = new Map<string, { qty: number; value: number }>();
            for (const entry of whLedger) {
                const key = entry.itemId || entry.itemCode || 'default';
                itemMap.set(key, {
                    qty: Number(entry.balanceQty ?? 0),
                    value: Number(entry.balanceValue ?? 0),
                });
            }

            let totalQty = 0;
            let totalVal = 0;
            itemMap.forEach((v) => {
                totalQty += v.qty;
                totalVal += v.value;
            });

            return {
                ...wh,
                managerName: meta.managerName || '',
                phone: meta.phone || '',
                notes: meta.notes || '',
                defaultInventoryAccountId: meta.defaultInventoryAccountId || wh.defaultInventoryAccountId,
                defaultInventoryAccountName: meta.defaultInventoryAccountName || '',
                isActive: meta.isActive !== undefined ? meta.isActive : true,
                stockItemsCount: itemMap.size,
                totalStockOnHand: totalQty,
                totalStockValue: totalVal,
            };
        });

        let filtered = enrichedList;
        if (params?.search) {
            const q = params.search.toLowerCase();
            filtered = filtered.filter(
                (w) =>
                    w.code?.toLowerCase().includes(q) ||
                    w.name?.toLowerCase().includes(q) ||
                    w.location?.toLowerCase().includes(q) ||
                    w.managerName?.toLowerCase().includes(q)
            );
        }

        if (params?.isActive !== undefined) {
            filtered = filtered.filter((w) => w.isActive === params.isActive);
        }

        return filtered;
    },

    async getWarehouse(id: string): Promise<WarehouseDto> {
        try {
            const response = await httpClient.get<WarehouseDto>(`/Inventory/warehouses/${id}`);
            const meta = getStoredMetadata()[id] || {};
            return {
                ...response.data,
                managerName: meta.managerName || '',
                phone: meta.phone || '',
                notes: meta.notes || '',
                defaultInventoryAccountId: meta.defaultInventoryAccountId || response.data.defaultInventoryAccountId,
                defaultInventoryAccountName: meta.defaultInventoryAccountName || '',
                isActive: meta.isActive !== undefined ? meta.isActive : true,
            };
        } catch {
            const all = await this.getWarehouses();
            const found = all.find((w) => w.id === id);
            if (found) return found;
            throw new Error('Anbar tapılmadı');
        }
    },

    async createWarehouse(data: CreateWarehouseRequest): Promise<WarehouseDto> {
        const payload = {
            code: data.code || `WH-${Date.now().toString().slice(-4)}`,
            name: data.name,
            location: data.location || '',
            defaultInventoryAccountId: data.defaultInventoryAccountId || undefined,
        };
        const response = await httpClient.post<WarehouseDto>('/Inventory/warehouses', payload);
        const created = response.data;

        if (created?.id) {
            saveStoredMetadata(created.id, {
                managerName: data.managerName,
                phone: data.phone,
                notes: data.notes,
                isActive: data.isActive !== undefined ? data.isActive : true,
                defaultInventoryAccountId: data.defaultInventoryAccountId,
            });
        }

        return created;
    },

    async updateWarehouse(id: string, data: UpdateWarehouseRequest): Promise<WarehouseDto> {
        try {
            const response = await httpClient.put<WarehouseDto>(`/Inventory/warehouses/${id}`, data);
            saveStoredMetadata(id, {
                managerName: data.managerName,
                phone: data.phone,
                notes: data.notes,
                isActive: data.isActive,
                defaultInventoryAccountId: data.defaultInventoryAccountId,
            });
            return response.data;
        } catch {
            saveStoredMetadata(id, {
                managerName: data.managerName,
                phone: data.phone,
                notes: data.notes,
                isActive: data.isActive,
                defaultInventoryAccountId: data.defaultInventoryAccountId,
            });
            return {
                id,
                code: data.code || '',
                name: data.name || '',
                location: data.location || '',
                managerName: data.managerName,
                phone: data.phone,
                notes: data.notes,
                isActive: data.isActive !== undefined ? data.isActive : true,
            };
        }
    },

    // Stock Transactions
    async getStockTransactions(): Promise<StockTransactionDto[]> {
        return getStoredTxList();
    },

    async getStockTransaction(id: string): Promise<StockTransactionDto> {
        const list = getStoredTxList();
        const found = list.find((t) => t.id === id || t.transactionNumber === id);
        if (found) return found;
        throw new Error('Stok əməliyyatı tapılmadı');
    },

    async createStockTransaction(data: CreateStockTransactionRequest): Promise<StockTransactionDto> {
        // Map Type to numeric enum or string
        let typeVal: any = 1;
        if (typeof data.type === 'number') {
            typeVal = data.type;
        } else if (typeof data.type === 'string') {
            const t = data.type.toLowerCase();
            if (t.includes('receipt') || t.includes('giriş') || t.includes('mədaxil')) typeVal = 1;
            else if (t.includes('issue') || t.includes('çıxış') || t.includes('məxaric')) typeVal = 2;
            else if (t.includes('transfer') || t.includes('köçürmə')) typeVal = 3;
            else if (t.includes('adj') || t.includes('düzəliş')) typeVal = 4;
            else typeVal = data.type;
        }

        const now = new Date();
        const txDate = data.transactionDate ? new Date(data.transactionDate).toISOString() : now.toISOString();
        const postDate = data.postingDate ? new Date(data.postingDate).toISOString() : txDate;

        const payload = {
            type: typeVal,
            transactionDate: txDate,
            postingDate: postDate,
            sourceWarehouseId: data.sourceWarehouseId,
            targetWarehouseId: data.targetWarehouseId || undefined,
            referenceNumber: data.referenceNumber || '',
            notes: data.notes || '',
            lines: (data.lines || []).map((l) => ({
                itemId: l.itemId,
                quantity: Number(l.quantity) || 1,
                unitCost: Number(l.unitCost) || 0,
                costCenterId: l.costCenterId || undefined,
                projectId: l.projectId || undefined,
            })),
        };

        const response = await httpClient.post<any>('/Inventory/stock-transactions', payload);
        const created = response.data;

        const totalValue = (data.lines || []).reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unitCost) || 0), 0);

        const fullTx: StockTransactionDto = {
            id: created.id || `TX-${Date.now()}`,
            transactionNumber: created.transactionNumber || `STK-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
            type: data.type,
            transactionDate: txDate,
            postingDate: postDate,
            status: created.status || 'Draft',
            totalValue: created.totalValue ?? totalValue,
            sourceWarehouseId: data.sourceWarehouseId,
            sourceWarehouseName: data.sourceWarehouseName,
            targetWarehouseId: data.targetWarehouseId,
            targetWarehouseName: data.targetWarehouseName,
            referenceNumber: data.referenceNumber,
            notes: data.notes,
            lines: data.lines.map((l, i) => ({
                ...l,
                id: `line-${i + 1}`,
                totalCost: (Number(l.quantity) || 0) * (Number(l.unitCost) || 0),
            })),
            createdAt: now.toISOString(),
        };

        saveStoredTx(fullTx);
        return fullTx;
    },

    async postStockTransaction(id: string): Promise<StockTransactionDto> {
        const response = await httpClient.post<any>(`/Inventory/stock-transactions/${id}/post`);
        const updated = response.data;

        const list = getStoredTxList();
        const existing = list.find((t) => t.id === id);
        const merged: StockTransactionDto = {
            ...(existing || ({} as any)),
            ...updated,
            status: 'Posted',
        };
        saveStoredTx(merged);
        return merged;
    },

    // Stock Ledger
    async getStockLedger(params?: {
        itemId?: string;
        warehouseId?: string;
        fromDate?: string;
        toDate?: string;
        page?: number;
        pageSize?: number;
    }): Promise<StockLedgerEntryDto[]> {
        try {
            const response = await httpClient.get<StockLedgerEntryDto[]>('/Inventory/stock-ledger', { params });
            return Array.isArray(response.data) ? response.data : [];
        } catch {
            return [];
        }
    },
};

export default inventoryService;

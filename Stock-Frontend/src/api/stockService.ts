import { axiosClient } from './axiosClient';
import {
  unwrapList,
  mapWarehouseDtoToLegacy,
  mapWarehouseDtoToRecord,
  mapWarehouseRecordToDto,
  mapItemDtoToRecord,
  mapItemDtoToProduct,
  mapItemGroupDtoToRecord,
  flattenItemGroupTree,
  mapItemAttributeDtoToRecord,
  mapBrandDtoToRecord,
  mapUomDtoToRecord,
  mapUomConversionDtoToRecord,
  mapSerialNumberDtoToRecord,
  mapBatchDtoToRecord,
  mapBundleDtoToRecord,
  mapInventoryDimensionDtoToRecord,
  mapShippingRuleDtoToRecord,
  mapItemAlternativeDtoToRecord,
  mapQiTemplateDtoToRecord,
  mapQualityInspectionDtoToRecord,
  mapDeliveryTripDtoToRecord,
  mapStockEntryDtoToRecord,
  mapStockEntryRecordToDto,
  mapPurchaseReceiptDtoToRecord,
  mapDeliveryNoteDtoToRecord,
  mapMaterialRequestDtoToRecord,
  mapPickListDtoToRecord,
  mapStockReconciliationDtoToRecord,
  mapLandedCostVoucherDtoToRecord,
  mapRepostValuationDtoToRecord,
  mapPackingSlipDtoToRecord,
  mapMovementFromLedgerRow,
  MR_PURPOSE_TO_API,
  PICK_PURPOSE_TO_API,
} from './backendAdapters';
import type {
  Warehouse,
  StockProduct,
  StockMovement,
  Supplier,
  StockStats,
  StockEntryRecord,
  PurchaseReceiptRecord,
  DeliveryNoteRecord,
  MaterialRequestRecord,
  PickListRecord,
  StockReconciliationRecord,
  LandedCostVoucherRecord,
  RepostItemValuationRecord,
  PackingSlipRecord,
  ItemRecord,
  ItemGroupRecord,
  ItemAttributeRecord,
  BrandRecord,
  WarehouseRecord,
  UOMRecord,
  UOMConversionFactorRecord,
  SerialNoRecord,
  BatchRecord,
  SerialAndBatchBundleRecord,
  InventoryDimensionRecord,
  ShippingRuleRecord,
  ItemAlternativeRecord,
  DeliveryTripRecord,
  QualityInspectionTemplateRecord,
  QualityInspectionRecord,
} from '../types';

export interface StockSettingsApiDto {
  id?: string;
  itemNamingBy: string;
  defaultValuationMethod: string;
  defaultWarehouseId?: string | null;
  defaultStockUomId?: string | null;
  sampleRetentionWarehouseId?: string | null;
  overDeliveryReceiptAllowancePercent: number;
  roleAllowedToOverDeliverReceive?: string | null;
  actionIfQualityInspectionIsNotSubmitted: string;
  actionIfQualityInspectionIsRejected: string;
  allowNegativeStock: boolean;
  automaticallySetSerialNosBasedOnFifo: boolean;
  autoCreateSerialAndBatchBundleForOutward: boolean;
  useSerialBatchFields: boolean;
  showBarcodeFieldInStockTransactions: boolean;
  convertItemDescriptionToCleanHtml: boolean;
  autoInsertPriceListRateIfMissing: boolean;
  allowEditStockUomQtyForSalesDocuments: boolean;
  allowEditStockUomQtyForPurchaseDocuments: boolean;
  autoMaterialRequestOnReorderLevel: boolean;
  notifyByEmailOnCreationOfAutomaticMaterialRequest: boolean;
  allowMaterialTransferFromDeliveryNoteToSalesInvoice: boolean;
  allowMaterialTransferFromPurchaseReceiptToPurchaseInvoice: boolean;
  stockFrozenUpto?: string | null;
  freezeStocksOlderThanDays: number;
  roleAllowedToEditFrozenStock?: string | null;
}

const DEFAULT_PAGE_QUERY = { pageNumber: 1, pageSize: 200 };

function toIsoDateSafe(val?: string | null): string {
  if (!val) return new Date().toISOString();
  const ddMmYyyy = /^(\d{2})-(\d{2})-(\d{4})$/.exec(val.trim());
  if (ddMmYyyy) {
    const d = new Date(Number(ddMmYyyy[3]), Number(ddMmYyyy[2]) - 1, Number(ddMmYyyy[1]));
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  const parsed = new Date(val);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}
const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';

// Simple in-memory lookup cache for resolving item/warehouse/uom IDs during writes
let cachedRawItems: any[] = [];
let cachedRawWarehouses: any[] = [];
let cachedRawUoms: any[] = [];

async function ensureLookups() {
  const tasks: Promise<void>[] = [];
  if (cachedRawItems.length === 0) {
    tasks.push(
      axiosClient
        .get('/v1/stock/setup/items', { params: { pageNumber: 1, pageSize: 500 } })
        .then((res) => {
          cachedRawItems = unwrapList(res.data);
        })
        .catch(() => {})
    );
  }
  if (cachedRawWarehouses.length === 0) {
    tasks.push(
      axiosClient
        .get('/v1/stock/setup/warehouses', { params: { pageNumber: 1, pageSize: 500 } })
        .then((res) => {
          cachedRawWarehouses = unwrapList(res.data);
        })
        .catch(() => {})
    );
  }
  if (cachedRawUoms.length === 0) {
    tasks.push(
      axiosClient
        .get('/v1/stock/setup/uoms')
        .then((res) => {
          cachedRawUoms = Array.isArray(res.data) ? res.data : unwrapList(res.data);
        })
        .catch(() => {})
    );
  }
  await Promise.all(tasks);
}

export const stockService = {
  // ==========================================
  // WORKSPACE, DASHBOARD & SETTINGS
  // ==========================================
  async getWorkspaceHome(): Promise<any> {
    const res = await axiosClient.get('/v1/stock/workspace/home');
    return res.data;
  },

  async getDashboard(): Promise<any> {
    const res = await axiosClient.get('/v1/stock/dashboard');
    return res.data;
  },

  async getStockSettings(): Promise<StockSettingsApiDto> {
    const res = await axiosClient.get<StockSettingsApiDto>('/v1/stock/settings');
    return res.data;
  },

  async updateStockSettings(dto: Partial<StockSettingsApiDto>): Promise<StockSettingsApiDto> {
    const res = await axiosClient.put<StockSettingsApiDto>('/v1/stock/settings', dto);
    return res.data;
  },

  async getItemVariantSettings(): Promise<any> {
    const res = await axiosClient.get('/v1/stock/item-variant-settings');
    return res.data?.data || res.data;
  },

  async updateItemVariantSettings(dto: any): Promise<any> {
    const res = await axiosClient.put('/v1/stock/item-variant-settings', dto);
    return res.data?.data || res.data;
  },

  async getStockRepostingSettings(): Promise<any> {
    const res = await axiosClient.get('/v1/stock/reposting-settings');
    return res.data?.data || res.data;
  },

  async updateStockRepostingSettings(dto: any): Promise<any> {
    const res = await axiosClient.put('/v1/stock/reposting-settings', dto);
    return res.data?.data || res.data;
  },

  async getDeliverySettings(): Promise<any> {
    const res = await axiosClient.get('/v1/stock/delivery-settings');
    return res.data?.data || res.data;
  },

  async updateDeliverySettings(dto: any): Promise<any> {
    const res = await axiosClient.put('/v1/stock/delivery-settings', dto);
    return res.data?.data || res.data;
  },

  async getClosingBalances(): Promise<any[]> {
    const res = await axiosClient.get('/v1/stock/closing-balances');
    return Array.isArray(res.data) ? res.data : [];
  },

  // ==========================================
  // LEGACY OVERVIEW HELPERS (BACKED BY REAL API)
  // ==========================================
  async getWarehouses(): Promise<Warehouse[]> {
    const res = await axiosClient.get('/v1/stock/setup/warehouses', { params: DEFAULT_PAGE_QUERY });
    const raw = unwrapList<any>(res.data);
    cachedRawWarehouses = raw;
    return raw.map(mapWarehouseDtoToLegacy);
  },

  async createWarehouse(warehouse: Partial<Warehouse>): Promise<Warehouse> {
    const res = await axiosClient.post('/v1/stock/setup/warehouses', {
      code: warehouse.code || (warehouse.name || 'WH').toUpperCase().replace(/\s+/g, '-'),
      name: warehouse.name || '',
      warehouseType: 'Main',
      addressLine1: warehouse.location || null,
      phoneNo: warehouse.contactPhone || null,
      disabled: warehouse.status === 'inactive',
    });
    cachedRawWarehouses = [];
    return mapWarehouseDtoToLegacy(res.data);
  },

  async getProducts(): Promise<StockProduct[]> {
    const res = await axiosClient.get('/v1/stock/setup/items', { params: DEFAULT_PAGE_QUERY });
    const raw = unwrapList<any>(res.data);
    cachedRawItems = raw;
    return raw.map(mapItemDtoToProduct);
  },

  async createProduct(product: Partial<StockProduct>): Promise<StockProduct> {
    await ensureLookups();
    const defaultUomId = cachedRawUoms[0]?.id || EMPTY_GUID;
    const groupsRes = await axiosClient.get('/v1/stock/setup/item-groups/tree').catch(() => ({ data: [] }));
    const groups = flattenItemGroupTree(groupsRes.data);
    const matchedGroup = groups.find((g) => g.itemGroupName === product.category) || groups[0];

    const res = await axiosClient.post('/v1/stock/setup/items', {
      itemCode: product.sku || `ITEM-${Date.now()}`,
      itemName: product.name || '',
      itemGroupId: matchedGroup?.id || EMPTY_GUID,
      stockUomId: defaultUomId,
      isStockItem: true,
      openingStock: Number(product.currentStock || 0),
      valuationRate: Number(product.buyPrice || 0),
      standardSellingRate: Number(product.sellPrice || 0),
      safetyStock: Number(product.minStock || 0),
    });
    cachedRawItems = [];
    return mapItemDtoToProduct(res.data);
  },

  async getMovements(): Promise<StockMovement[]> {
    const res = await axiosClient.get('/v1/stock/reports/stock-ledger');
    const rows = Array.isArray(res.data) ? res.data : unwrapList(res.data);
    return rows.map(mapMovementFromLedgerRow);
  },

  async createMovement(movement: Partial<StockMovement>): Promise<StockMovement> {
    await ensureLookups();
    const purpose =
      movement.type === 'IN'
        ? 'MaterialReceipt'
        : movement.type === 'OUT'
        ? 'MaterialIssue'
        : 'MaterialTransfer';
    const defaultUomId = cachedRawUoms[0]?.id || EMPTY_GUID;
    const res = await axiosClient.post('/v1/stock/stock-entries', {
      entryNo: movement.documentNo || '',
      purpose,
      postingDate: movement.date || new Date().toISOString(),
      defaultSourceWarehouseId: movement.fromWarehouseId || null,
      defaultTargetWarehouseId: movement.toWarehouseId || null,
      remarks: movement.note || null,
      lines: [
        {
          itemId: movement.productId || EMPTY_GUID,
          sourceWarehouseId: movement.fromWarehouseId || null,
          targetWarehouseId: movement.toWarehouseId || null,
          qty: Number(movement.quantity || 1),
          uomId: defaultUomId,
          stockUomId: defaultUomId,
          conversionFactor: 1,
          basicRate: Number(movement.unitPrice || 0),
        },
      ],
    });
    return {
      id: res.data.id,
      documentNo: res.data.entryNo || '',
      type: movement.type || 'IN',
      productId: movement.productId || '',
      productName: movement.productName || '',
      productSku: movement.productSku || '',
      quantity: Number(movement.quantity || 0),
      unit: movement.unit || 'Nos',
      unitPrice: Number(movement.unitPrice || 0),
      totalPrice: Number(movement.totalPrice || 0),
      date: res.data.postingDate || new Date().toISOString(),
      performedBy: movement.performedBy || 'You',
      status: 'completed',
    };
  },

  async getSuppliers(): Promise<Supplier[]> {
    const res = await axiosClient.get('/v1/stock/setup/suppliers');
    return unwrapList<any>(res.data).map((s: any) => ({
      id: s.id,
      name: s.name || s.supplierName || '',
      code: s.code || s.supplierCode || '',
      contactPerson: s.contactPerson || s.primaryContact || '',
      email: s.email || s.emailId || '',
      phone: s.phone || s.phoneNo || s.mobileNo || '',
      address: s.address || s.addressLine1 || '',
      productsSuppliedCount: Number(s.productsSuppliedCount || 0),
      totalSuppliedCount: Number(s.totalSuppliedCount || 0),
      status: s.status || 'Active',
      createdAt: s.createdAt || new Date().toISOString(),
    }));
  },

  async getCustomers(): Promise<any[]> {
    const res = await axiosClient.get('/v1/stock/setup/customers');
    return unwrapList<any>(res.data);
  },

  async getStats(): Promise<StockStats> {
    const [home, dash] = await Promise.all([
      this.getWorkspaceHome().catch(() => ({})),
      this.getDashboard().catch(() => ({})),
    ]);
    return {
      totalProducts: Number(dash.totalActiveItems ?? home.totalActiveItemsCount ?? 0),
      totalWarehouses: Number(dash.totalActiveWarehouses ?? home.totalWarehousesCount ?? 0),
      totalInventoryValue: Number(dash.totalStockValue ?? home.totalInventoryValue ?? 0),
      lowStockCount: Number(dash.lowStockItemsCount ?? home.lowStockAlertItemsCount ?? 0),
      outOfStockCount: 0,
      recentMovementsCount: Number(home.openStockEntriesCount ?? 0),
    };
  },

  // ==========================================
  // TRANSACTIONS (StockEntry, PR, DN, MR, PickList)
  // ==========================================
  async getStockEntries(params?: Record<string, any>): Promise<StockEntryRecord[]> {
    await ensureLookups();
    const res = await axiosClient.get('/v1/stock/stock-entries', {
      params: { ...DEFAULT_PAGE_QUERY, ...params },
    });
    return unwrapList<any>(res.data).map(mapStockEntryDtoToRecord);
  },

  async getStockEntryById(id: string): Promise<StockEntryRecord> {
    const res = await axiosClient.get(`/v1/stock/stock-entries/${id}`);
    return mapStockEntryDtoToRecord(res.data);
  },

  async createStockEntry(entry: Partial<StockEntryRecord>): Promise<StockEntryRecord> {
    await ensureLookups();
    const payload = mapStockEntryRecordToDto(entry, {
      items: cachedRawItems,
      warehouses: cachedRawWarehouses,
      uoms: cachedRawUoms,
    });
    const res = await axiosClient.post('/v1/stock/stock-entries', payload);
    return mapStockEntryDtoToRecord(res.data);
  },

  async submitStockEntry(id: string): Promise<StockEntryRecord> {
    const res = await axiosClient.post(`/v1/stock/stock-entries/${id}/submit`);
    return mapStockEntryDtoToRecord(res.data);
  },

  async cancelStockEntry(id: string, reason?: string): Promise<StockEntryRecord> {
    const res = await axiosClient.post(`/v1/stock/stock-entries/${id}/cancel`, null, {
      params: reason ? { reason } : undefined,
    });
    return mapStockEntryDtoToRecord(res.data);
  },

  async amendStockEntry(id: string): Promise<StockEntryRecord> {
    const res = await axiosClient.post(`/v1/stock/stock-entries/${id}/amend`);
    return mapStockEntryDtoToRecord(res.data);
  },

  async updateStockEntry(id: string, entry: Partial<StockEntryRecord>): Promise<StockEntryRecord> {
    await ensureLookups();
    const payload = {
      id,
      ...mapStockEntryRecordToDto(entry, {
        items: cachedRawItems,
        warehouses: cachedRawWarehouses,
        uoms: cachedRawUoms,
      }),
    };
    const res = await axiosClient.put(`/v1/stock/stock-entries/${id}`, payload);
    return mapStockEntryDtoToRecord(res.data);
  },

  async deleteStockEntry(id: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/stock-entries/${id}`);
  },

  async createStockEntryFromMaterialRequest(materialRequestId: string): Promise<StockEntryRecord> {
    const res = await axiosClient.post(`/v1/stock/stock-entries/from-material-request/${materialRequestId}`);
    return mapStockEntryDtoToRecord(res.data);
  },

  async endTransitStockEntry(id: string, finalTargetWarehouseId: string): Promise<StockEntryRecord> {
    const res = await axiosClient.post(`/v1/stock/stock-entries/${id}/end-transit/${finalTargetWarehouseId}`);
    return mapStockEntryDtoToRecord(res.data);
  },

  async getPurchaseReceipts(params?: Record<string, any>): Promise<PurchaseReceiptRecord[]> {
    const res = await axiosClient.get('/v1/stock/purchase-receipts', {
      params: { ...DEFAULT_PAGE_QUERY, ...params },
    });
    return unwrapList<any>(res.data).map(mapPurchaseReceiptDtoToRecord);
  },

  async getPurchaseReceiptById(id: string): Promise<PurchaseReceiptRecord> {
    const res = await axiosClient.get(`/v1/stock/purchase-receipts/${id}`);
    return mapPurchaseReceiptDtoToRecord(res.data);
  },

  async createPurchaseReceipt(entry: Partial<PurchaseReceiptRecord>): Promise<PurchaseReceiptRecord> {
    await ensureLookups();
    const findWhId = (name?: string) =>
      cachedRawWarehouses.find((w) => w.name === name || w.code === name || w.id === name)?.id || null;
    const defaultUomId = cachedRawUoms[0]?.id || EMPTY_GUID;
    const accWhId = findWhId(entry.acceptedWarehouse) || cachedRawWarehouses[0]?.id || EMPTY_GUID;

    const payload = {
      receiptNo: entry.series || '',
      vendorId: EMPTY_GUID,
      vendorName: entry.supplierName || '',
      postingDate: toIsoDateSafe(entry.postingDate),
      currency: entry.currency || 'AZN',
      exchangeRate: Number(entry.exchangeRate || 1),
      acceptedWarehouseId: accWhId,
      rejectedWarehouseId: findWhId(entry.rejectedWarehouse),
      remarks: entry.remarks || null,
      lines: (entry.items || []).map((line) => {
        const matchedItem = cachedRawItems.find((i) => i.itemCode === line.itemCode || i.id === line.itemCode);
        const uomId = cachedRawUoms.find((u) => u.uomName === line.uom)?.id || matchedItem?.stockUomId || defaultUomId;
        return {
          itemId: matchedItem?.id || EMPTY_GUID,
          itemCode: line.itemCode,
          itemName: line.itemName,
          receivedQty: Number(line.receivedQty || 0),
          acceptedQty: Number(line.acceptedQty || 0),
          rejectedQty: Number(line.rejectedQty || 0),
          uomId,
          stockUomId: matchedItem?.stockUomId || uomId,
          conversionFactor: 1,
          acceptedWarehouseId: findWhId(line.warehouse) || accWhId,
          rate: Number(line.rate || 0),
          amount: Number(line.amount || 0),
        };
      }),
    };

    const res = await axiosClient.post('/v1/stock/purchase-receipts', payload);
    return mapPurchaseReceiptDtoToRecord(res.data);
  },

  async submitPurchaseReceipt(id: string): Promise<PurchaseReceiptRecord> {
    const res = await axiosClient.post(`/v1/stock/purchase-receipts/${id}/submit`);
    return mapPurchaseReceiptDtoToRecord(res.data);
  },

  async cancelPurchaseReceipt(id: string, reason?: string): Promise<PurchaseReceiptRecord> {
    const res = await axiosClient.post(`/v1/stock/purchase-receipts/${id}/cancel`, null, {
      params: reason ? { reason } : undefined,
    });
    return mapPurchaseReceiptDtoToRecord(res.data);
  },

  async updatePurchaseReceipt(id: string, entry: Partial<PurchaseReceiptRecord>): Promise<PurchaseReceiptRecord> {
    await ensureLookups();
    const findWhId = (name?: string) =>
      cachedRawWarehouses.find((w) => w.name === name || w.code === name || w.id === name)?.id || null;
    const defaultUomId = cachedRawUoms[0]?.id || EMPTY_GUID;
    const accWhId = findWhId(entry.acceptedWarehouse) || cachedRawWarehouses[0]?.id || EMPTY_GUID;
    const payload = {
      id,
      receiptNo: entry.series || '',
      vendorId: EMPTY_GUID,
      vendorName: entry.supplierName || '',
      postingDate: toIsoDateSafe(entry.postingDate),
      currency: entry.currency || 'AZN',
      exchangeRate: Number(entry.exchangeRate || 1),
      acceptedWarehouseId: accWhId,
      rejectedWarehouseId: findWhId(entry.rejectedWarehouse),
      remarks: entry.remarks || null,
      lines: (entry.items || []).map((line) => {
        const matchedItem = cachedRawItems.find((i) => i.itemCode === line.itemCode || i.id === line.itemCode);
        const uomId = cachedRawUoms.find((u) => u.uomName === line.uom)?.id || matchedItem?.stockUomId || defaultUomId;
        return {
          itemId: matchedItem?.id || EMPTY_GUID,
          itemCode: line.itemCode,
          itemName: line.itemName,
          receivedQty: Number(line.receivedQty || 0),
          acceptedQty: Number(line.acceptedQty || 0),
          rejectedQty: Number(line.rejectedQty || 0),
          uomId,
          stockUomId: matchedItem?.stockUomId || uomId,
          conversionFactor: 1,
          acceptedWarehouseId: findWhId(line.warehouse) || accWhId,
          rate: Number(line.rate || 0),
          amount: Number(line.amount || 0),
        };
      }),
    };
    const res = await axiosClient.put(`/v1/stock/purchase-receipts/${id}`, payload);
    return mapPurchaseReceiptDtoToRecord(res.data);
  },

  async deletePurchaseReceipt(id: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/purchase-receipts/${id}`);
  },

  async amendPurchaseReceipt(id: string): Promise<PurchaseReceiptRecord> {
    const res = await axiosClient.post(`/v1/stock/purchase-receipts/${id}/amend`);
    return mapPurchaseReceiptDtoToRecord(res.data);
  },

  async makePurchaseReturn(id: string): Promise<PurchaseReceiptRecord> {
    const res = await axiosClient.post(`/v1/stock/purchase-receipts/${id}/make-return`);
    return mapPurchaseReceiptDtoToRecord(res.data);
  },

  async getDeliveryNotes(params?: Record<string, any>): Promise<DeliveryNoteRecord[]> {
    const res = await axiosClient.get('/v1/stock/delivery-notes', {
      params: { ...DEFAULT_PAGE_QUERY, ...params },
    });
    return unwrapList<any>(res.data).map(mapDeliveryNoteDtoToRecord);
  },

  async getDeliveryNoteById(id: string): Promise<DeliveryNoteRecord> {
    const res = await axiosClient.get(`/v1/stock/delivery-notes/${id}`);
    return mapDeliveryNoteDtoToRecord(res.data);
  },

  async createDeliveryNote(entry: Partial<DeliveryNoteRecord>): Promise<DeliveryNoteRecord> {
    await ensureLookups();
    const findWhId = (name?: string) =>
      cachedRawWarehouses.find((w) => w.name === name || w.code === name || w.id === name)?.id || null;
    const defaultUomId = cachedRawUoms[0]?.id || EMPTY_GUID;
    const srcWhId = findWhId(entry.setSourceWarehouse) || cachedRawWarehouses[0]?.id || EMPTY_GUID;

    const payload = {
      deliveryNo: entry.series || '',
      customerId: EMPTY_GUID,
      customerName: entry.customerName || entry.customer || '',
      postingDate: toIsoDateSafe(entry.postingDate),
      currency: entry.currency || 'AZN',
      exchangeRate: Number(entry.exchangeRate || 1),
      sourceWarehouseId: srcWhId,
      isReturn: Boolean(entry.isReturn),
      remarks: entry.remarks || null,
      lines: (entry.items || []).map((line) => {
        const matchedItem = cachedRawItems.find((i) => i.itemCode === line.itemCode || i.id === line.itemCode);
        const uomId = cachedRawUoms.find((u) => u.uomName === line.uom)?.id || matchedItem?.stockUomId || defaultUomId;
        return {
          itemId: matchedItem?.id || EMPTY_GUID,
          itemCode: line.itemCode,
          itemName: line.itemName,
          warehouseId: findWhId(line.warehouse) || srcWhId,
          qty: Number(line.qty || 0),
          uomId,
          stockUomId: matchedItem?.stockUomId || uomId,
          conversionFactor: 1,
          sellingRate: Number(line.rate || 0),
          netSellingAmount: Number(line.amount || 0),
        };
      }),
    };

    const res = await axiosClient.post('/v1/stock/delivery-notes', payload);
    return mapDeliveryNoteDtoToRecord(res.data);
  },

  async submitDeliveryNote(id: string): Promise<DeliveryNoteRecord> {
    const res = await axiosClient.post(`/v1/stock/delivery-notes/${id}/submit`);
    return mapDeliveryNoteDtoToRecord(res.data);
  },

  async cancelDeliveryNote(id: string, reason?: string): Promise<DeliveryNoteRecord> {
    const res = await axiosClient.post(`/v1/stock/delivery-notes/${id}/cancel`, null, {
      params: reason ? { reason } : undefined,
    });
    return mapDeliveryNoteDtoToRecord(res.data);
  },

  async updateDeliveryNote(id: string, entry: Partial<DeliveryNoteRecord>): Promise<DeliveryNoteRecord> {
    await ensureLookups();
    const findWhId = (name?: string) =>
      cachedRawWarehouses.find((w) => w.name === name || w.code === name || w.id === name)?.id || null;
    const defaultUomId = cachedRawUoms[0]?.id || EMPTY_GUID;
    const srcWhId = findWhId(entry.setSourceWarehouse) || cachedRawWarehouses[0]?.id || EMPTY_GUID;
    const payload = {
      id,
      deliveryNo: entry.series || '',
      customerId: EMPTY_GUID,
      customerName: entry.customerName || entry.customer || '',
      postingDate: toIsoDateSafe(entry.postingDate),
      currency: entry.currency || 'AZN',
      exchangeRate: Number(entry.exchangeRate || 1),
      sourceWarehouseId: srcWhId,
      isReturn: Boolean(entry.isReturn),
      remarks: entry.remarks || null,
      lines: (entry.items || []).map((line) => {
        const matchedItem = cachedRawItems.find((i) => i.itemCode === line.itemCode || i.id === line.itemCode);
        const uomId = cachedRawUoms.find((u) => u.uomName === line.uom)?.id || matchedItem?.stockUomId || defaultUomId;
        return {
          itemId: matchedItem?.id || EMPTY_GUID,
          itemCode: line.itemCode,
          itemName: line.itemName,
          warehouseId: findWhId(line.warehouse) || srcWhId,
          qty: Number(line.qty || 0),
          uomId,
          stockUomId: matchedItem?.stockUomId || uomId,
          conversionFactor: 1,
          sellingRate: Number(line.rate || 0),
          netSellingAmount: Number(line.amount || 0),
        };
      }),
    };
    const res = await axiosClient.put(`/v1/stock/delivery-notes/${id}`, payload);
    return mapDeliveryNoteDtoToRecord(res.data);
  },

  async deleteDeliveryNote(id: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/delivery-notes/${id}`);
  },

  async amendDeliveryNote(id: string): Promise<DeliveryNoteRecord> {
    const res = await axiosClient.post(`/v1/stock/delivery-notes/${id}/amend`);
    return mapDeliveryNoteDtoToRecord(res.data);
  },

  async makeSalesReturn(id: string): Promise<DeliveryNoteRecord> {
    const res = await axiosClient.post(`/v1/stock/delivery-notes/${id}/make-return`);
    return mapDeliveryNoteDtoToRecord(res.data);
  },

  async getMaterialRequests(params?: Record<string, any>): Promise<MaterialRequestRecord[]> {
    const res = await axiosClient.get('/v1/stock/material-requests', {
      params: { ...DEFAULT_PAGE_QUERY, ...params },
    });
    return unwrapList<any>(res.data).map(mapMaterialRequestDtoToRecord);
  },

  async createMaterialRequest(entry: Partial<MaterialRequestRecord>): Promise<MaterialRequestRecord> {
    await ensureLookups();
    const findWhId = (name?: string) =>
      cachedRawWarehouses.find((w) => w.name === name || w.code === name || w.id === name)?.id || null;
    const defaultUomId = cachedRawUoms[0]?.id || EMPTY_GUID;
    const defaultWhId = findWhId(entry.setWarehouse) || cachedRawWarehouses[0]?.id || EMPTY_GUID;

    const payload = {
      requestNo: entry.series || entry.title || '',
      requestType: MR_PURPOSE_TO_API[entry.purpose || 'Purchase'] || 'Purchase',
      transactionDate: entry.transactionDate ? new Date(entry.transactionDate).toISOString() : new Date().toISOString(),
      requiredByDate: entry.requiredBy ? new Date(entry.requiredBy).toISOString() : new Date().toISOString(),
      setWarehouseId: defaultWhId,
      lines: (entry.items || []).map((line) => {
        const matchedItem = cachedRawItems.find((i) => i.itemCode === line.itemCode || i.id === line.itemCode);
        const uomId = cachedRawUoms.find((u) => u.uomName === line.uom)?.id || matchedItem?.stockUomId || defaultUomId;
        return {
          itemId: matchedItem?.id || EMPTY_GUID,
          itemCode: line.itemCode,
          itemName: line.itemName,
          warehouseId: findWhId(line.warehouse) || defaultWhId,
          scheduleDate: line.requiredBy ? new Date(line.requiredBy).toISOString() : new Date().toISOString(),
          qty: Number(line.qty || 0),
          uomId,
          stockUomId: matchedItem?.stockUomId || uomId,
          conversionFactor: 1,
          estimatedRate: Number(line.rate || 0),
          amount: Number(line.amount || 0),
        };
      }),
    };

    const res = await axiosClient.post('/v1/stock/material-requests', payload);
    return mapMaterialRequestDtoToRecord(res.data);
  },

  async submitMaterialRequest(id: string): Promise<MaterialRequestRecord> {
    const res = await axiosClient.post(`/v1/stock/material-requests/${id}/submit`);
    return mapMaterialRequestDtoToRecord(res.data);
  },

  async cancelMaterialRequest(id: string, reason?: string): Promise<MaterialRequestRecord> {
    const res = await axiosClient.post(`/v1/stock/material-requests/${id}/cancel`, null, {
      params: reason ? { reason } : undefined,
    });
    return mapMaterialRequestDtoToRecord(res.data);
  },

  async updateMaterialRequest(id: string, entry: Partial<MaterialRequestRecord>): Promise<MaterialRequestRecord> {
    await ensureLookups();
    const findWhId = (name?: string) =>
      cachedRawWarehouses.find((w) => w.name === name || w.code === name || w.id === name)?.id || null;
    const defaultUomId = cachedRawUoms[0]?.id || EMPTY_GUID;
    const defaultWhId = findWhId(entry.setWarehouse) || cachedRawWarehouses[0]?.id || EMPTY_GUID;
    const payload = {
      id,
      requestNo: entry.series || entry.title || '',
      requestType: MR_PURPOSE_TO_API[entry.purpose || 'Purchase'] || 'Purchase',
      transactionDate: entry.transactionDate ? new Date(entry.transactionDate).toISOString() : new Date().toISOString(),
      requiredByDate: entry.requiredBy ? new Date(entry.requiredBy).toISOString() : new Date().toISOString(),
      setWarehouseId: defaultWhId,
      lines: (entry.items || []).map((line) => {
        const matchedItem = cachedRawItems.find((i) => i.itemCode === line.itemCode || i.id === line.itemCode);
        const uomId = cachedRawUoms.find((u) => u.uomName === line.uom)?.id || matchedItem?.stockUomId || defaultUomId;
        return {
          itemId: matchedItem?.id || EMPTY_GUID,
          itemCode: line.itemCode,
          itemName: line.itemName,
          warehouseId: findWhId(line.warehouse) || defaultWhId,
          scheduleDate: line.requiredBy ? new Date(line.requiredBy).toISOString() : new Date().toISOString(),
          qty: Number(line.qty || 0),
          uomId,
          stockUomId: matchedItem?.stockUomId || uomId,
          conversionFactor: 1,
          estimatedRate: Number(line.rate || 0),
          amount: Number(line.amount || 0),
        };
      }),
    };
    const res = await axiosClient.put(`/v1/stock/material-requests/${id}`, payload);
    return mapMaterialRequestDtoToRecord(res.data);
  },

  async deleteMaterialRequest(id: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/material-requests/${id}`);
  },

  async generateLowStockMaterialRequest(warehouseId?: string): Promise<MaterialRequestRecord> {
    const res = await axiosClient.post('/v1/stock/material-requests/generate-low-stock', null, {
      params: warehouseId ? { warehouseId } : undefined,
    });
    return mapMaterialRequestDtoToRecord(res.data);
  },

  async getPickLists(params?: Record<string, any>): Promise<PickListRecord[]> {
    const res = await axiosClient.get('/v1/stock/pick-lists', {
      params: { ...DEFAULT_PAGE_QUERY, ...params },
    });
    return unwrapList<any>(res.data).map(mapPickListDtoToRecord);
  },

  async createPickList(entry: Partial<PickListRecord>): Promise<PickListRecord> {
    await ensureLookups();
    const findWhId = (name?: string) =>
      cachedRawWarehouses.find((w) => w.name === name || w.code === name || w.id === name)?.id || null;
    const defaultUomId = cachedRawUoms[0]?.id || EMPTY_GUID;
    const parentWhId = findWhId(entry.warehouse) || cachedRawWarehouses[0]?.id || EMPTY_GUID;

    const payload = {
      pickListNo: entry.series || '',
      purpose: PICK_PURPOSE_TO_API[entry.purpose || 'Delivery'] || 'Delivery',
      customerName: entry.customer || null,
      parentWarehouseId: parentWhId,
      considerRejectedWarehouses: Boolean(entry.considerRejectedWarehouses),
      locations: (entry.items || []).map((loc) => {
        const matchedItem = cachedRawItems.find((i) => i.itemCode === loc.item || i.id === loc.item);
        const uomId = cachedRawUoms.find((u) => u.uomName === loc.uom)?.id || matchedItem?.stockUomId || defaultUomId;
        return {
          itemId: matchedItem?.id || EMPTY_GUID,
          itemCode: loc.item,
          itemName: loc.itemName,
          warehouseId: findWhId(loc.warehouse) || parentWhId,
          requestedQty: Number(loc.qty || 0),
          pickedQty: Number(loc.pickedQty || 0),
          stockQty: Number(loc.stockQty || 0),
          uomId,
          stockUomId: matchedItem?.stockUomId || uomId,
          conversionFactor: 1,
        };
      }),
    };

    const res = await axiosClient.post('/v1/stock/pick-lists', payload);
    return mapPickListDtoToRecord(res.data);
  },

  async submitPickList(id: string): Promise<PickListRecord> {
    const res = await axiosClient.post(`/v1/stock/pick-lists/${id}/submit`);
    return mapPickListDtoToRecord(res.data);
  },

  async cancelPickList(id: string, reason?: string): Promise<PickListRecord> {
    const res = await axiosClient.post(`/v1/stock/pick-lists/${id}/cancel`, null, {
      params: reason ? { reason } : undefined,
    });
    return mapPickListDtoToRecord(res.data);
  },

  async updatePickList(id: string, entry: Partial<PickListRecord>): Promise<PickListRecord> {
    await ensureLookups();
    const findWhId = (name?: string) =>
      cachedRawWarehouses.find((w) => w.name === name || w.code === name || w.id === name)?.id || null;
    const defaultUomId = cachedRawUoms[0]?.id || EMPTY_GUID;
    const parentWhId = findWhId(entry.warehouse) || cachedRawWarehouses[0]?.id || EMPTY_GUID;
    const payload = {
      id,
      pickListNo: entry.series || '',
      purpose: PICK_PURPOSE_TO_API[entry.purpose || 'Delivery'] || 'Delivery',
      customerName: entry.customer || null,
      parentWarehouseId: parentWhId,
      considerRejectedWarehouses: Boolean(entry.considerRejectedWarehouses),
      locations: (entry.items || []).map((loc) => {
        const matchedItem = cachedRawItems.find((i) => i.itemCode === loc.item || i.id === loc.item);
        const uomId = cachedRawUoms.find((u) => u.uomName === loc.uom)?.id || matchedItem?.stockUomId || defaultUomId;
        return {
          itemId: matchedItem?.id || EMPTY_GUID,
          itemCode: loc.item,
          itemName: loc.itemName,
          warehouseId: findWhId(loc.warehouse) || parentWhId,
          requestedQty: Number(loc.qty || 0),
          pickedQty: Number(loc.pickedQty || 0),
          stockQty: Number(loc.stockQty || 0),
          uomId,
          stockUomId: matchedItem?.stockUomId || uomId,
          conversionFactor: 1,
        };
      }),
    };
    const res = await axiosClient.put(`/v1/stock/pick-lists/${id}`, payload);
    return mapPickListDtoToRecord(res.data);
  },

  async deletePickList(id: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/pick-lists/${id}`);
  },

  async autoAllocatePickList(id: string): Promise<PickListRecord> {
    const res = await axiosClient.post(`/v1/stock/pick-lists/${id}/auto-allocate`);
    return mapPickListDtoToRecord(res.data);
  },

  async makeDeliveryNoteFromPickList(id: string): Promise<DeliveryNoteRecord> {
    const res = await axiosClient.post(`/v1/stock/pick-lists/${id}/make-delivery-note`);
    return mapDeliveryNoteDtoToRecord(res.data);
  },

  // ==========================================
  // TOOLS (Reconciliation, Landed Cost, Repost, Packing Slip)
  // ==========================================
  async getStockReconciliations(params?: Record<string, any>): Promise<StockReconciliationRecord[]> {
    const res = await axiosClient.get('/v1/stock/tools/reconciliations', {
      params: { ...DEFAULT_PAGE_QUERY, ...params },
    });
    return unwrapList<any>(res.data).map(mapStockReconciliationDtoToRecord);
  },

  async createStockReconciliation(entry: Partial<StockReconciliationRecord>): Promise<StockReconciliationRecord> {
    await ensureLookups();
    const findWhId = (name?: string) =>
      cachedRawWarehouses.find((w) => w.name === name || w.code === name || w.id === name)?.id || null;
    const defaultWhId = findWhId(entry.defaultWarehouse) || cachedRawWarehouses[0]?.id || EMPTY_GUID;

    const payload = {
      reconciliationNo: entry.series || '',
      purpose: entry.purpose === 'Opening Stock' ? 'OpeningStock' : 'StockReconciliation',
      postingDate: toIsoDateSafe(entry.postingDate),
      defaultWarehouseId: defaultWhId,
      expenseAccount: entry.differenceAccount || '6100',
      costCenter: entry.costCenter || null,
      lines: (entry.items || []).map((line) => {
        const matchedItem = cachedRawItems.find((i) => i.itemCode === line.itemCode || i.id === line.itemCode);
        return {
          itemId: matchedItem?.id || EMPTY_GUID,
          itemCode: line.itemCode,
          itemName: line.itemName,
          warehouseId: findWhId(line.warehouse) || defaultWhId,
          reconciledQty: Number(line.qty || 0),
          reconciledValuationRate: Number(line.valuationRate || 0),
          reconciledAmount: Number(line.amount || 0),
        };
      }),
    };

    const res = await axiosClient.post('/v1/stock/tools/reconciliations', payload);
    return mapStockReconciliationDtoToRecord(res.data);
  },

  async updateStockReconciliation(id: string, entry: Partial<StockReconciliationRecord>): Promise<StockReconciliationRecord> {
    await ensureLookups();
    const findWhId = (name?: string) =>
      cachedRawWarehouses.find((w) => w.name === name || w.code === name || w.id === name)?.id || null;
    const defaultWhId = findWhId(entry.defaultWarehouse) || cachedRawWarehouses[0]?.id || EMPTY_GUID;

    const payload = {
      id,
      reconciliationNo: entry.series || '',
      purpose: entry.purpose === 'Opening Stock' ? 'OpeningStock' : 'StockReconciliation',
      postingDate: toIsoDateSafe(entry.postingDate),
      defaultWarehouseId: defaultWhId,
      expenseAccount: entry.differenceAccount || '6100',
      costCenter: entry.costCenter || null,
      lines: (entry.items || []).map((line) => {
        const matchedItem = cachedRawItems.find((i) => i.itemCode === line.itemCode || i.id === line.itemCode);
        return {
          itemId: matchedItem?.id || EMPTY_GUID,
          itemCode: line.itemCode,
          itemName: line.itemName,
          warehouseId: findWhId(line.warehouse) || defaultWhId,
          reconciledQty: Number(line.qty || 0),
          reconciledValuationRate: Number(line.valuationRate || 0),
          reconciledAmount: Number(line.amount || 0),
        };
      }),
    };

    const res = await axiosClient.put(`/v1/stock/tools/reconciliations/${id}`, payload);
    return mapStockReconciliationDtoToRecord(res.data);
  },

  async submitStockReconciliation(id: string): Promise<StockReconciliationRecord> {
    const res = await axiosClient.post(`/v1/stock/tools/reconciliations/${id}/submit`);
    return mapStockReconciliationDtoToRecord(res.data);
  },

  async cancelStockReconciliation(id: string, reason?: string): Promise<StockReconciliationRecord> {
    const res = await axiosClient.post(`/v1/stock/tools/reconciliations/${id}/cancel`, null, {
      params: reason ? { reason } : undefined,
    });
    return mapStockReconciliationDtoToRecord(res.data);
  },

  async deleteStockReconciliation(id: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/tools/reconciliations/${id}`);
  },

  async fetchWarehouseItemsForReconciliation(warehouseId: string, asOfDate?: string): Promise<any[]> {
    const res = await axiosClient.get(`/v1/stock/tools/reconciliations/fetch-warehouse-items/${warehouseId}`, {
      params: asOfDate ? { asOfDate } : undefined,
    });
    return Array.isArray(res.data) ? res.data : [];
  },

  async getLandedCostVouchers(): Promise<LandedCostVoucherRecord[]> {
    const res = await axiosClient.get('/v1/stock/tools/landed-cost-vouchers');
    return unwrapList<any>(res.data).map(mapLandedCostVoucherDtoToRecord);
  },

  async createLandedCostVoucher(entry: Partial<LandedCostVoucherRecord>): Promise<LandedCostVoucherRecord> {
    await ensureLookups();
    const defaultWhId = cachedRawWarehouses[0]?.id || EMPTY_GUID;
    const payload = {
      voucherNo: entry.series || '',
      postingDate: toIsoDateSafe(entry.postingDate),
      distributeChargesBasedOn: entry.distributeChargesBasedOn === 'Qty' ? 'Qty' : 'Amount',
      receiptDocuments: (entry.vouchers || []).map((v) => ({
        receiptDocumentType: v.receiptDocumentType === 'Purchase Invoice' ? 'PurchaseInvoice' : 'PurchaseReceipt',
        receiptDocumentId: EMPTY_GUID,
        receiptDocumentNo: v.receiptDocument || '',
        supplierId: EMPTY_GUID,
        grandTotal: Number(v.grandTotal || 0),
      })),
      itemAllocations: (entry.items || []).map((i) => {
        const matchedItem = cachedRawItems.find((it) => it.itemCode === i.itemCode || it.id === i.itemCode);
        return {
          receiptDocumentType: 'PurchaseReceipt',
          receiptDocumentId: EMPTY_GUID,
          receiptLineId: EMPTY_GUID,
          itemId: matchedItem?.id || EMPTY_GUID,
          itemCode: i.itemCode || '',
          warehouseId: defaultWhId,
          qty: Number(i.qty || 0),
          weight: 0,
          originalRate: Number(i.qty ? Number(i.amount || 0) / Number(i.qty) : 0),
          originalAmount: Number(i.amount || 0),
          allocatedApplicableCharges: Number(i.applicableCharges || 0),
          finalValuationRate: 0,
        };
      }),
      taxesAndCharges: (entry.landedCosts || []).map((c) => ({
        expenseAccount: c.expenseAccount,
        description: c.description,
        amount: Number(c.amount || 0),
      })),
    };
    const res = await axiosClient.post('/v1/stock/tools/landed-cost-vouchers', payload);
    return mapLandedCostVoucherDtoToRecord(res.data);
  },

  async submitLandedCostVoucher(id: string): Promise<LandedCostVoucherRecord> {
    const res = await axiosClient.post(`/v1/stock/tools/landed-cost-vouchers/${id}/submit`);
    return mapLandedCostVoucherDtoToRecord(res.data);
  },

  async cancelLandedCostVoucher(id: string, reason?: string): Promise<LandedCostVoucherRecord> {
    const res = await axiosClient.post(`/v1/stock/tools/landed-cost-vouchers/${id}/cancel`, null, {
      params: reason ? { reason } : undefined,
    });
    return mapLandedCostVoucherDtoToRecord(res.data);
  },

  async updateLandedCostVoucher(id: string, entry: Partial<LandedCostVoucherRecord>): Promise<LandedCostVoucherRecord> {
    await ensureLookups();
    const defaultWhId = cachedRawWarehouses[0]?.id || EMPTY_GUID;
    const payload = {
      id,
      voucherNo: entry.series || '',
      postingDate: toIsoDateSafe(entry.postingDate),
      distributeChargesBasedOn: entry.distributeChargesBasedOn === 'Qty' ? 'Qty' : 'Amount',
      receiptDocuments: (entry.vouchers || []).map((v) => ({
        receiptDocumentType: v.receiptDocumentType === 'Purchase Invoice' ? 'PurchaseInvoice' : 'PurchaseReceipt',
        receiptDocumentId: EMPTY_GUID,
        receiptDocumentNo: v.receiptDocument || '',
        supplierId: EMPTY_GUID,
        grandTotal: Number(v.grandTotal || 0),
      })),
      itemAllocations: (entry.items || []).map((i) => {
        const matchedItem = cachedRawItems.find((it) => it.itemCode === i.itemCode || it.id === i.itemCode);
        return {
          receiptDocumentType: 'PurchaseReceipt',
          receiptDocumentId: EMPTY_GUID,
          receiptLineId: EMPTY_GUID,
          itemId: matchedItem?.id || EMPTY_GUID,
          itemCode: i.itemCode || '',
          warehouseId: defaultWhId,
          qty: Number(i.qty || 0),
          weight: 0,
          originalRate: Number(i.qty ? Number(i.amount || 0) / Number(i.qty) : 0),
          originalAmount: Number(i.amount || 0),
          allocatedApplicableCharges: Number(i.applicableCharges || 0),
          finalValuationRate: 0,
        };
      }),
      taxesAndCharges: (entry.landedCosts || []).map((c) => ({
        expenseAccount: c.expenseAccount,
        description: c.description,
        amount: Number(c.amount || 0),
      })),
    };
    const res = await axiosClient.put(`/v1/stock/tools/landed-cost-vouchers/${id}`, payload);
    return mapLandedCostVoucherDtoToRecord(res.data);
  },

  async deleteLandedCostVoucher(id: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/tools/landed-cost-vouchers/${id}`);
  },

  async allocateLandedCostVoucher(id: string): Promise<LandedCostVoucherRecord> {
    const res = await axiosClient.post(`/v1/stock/tools/landed-cost-vouchers/${id}/allocate`);
    return mapLandedCostVoucherDtoToRecord(res.data);
  },

  async getRepostItemValuations(): Promise<RepostItemValuationRecord[]> {
    const res = await axiosClient.get('/v1/stock/tools/repost-item-valuations');
    return unwrapList<any>(res.data).map(mapRepostValuationDtoToRecord);
  },

  async createRepostItemValuation(entry: Partial<RepostItemValuationRecord>): Promise<RepostItemValuationRecord> {
    await ensureLookups();
    const matchedItem = cachedRawItems.find((i) => i.itemCode === entry.itemCode || i.id === entry.itemCode);
    const matchedWh = cachedRawWarehouses.find((w) => w.name === entry.warehouse || w.id === entry.warehouse);
    const payload = {
      basedOn: entry.basedOn || 'Item and Warehouse',
      itemId: matchedItem?.id || null,
      itemCode: entry.itemCode || null,
      warehouseId: matchedWh?.id || null,
      warehouseName: entry.warehouse || null,
      voucherType: entry.voucherType || null,
      postingDate: toIsoDateSafe(entry.postingDate),
      allowNegativeStock: Boolean(entry.allowNegativeStock),
      viaLandedCostVoucher: Boolean(entry.viaLandedCostVoucher),
    };
    const res = await axiosClient.post('/v1/stock/tools/repost-item-valuations', payload);
    return mapRepostValuationDtoToRecord(res.data);
  },

  async updateRepostItemValuation(id: string, entry: Partial<RepostItemValuationRecord>): Promise<RepostItemValuationRecord> {
    await ensureLookups();
    const matchedItem = cachedRawItems.find((i) => i.itemCode === entry.itemCode || i.id === entry.itemCode);
    const matchedWh = cachedRawWarehouses.find((w) => w.name === entry.warehouse || w.id === entry.warehouse);
    const payload = {
      id,
      basedOn: entry.basedOn || 'Item and Warehouse',
      itemId: matchedItem?.id || null,
      itemCode: entry.itemCode || null,
      warehouseId: matchedWh?.id || null,
      warehouseName: entry.warehouse || null,
      voucherType: entry.voucherType || null,
      postingDate: toIsoDateSafe(entry.postingDate),
      allowNegativeStock: Boolean(entry.allowNegativeStock),
      viaLandedCostVoucher: Boolean(entry.viaLandedCostVoucher),
    };
    const res = await axiosClient.put(`/v1/stock/tools/repost-item-valuations/${id}`, payload);
    return mapRepostValuationDtoToRecord(res.data);
  },

  async deleteRepostItemValuation(id: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/tools/repost-item-valuations/${id}`);
  },

  async executeRepostItemValuation(id: string): Promise<RepostItemValuationRecord> {
    const res = await axiosClient.post(`/v1/stock/tools/repost-item-valuations/${id}/execute`);
    return mapRepostValuationDtoToRecord(res.data);
  },

  async cancelRepostItemValuation(id: string): Promise<RepostItemValuationRecord> {
    const res = await axiosClient.post(`/v1/stock/tools/repost-item-valuations/${id}/cancel`);
    return mapRepostValuationDtoToRecord(res.data);
  },

  async getPackingSlips(deliveryNoteId?: string): Promise<PackingSlipRecord[]> {
    const res = await axiosClient.get('/v1/stock/tools/packing-slips', {
      params: deliveryNoteId ? { deliveryNoteId } : undefined,
    });
    return unwrapList<any>(res.data).map(mapPackingSlipDtoToRecord);
  },

  async createPackingSlip(entry: Partial<PackingSlipRecord>): Promise<PackingSlipRecord> {
    await ensureLookups();
    const defaultUomId = cachedRawUoms[0]?.id || EMPTY_GUID;
    const guidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let resolvedDnId = guidRe.test(entry.deliveryNote || '') ? (entry.deliveryNote as string) : EMPTY_GUID;
    let dnLines: any[] = [];
    if (entry.deliveryNote && resolvedDnId === EMPTY_GUID) {
      try {
        const dnRes = await axiosClient.get('/v1/stock/delivery-notes', { params: DEFAULT_PAGE_QUERY });
        const matchedDn = unwrapList<any>(dnRes.data).find(
          (d) => d.deliveryNo === entry.deliveryNote || d.id === entry.deliveryNote
        );
        if (matchedDn) {
          resolvedDnId = matchedDn.id;
          dnLines = matchedDn.lines || [];
        }
      } catch {
        // fallback to EMPTY_GUID
      }
    }
    const payload = {
      slipNo: entry.series || '',
      deliveryNoteId: resolvedDnId,
      deliveryNoteNo: entry.deliveryNote || '',
      fromPackageNo: Number(entry.fromPackageNo || 1),
      toPackageNo: Number(entry.toPackageNo || 1),
      netWeightPkg: Number(entry.netWeight || 0),
      grossWeightPkg: Number(entry.grossWeight || 0),
      lines: (entry.items || []).map((l) => {
        const matchedItem = cachedRawItems.find((i) => i.itemCode === l.itemCode || i.id === l.itemCode);
        const matchedDnLine = dnLines.find(
          (dl) => dl.itemCode === l.itemCode || (matchedItem && dl.itemId === matchedItem.id)
        );
        return {
          deliveryNoteLineId: matchedDnLine?.id || EMPTY_GUID,
          itemId: matchedItem?.id || EMPTY_GUID,
          itemCode: l.itemCode,
          itemName: l.itemName,
          qty: Number(l.qty || 0),
          uomId: matchedItem?.stockUomId || defaultUomId,
          netWeight: Number(l.netWeight || 0),
        };
      }),
    };
    const res = await axiosClient.post('/v1/stock/tools/packing-slips', payload);
    return mapPackingSlipDtoToRecord(res.data);
  },

  async submitPackingSlip(id: string): Promise<PackingSlipRecord> {
    const res = await axiosClient.post(`/v1/stock/tools/packing-slips/${id}/submit`);
    return mapPackingSlipDtoToRecord(res.data);
  },

  async cancelPackingSlip(id: string): Promise<PackingSlipRecord> {
    const res = await axiosClient.post(`/v1/stock/tools/packing-slips/${id}/cancel`);
    return mapPackingSlipDtoToRecord(res.data);
  },

  async updatePackingSlip(id: string, entry: Partial<PackingSlipRecord>): Promise<PackingSlipRecord> {
    await ensureLookups();
    const defaultUomId = cachedRawUoms[0]?.id || EMPTY_GUID;
    const guidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let resolvedDnId = guidRe.test(entry.deliveryNote || '') ? (entry.deliveryNote as string) : EMPTY_GUID;
    let dnLines: any[] = [];
    if (entry.deliveryNote && resolvedDnId === EMPTY_GUID) {
      try {
        const dnRes = await axiosClient.get('/v1/stock/delivery-notes', { params: DEFAULT_PAGE_QUERY });
        const matchedDn = unwrapList<any>(dnRes.data).find(
          (d) => d.deliveryNo === entry.deliveryNote || d.id === entry.deliveryNote
        );
        if (matchedDn) {
          resolvedDnId = matchedDn.id;
          dnLines = matchedDn.lines || [];
        }
      } catch {
        // fallback
      }
    }
    const payload = {
      id,
      slipNo: entry.series || '',
      deliveryNoteId: resolvedDnId,
      deliveryNoteNo: entry.deliveryNote || '',
      fromPackageNo: Number(entry.fromPackageNo || 1),
      toPackageNo: Number(entry.toPackageNo || 1),
      netWeightPkg: Number(entry.netWeight || 0),
      grossWeightPkg: Number(entry.grossWeight || 0),
      lines: (entry.items || []).map((l) => {
        const matchedItem = cachedRawItems.find((i) => i.itemCode === l.itemCode || i.id === l.itemCode);
        const matchedDnLine = dnLines.find(
          (dl) => dl.itemCode === l.itemCode || (matchedItem && dl.itemId === matchedItem.id)
        );
        return {
          deliveryNoteLineId: matchedDnLine?.id || EMPTY_GUID,
          itemId: matchedItem?.id || EMPTY_GUID,
          itemCode: l.itemCode,
          itemName: l.itemName,
          qty: Number(l.qty || 0),
          uomId: matchedItem?.stockUomId || defaultUomId,
          netWeight: Number(l.netWeight || 0),
        };
      }),
    };
    const res = await axiosClient.put(`/v1/stock/tools/packing-slips/${id}`, payload);
    return mapPackingSlipDtoToRecord(res.data);
  },

  async deletePackingSlip(id: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/tools/packing-slips/${id}`);
  },

  // QUALITY INSPECTIONS (TOOLS)
  async getQualityInspections(params?: Record<string, any>): Promise<QualityInspectionRecord[]> {
    const res = await axiosClient.get('/v1/stock/tools/quality-inspections', {
      params: { ...DEFAULT_PAGE_QUERY, ...params },
    });
    return unwrapList<any>(res.data).map(mapQualityInspectionDtoToRecord);
  },

  async getQualityInspectionById(id: string): Promise<QualityInspectionRecord> {
    const res = await axiosClient.get(`/v1/stock/tools/quality-inspections/${id}`);
    return mapQualityInspectionDtoToRecord(res.data);
  },

  async createQualityInspection(entry: Partial<QualityInspectionRecord>): Promise<QualityInspectionRecord> {
    await ensureLookups();
    const matchedItem = entry.itemCode
      ? cachedRawItems.find(
          (i) => i.itemCode?.toLowerCase() === entry.itemCode!.trim().toLowerCase() || i.id === entry.itemCode
        )
      : undefined;
    const payload = {
      company: entry.company || 'Altensor',
      inspectionNo: entry.inspectionNo || '',
      reportDate: toIsoDateSafe(entry.reportDate),
      inspectionType: entry.inspectionType || 'Incoming',
      referenceType: entry.referenceType || null,
      referenceId: entry.referenceId || EMPTY_GUID,
      referenceDocumentNo: entry.referenceDocumentNo || null,
      itemId: matchedItem?.id || entry.itemId || EMPTY_GUID,
      batchId: entry.batchId || null,
      itemSerialNo: entry.itemSerialNo || null,
      sampleSize: Number(entry.sampleSize || 1),
      qualityInspectionTemplateId: entry.qualityInspectionTemplateId || null,
      inspectedBy: entry.inspectedBy || null,
      verifiedBy: entry.verifiedBy || null,
      remarks: entry.remarks || null,
      readings: (entry.readings || []).map((r) => ({
        specification: r.specification,
        acceptanceCriteriaValue: r.acceptanceCriteriaValue || null,
        numeric: Boolean(r.numeric),
        minValue: r.minValue ?? null,
        maxValue: r.maxValue ?? null,
        formulaBasedCriteria: Boolean(r.formulaBasedCriteria),
        acceptanceFormula: r.acceptanceFormula || null,
        readingValueText: r.readingValueText || null,
        reading1: r.reading1 ?? null,
        reading2: r.reading2 ?? null,
        reading3: r.reading3 ?? null,
        reading4: r.reading4 ?? null,
        reading5: r.reading5 ?? null,
        status: r.status || 'Accepted',
      })),
    };
    const res = await axiosClient.post('/v1/stock/tools/quality-inspections', payload);
    return mapQualityInspectionDtoToRecord(res.data);
  },

  async updateQualityInspection(id: string, entry: Partial<QualityInspectionRecord>): Promise<QualityInspectionRecord> {
    await ensureLookups();
    const matchedItem = entry.itemCode
      ? cachedRawItems.find(
          (i) => i.itemCode?.toLowerCase() === entry.itemCode!.trim().toLowerCase() || i.id === entry.itemCode
        )
      : undefined;
    const payload = {
      id,
      company: entry.company || 'Altensor',
      inspectionNo: entry.inspectionNo || '',
      reportDate: toIsoDateSafe(entry.reportDate),
      inspectionType: entry.inspectionType || 'Incoming',
      referenceType: entry.referenceType || null,
      referenceId: entry.referenceId || EMPTY_GUID,
      referenceDocumentNo: entry.referenceDocumentNo || null,
      itemId: matchedItem?.id || entry.itemId || EMPTY_GUID,
      batchId: entry.batchId || null,
      itemSerialNo: entry.itemSerialNo || null,
      sampleSize: Number(entry.sampleSize || 1),
      qualityInspectionTemplateId: entry.qualityInspectionTemplateId || null,
      inspectedBy: entry.inspectedBy || null,
      verifiedBy: entry.verifiedBy || null,
      remarks: entry.remarks || null,
      readings: (entry.readings || []).map((r) => ({
        specification: r.specification,
        acceptanceCriteriaValue: r.acceptanceCriteriaValue || null,
        numeric: Boolean(r.numeric),
        minValue: r.minValue ?? null,
        maxValue: r.maxValue ?? null,
        formulaBasedCriteria: Boolean(r.formulaBasedCriteria),
        acceptanceFormula: r.acceptanceFormula || null,
        readingValueText: r.readingValueText || null,
        reading1: r.reading1 ?? null,
        reading2: r.reading2 ?? null,
        reading3: r.reading3 ?? null,
        reading4: r.reading4 ?? null,
        reading5: r.reading5 ?? null,
        status: r.status || 'Accepted',
      })),
    };
    const res = await axiosClient.put(`/v1/stock/tools/quality-inspections/${id}`, payload);
    return mapQualityInspectionDtoToRecord(res.data);
  },

  async submitQualityInspection(id: string): Promise<QualityInspectionRecord> {
    const res = await axiosClient.post(`/v1/stock/tools/quality-inspections/${id}/submit`);
    return mapQualityInspectionDtoToRecord(res.data);
  },

  async cancelQualityInspection(id: string): Promise<QualityInspectionRecord> {
    const res = await axiosClient.post(`/v1/stock/tools/quality-inspections/${id}/cancel`);
    return mapQualityInspectionDtoToRecord(res.data);
  },

  async deleteQualityInspection(id: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/tools/quality-inspections/${id}`);
  },

  // ==========================================
  // SETUP ENTITIES
  // ==========================================
  async getItems(params?: Record<string, any>): Promise<ItemRecord[]> {
    const res = await axiosClient.get('/v1/stock/setup/items', {
      params: { ...DEFAULT_PAGE_QUERY, ...params },
    });
    const raw = unwrapList<any>(res.data);
    cachedRawItems = raw;
    return raw.map(mapItemDtoToRecord);
  },

  async getItemById(id: string): Promise<ItemRecord | undefined> {
    await ensureLookups();
    const [res, qiList] = await Promise.all([
      axiosClient.get(`/v1/stock/setup/items/${id}`),
      this.getQualityInspectionTemplates().catch(() => []),
    ]);
    const dto = res.data?.data || res.data;
    const rec = mapItemDtoToRecord(dto);
    const findUomName = (uid?: string) =>
      cachedRawUoms.find((u) => u.id === uid)?.uomName || uid || '';
    const findWhName = (wid?: string) =>
      cachedRawWarehouses.find((w) => w.id === wid)?.name || wid || '';

    if (dto?.weightUomId) rec.weightUom = findUomName(dto.weightUomId);
    if (dto?.purchaseUomId) rec.purchaseUom = findUomName(dto.purchaseUomId);
    if (dto?.salesUomId) rec.salesUom = findUomName(dto.salesUomId);
    if (dto?.qualityInspectionTemplateId) {
      const tpl = qiList.find((t) => t.id === dto.qualityInspectionTemplateId);
      rec.qualityInspectionTemplate = tpl?.templateName || dto.qualityInspectionTemplateId;
    }
    if (Array.isArray(rec.itemDefaults)) {
      rec.itemDefaults = rec.itemDefaults.map((d: any) => ({
        ...d,
        defaultWarehouse: findWhName(d.defaultWarehouseId),
      }));
    }
    if (Array.isArray(rec.barcodes)) {
      rec.barcodes = rec.barcodes.map((b: any) => ({
        ...b,
        uom: findUomName(b.uomId),
      }));
    }
    return rec;
  },

  async _buildItemPayload(entry: Partial<ItemRecord>, id?: string): Promise<any> {
    await ensureLookups();
    const [groupsRes, qiList, brandsList] = await Promise.all([
      axiosClient.get('/v1/stock/setup/item-groups/tree').catch(() => ({ data: [] })),
      this.getQualityInspectionTemplates().catch(() => []),
      this.getBrands().catch(() => []),
    ]);
    const groups = flattenItemGroupTree(groupsRes.data);
    const findGroup = (val?: string) =>
      groups.find((g) => g.itemGroupName.toLowerCase() === (val || '').trim().toLowerCase()) ||
      groups[0];
    const findUom = (val?: string) =>
      cachedRawUoms.find((u) => (u.uomName || '').toLowerCase() === (val || '').trim().toLowerCase());
    const findWh = (val?: string) =>
      cachedRawWarehouses.find(
        (w) => (w.name || '').toLowerCase() === (val || '').trim().toLowerCase() || w.id === val
      );

    const matchedGroup = findGroup(entry.itemGroup);
    const matchedUom = findUom(entry.uom) || cachedRawUoms[0];
    const matchedBrand = brandsList.find(
      (b) => b.brandName.toLowerCase() === (entry.brand || '').trim().toLowerCase()
    );
    const matchedQi = qiList.find(
      (q) =>
        q.templateName.toLowerCase() === (entry.qualityInspectionTemplate || '').trim().toLowerCase() ||
        q.id === entry.qualityInspectionTemplateId ||
        q.id === entry.qualityInspectionTemplate
    );

    const valMethodMap: Record<string, string> = {
      FIFO: 'FIFO',
      'Moving Average': 'MovingAverage',
      MovingAverage: 'MovingAverage',
      LIFO: 'LIFO',
    };
    const mrTypeMap: Record<string, string> = {
      Purchase: 'Purchase',
      'Material Transfer': 'MaterialTransfer',
      MaterialTransfer: 'MaterialTransfer',
      'Material Issue': 'MaterialIssue',
      MaterialIssue: 'MaterialIssue',
      Manufacture: 'Manufacture',
      'Customer Provided': 'CustomerProvided',
      CustomerProvided: 'CustomerProvided',
    };

    const parseDateToIso = (val?: string): string | null => {
      if (!val) return null;
      const trimmed = val.trim();
      const ddmmyyyy = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);
      if (ddmmyyyy) {
        return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}T00:00:00Z`;
      }
      const d = new Date(trimmed);
      return Number.isNaN(d.getTime()) ? null : d.toISOString();
    };

    const isGuid = (s?: string) =>
      Boolean(s && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s));

    return {
      ...(id ? { id } : {}),
      itemCode: entry.itemCode || `ITEM-${Date.now()}`,
      itemName: entry.itemName || entry.itemCode || '',
      itemGroupId: matchedGroup?.id || EMPTY_GUID,
      stockUomId: matchedUom?.id || EMPTY_GUID,
      brandId: matchedBrand?.id || null,
      description: entry.description || null,
      disabled: entry.status === 'Disabled',
      allowAlternativeItem: Boolean(entry.allowAlternativeItem),
      isStockItem: entry.maintainStock !== false,
      hasVariants: Boolean(entry.hasVariants),
      isFixedAsset: Boolean(entry.isFixedAsset),
      standardSellingRate: Number(entry.standardSellingRate || 0),
      overDeliveryReceiptAllowancePercent: Number(entry.overDeliveryAllowance || 0),
      valuationMethod: valMethodMap[entry.valuationMethod || 'FIFO'] || 'FIFO',
      valuationRate: Number(entry.valuationRate || 0),
      endOfLife: parseDateToIso(entry.endOfLife),
      defaultMaterialRequestType:
        mrTypeMap[entry.defaultMaterialRequestType || 'Purchase'] || 'Purchase',
      warrantyPeriodDays: Number(entry.warrantyPeriodDays || 0),
      weightPerUnit: Number(entry.weightPerUnit || 0),
      weightUomId: findUom(entry.weightUom)?.id || null,
      allowNegativeStock: Boolean(entry.allowNegativeStock),
      hasBatchNo: Boolean(entry.hasBatchNo),
      hasSerialNo: Boolean(entry.hasSerialNo),
      isPurchaseItem: entry.allowPurchase !== false,
      purchaseUomId: findUom(entry.purchaseUom)?.id || null,
      minOrderQty: Number(entry.minOrderQty || 0),
      safetyStock: Number(entry.safetyStock || 0),
      leadTimeDays: Number(entry.leadTimeDays || 0),
      lastPurchaseRate: Number(entry.lastPurchaseRate || 0),
      isCustomerProvidedItem: Boolean(entry.isCustomerProvidedItem),
      isSalesItem: entry.allowSales !== false,
      salesUomId: findUom(entry.salesUom)?.id || null,
      maxDiscountPercent: Number(entry.maxDiscountPercent || 0),
      grantCommission: entry.grantCommission !== false,
      inspectionRequiredBeforePurchase: Boolean(entry.inspectionRequiredBeforePurchase),
      inspectionRequiredBeforeDelivery: Boolean(entry.inspectionRequiredBeforeDelivery),
      qualityInspectionTemplateId: matchedQi?.id || null,
      includeItemInManufacturing: entry.includeItemInManufacturing !== false,
      isSubContractedItem: Boolean(entry.isSubcontractedItem),
      barcodes: (entry.barcodes || [])
        .filter((b: any) => b.barcode)
        .map((b: any) => ({
          barcode: b.barcode,
          barcodeType: b.barcodeType || null,
          uomId: findUom(b.uom)?.id || null,
        })),
      uomConversions: (entry.uomConversions || [])
        .filter((u: any) => u.uom)
        .map((u: any) => {
          const matched = findUom(u.uom);
          return {
            uomId: matched?.id || EMPTY_GUID,
            uomName: matched?.uomName || u.uom,
            conversionFactor: Number(u.conversionFactor || 1),
          };
        }),
      reorderLevels: (entry.reorderLevels || [])
        .filter((r: any) => r.requestFor || r.warehouse)
        .map((r: any) => {
          const wh = findWh(r.requestFor || r.warehouse);
          return {
            warehouseId: wh?.id || EMPTY_GUID,
            warehouseName: wh?.name || r.requestFor || r.warehouse,
            warehouseReorderLevel: Number(r.reorderLevel || 0),
            warehouseReorderQty: Number(r.reorderQty || 0),
            materialRequestType: mrTypeMap[r.materialRequestType || 'Purchase'] || 'Purchase',
          };
        }),
      itemDefaults: (entry.itemDefaults || []).map((d: any) => ({
        defaultWarehouseId: findWh(d.defaultWarehouse)?.id || null,
        defaultPriceListId: isGuid(d.defaultPriceList) ? d.defaultPriceList : null,
      })),
      suppliers: (entry.suppliers || [])
        .filter((s: any) => s.supplier)
        .map((s: any) => ({
          supplierId: isGuid(s.supplierId) ? s.supplierId : EMPTY_GUID,
          supplierName: s.supplier,
          supplierPartNo: s.supplierPartNumber || s.supplierPartNo || null,
        })),
      customerDetails: (entry.customerDetails || [])
        .filter((c: any) => c.customerName || c.refCode)
        .map((c: any) => ({
          customerId: isGuid(c.customerId) ? c.customerId : EMPTY_GUID,
          customerName: c.customerName || null,
          customerGroup: c.customerGroup || null,
          refCode: c.refCode || null,
        })),
      taxes: (entry.taxes || [])
        .filter((t: any) => t.itemTaxTemplate)
        .map((t: any) => ({
          taxTemplateName: t.itemTaxTemplate,
          taxCategory: t.taxCategory || null,
          validFrom: parseDateToIso(t.validFrom),
          minimumNetRate: Number(t.minNetRate || 0),
          maximumNetRate: Number(t.maxNetRate || 0),
        })),
    };
  },

  async createItem(entry: Partial<ItemRecord>): Promise<ItemRecord> {
    const payload = await this._buildItemPayload(entry);
    const res = await axiosClient.post('/v1/stock/setup/items', payload);
    cachedRawItems = [];
    const dto = res.data?.data || res.data;
    return mapItemDtoToRecord(dto);
  },

  async updateItem(id: string, entry: Partial<ItemRecord>): Promise<ItemRecord> {
    const payload = await this._buildItemPayload(entry, id);
    const res = await axiosClient.put(`/v1/stock/setup/items/${id}`, payload);
    cachedRawItems = [];
    const dto = res.data?.data || res.data;
    return mapItemDtoToRecord(dto);
  },

  async deleteItem(id: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/setup/items/${id}`);
    cachedRawItems = [];
  },

  async getItemGroups(): Promise<ItemGroupRecord[]> {
    const res = await axiosClient.get('/v1/stock/setup/item-groups/tree');
    return flattenItemGroupTree(res.data);
  },

  async getItemGroupById(id: string): Promise<ItemGroupRecord | undefined> {
    const all = await this.getItemGroups();
    return all.find((g) => g.id === id || g.itemGroupName === id);
  },

  async createItemGroup(entry: Partial<ItemGroupRecord>): Promise<ItemGroupRecord> {
    await ensureLookups();
    const all = await this.getItemGroups();
    const parent = all.find(
      (g) => g.itemGroupName.toLowerCase() === (entry.parentItemGroup || '').toLowerCase()
    );
    const findWhId = (name?: string) =>
      cachedRawWarehouses.find((w) => w.name === name || w.code === name || w.id === name)?.id || null;
    const res = await axiosClient.post('/v1/stock/setup/item-groups', {
      groupName: entry.itemGroupName || '',
      parentItemGroupId: parent?.id || null,
      isGroup: Boolean(entry.isGroup),
      defaults: (entry.defaults || []).map((d) => ({
        company: d.company || 'Altensor',
        defaultWarehouseId: findWhId(d.defaultWarehouse),
        defaultPriceList: d.defaultPriceList || null,
      })),
      taxes: (entry.taxes || []).map((t) => ({
        itemTaxTemplate: t.itemTaxTemplate || '',
        taxCategory: t.taxCategory || null,
        validFrom: t.validFrom ? new Date(t.validFrom).toISOString() : null,
        minimumNetRate: t.minNetRate ?? null,
        maximumNetRate: t.maxNetRate ?? null,
      })),
    });
    const dto = res.data?.data || res.data;
    const mapped = mapItemGroupDtoToRecord(dto);
    return {
      ...mapped,
      parentItemGroup: mapped.parentItemGroup || entry.parentItemGroup || '',
      defaults: mapped.defaults?.length ? mapped.defaults : entry.defaults || [],
      taxes: mapped.taxes?.length ? mapped.taxes : entry.taxes || [],
    };
  },

  async updateItemGroup(id: string, entry: Partial<ItemGroupRecord>): Promise<ItemGroupRecord> {
    await ensureLookups();
    const all = await this.getItemGroups();
    const parent = all.find(
      (g) => g.itemGroupName.toLowerCase() === (entry.parentItemGroup || '').toLowerCase()
    );
    const findWhId = (name?: string) =>
      cachedRawWarehouses.find((w) => w.name === name || w.code === name || w.id === name)?.id || null;
    const res = await axiosClient.put(`/v1/stock/setup/item-groups/${id}`, {
      id,
      groupName: entry.itemGroupName || '',
      parentItemGroupId: parent?.id || null,
      isGroup: Boolean(entry.isGroup),
      defaults: (entry.defaults || []).map((d) => ({
        company: d.company || 'Altensor',
        defaultWarehouseId: findWhId(d.defaultWarehouse),
        defaultPriceList: d.defaultPriceList || null,
      })),
      taxes: (entry.taxes || []).map((t) => ({
        itemTaxTemplate: t.itemTaxTemplate || '',
        taxCategory: t.taxCategory || null,
        validFrom: t.validFrom ? new Date(t.validFrom).toISOString() : null,
        minimumNetRate: t.minNetRate ?? null,
        maximumNetRate: t.maxNetRate ?? null,
      })),
    });
    const dto = res.data?.data || res.data;
    const mapped = mapItemGroupDtoToRecord(dto);
    return {
      ...mapped,
      parentItemGroup: mapped.parentItemGroup || entry.parentItemGroup || '',
      defaults: mapped.defaults?.length ? mapped.defaults : entry.defaults || [],
      taxes: mapped.taxes?.length ? mapped.taxes : entry.taxes || [],
    };
  },

  async deleteItemGroup(id: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/setup/item-groups/${id}`);
  },

  async getItemAttributes(): Promise<ItemAttributeRecord[]> {
    const res = await axiosClient.get('/v1/stock/setup/item-attributes');
    return unwrapList<any>(res.data).map(mapItemAttributeDtoToRecord);
  },

  async getItemAttributeById(id: string): Promise<ItemAttributeRecord | undefined> {
    const all = await this.getItemAttributes();
    return all.find((a) => a.id === id || a.attributeName === id);
  },

  async createItemAttribute(entry: Partial<ItemAttributeRecord>): Promise<ItemAttributeRecord> {
    const res = await axiosClient.post('/v1/stock/setup/item-attributes', {
      attributeName: entry.attributeName || '',
      disabled: Boolean(entry.disabled || entry.status === 'Disabled'),
      numericValues: Boolean(entry.numericValues),
      fromRange: entry.numericValues ? Number(entry.fromRange ?? 0) : null,
      toRange: entry.numericValues ? Number(entry.toRange ?? 0) : null,
      increment: entry.numericValues ? Number(entry.increment ?? 1) : null,
      values: (entry.values || []).map((v) => ({
        attributeValue: v.attributeValue,
        abbreviation: v.abbreviation,
      })),
    });
    const dto = res.data?.data || res.data;
    return mapItemAttributeDtoToRecord(dto);
  },

  async updateItemAttribute(id: string, entry: Partial<ItemAttributeRecord>): Promise<ItemAttributeRecord> {
    const res = await axiosClient.put(`/v1/stock/setup/item-attributes/${id}`, {
      id,
      attributeName: entry.attributeName || '',
      disabled: Boolean(entry.disabled || entry.status === 'Disabled'),
      numericValues: Boolean(entry.numericValues),
      fromRange: entry.numericValues ? Number(entry.fromRange ?? 0) : null,
      toRange: entry.numericValues ? Number(entry.toRange ?? 0) : null,
      increment: entry.numericValues ? Number(entry.increment ?? 1) : null,
      values: (entry.values || []).map((v) => ({
        attributeValue: v.attributeValue,
        abbreviation: v.abbreviation,
      })),
    });
    const dto = res.data?.data || res.data;
    return mapItemAttributeDtoToRecord(dto);
  },

  async deleteItemAttribute(id: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/setup/item-attributes/${id}`);
  },

  async getBrands(): Promise<BrandRecord[]> {
    const res = await axiosClient.get('/v1/stock/setup/brands');
    return unwrapList<any>(res.data).map(mapBrandDtoToRecord);
  },

  async getBrandById(id: string): Promise<BrandRecord | undefined> {
    const all = await this.getBrands();
    return all.find((b) => b.id === id || b.brandName === id);
  },

  async createBrand(entry: Partial<BrandRecord>): Promise<BrandRecord> {
    await ensureLookups();
    const findWhId = (name?: string) =>
      cachedRawWarehouses.find((w) => w.name === name || w.code === name || w.id === name)?.id || null;
    const res = await axiosClient.post('/v1/stock/setup/brands', {
      brandName: entry.brandName || '',
      description: entry.description || null,
      defaults: (entry.defaults || []).map((d) => ({
        company: d.company || 'Altensor',
        defaultWarehouseId: findWhId(d.defaultWarehouse),
        defaultPriceList: d.defaultPriceList || null,
      })),
    });
    const dto = res.data?.data || res.data;
    const mapped = mapBrandDtoToRecord(dto);
    return {
      ...mapped,
      defaults: mapped.defaults?.length ? mapped.defaults : entry.defaults || [],
    };
  },

  async updateBrand(id: string, entry: Partial<BrandRecord>): Promise<BrandRecord> {
    await ensureLookups();
    const findWhId = (name?: string) =>
      cachedRawWarehouses.find((w) => w.name === name || w.code === name || w.id === name)?.id || null;
    const res = await axiosClient.put(`/v1/stock/setup/brands/${id}`, {
      id,
      brandName: entry.brandName || '',
      description: entry.description || null,
      defaults: (entry.defaults || []).map((d) => ({
        company: d.company || 'Altensor',
        defaultWarehouseId: findWhId(d.defaultWarehouse),
        defaultPriceList: d.defaultPriceList || null,
      })),
    });
    const dto = res.data?.data || res.data;
    const mapped = mapBrandDtoToRecord(dto);
    return {
      ...mapped,
      defaults: mapped.defaults?.length ? mapped.defaults : entry.defaults || [],
    };
  },

  async deleteBrand(id: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/setup/brands/${id}`);
  },

  async getWarehouseRecords(): Promise<WarehouseRecord[]> {
    const res = await axiosClient.get('/v1/stock/setup/warehouses', { params: DEFAULT_PAGE_QUERY });
    const raw = unwrapList<any>(res.data);
    cachedRawWarehouses = raw;
    return raw.map((dto) => {
      const rec = mapWarehouseDtoToRecord(dto);
      if (dto.defaultInTransitWarehouseId) {
        const transit = raw.find((w) => w.id === dto.defaultInTransitWarehouseId);
        if (transit?.name) rec.defaultInTransitWarehouse = transit.name;
      }
      return rec;
    });
  },

  async getWarehouseRecordById(id: string): Promise<WarehouseRecord | undefined> {
    await ensureLookups();
    const res = await axiosClient.get(`/v1/stock/setup/warehouses/${id}`);
    const dto = res.data?.data || res.data;
    const rec = mapWarehouseDtoToRecord(dto);
    if (dto?.defaultInTransitWarehouseId) {
      const transit = cachedRawWarehouses.find((w) => w.id === dto.defaultInTransitWarehouseId);
      if (transit?.name) rec.defaultInTransitWarehouse = transit.name;
    }
    return rec;
  },

  async createWarehouseRecord(entry: Partial<WarehouseRecord>): Promise<WarehouseRecord> {
    await ensureLookups();
    const parent = cachedRawWarehouses.find(
      (w) => w.name === entry.parentWarehouse || w.id === entry.parentWarehouse
    );
    const transit = cachedRawWarehouses.find(
      (w) => w.name === entry.defaultInTransitWarehouse || w.id === entry.defaultInTransitWarehouse
    );
    const res = await axiosClient.post(
      '/v1/stock/setup/warehouses',
      mapWarehouseRecordToDto(entry, parent?.id, transit?.id)
    );
    const dto = res.data?.data || res.data;
    const rec = mapWarehouseDtoToRecord(dto);
    if (transit?.name) rec.defaultInTransitWarehouse = transit.name;
    cachedRawWarehouses = [];
    return rec;
  },

  async updateWarehouseRecord(id: string, entry: Partial<WarehouseRecord>): Promise<WarehouseRecord> {
    await ensureLookups();
    const parent = cachedRawWarehouses.find(
      (w) => w.name === entry.parentWarehouse || w.id === entry.parentWarehouse
    );
    const transit = cachedRawWarehouses.find(
      (w) => w.name === entry.defaultInTransitWarehouse || w.id === entry.defaultInTransitWarehouse
    );
    const res = await axiosClient.put(
      `/v1/stock/setup/warehouses/${id}`,
      { id, ...mapWarehouseRecordToDto(entry, parent?.id, transit?.id) }
    );
    const dto = res.data?.data || res.data;
    const rec = mapWarehouseDtoToRecord(dto);
    if (transit?.name) rec.defaultInTransitWarehouse = transit.name;
    cachedRawWarehouses = [];
    return rec;
  },

  async deleteWarehouseRecord(id: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/setup/warehouses/${id}`);
    cachedRawWarehouses = [];
  },

  async getUOMRecords(): Promise<UOMRecord[]> {
    const res = await axiosClient.get('/v1/stock/setup/uoms');
    const raw = unwrapList<any>(res.data);
    cachedRawUoms = raw;
    return raw.map(mapUomDtoToRecord);
  },

  async getUOMRecordById(id: string): Promise<UOMRecord | undefined> {
    const all = await this.getUOMRecords();
    return all.find((u) => u.id === id || u.uomName === id);
  },

  async createUOMRecord(entry: Partial<UOMRecord>): Promise<UOMRecord> {
    const res = await axiosClient.post('/v1/stock/setup/uoms', {
      uomName: entry.uomName || '',
      symbol: entry.symbol || null,
      commonCode: entry.commonCode || null,
      description: entry.description || null,
      category: entry.category || null,
      enabled: entry.enabled !== false && entry.status !== 'Disabled',
      mustBeWholeNumber: Boolean(entry.mustBeWholeNumber),
    });
    cachedRawUoms = [];
    const dto = res.data?.data || res.data;
    const mapped = mapUomDtoToRecord(dto);
    return {
      ...mapped,
      symbol: mapped.symbol || entry.symbol || '',
      commonCode: mapped.commonCode || entry.commonCode || '',
      description: mapped.description || entry.description || '',
      category: mapped.category || entry.category || '',
    };
  },

  async updateUOMRecord(id: string, entry: Partial<UOMRecord>): Promise<UOMRecord> {
    const res = await axiosClient.put(`/v1/stock/setup/uoms/${id}`, {
      id,
      uomName: entry.uomName || '',
      symbol: entry.symbol || null,
      commonCode: entry.commonCode || null,
      description: entry.description || null,
      category: entry.category || null,
      enabled: entry.enabled !== false && entry.status !== 'Disabled',
      mustBeWholeNumber: Boolean(entry.mustBeWholeNumber),
    });
    cachedRawUoms = [];
    const dto = res.data?.data || res.data;
    const mapped = mapUomDtoToRecord(dto);
    return {
      ...mapped,
      symbol: mapped.symbol || entry.symbol || '',
      commonCode: mapped.commonCode || entry.commonCode || '',
      description: mapped.description || entry.description || '',
      category: mapped.category || entry.category || '',
    };
  },

  async deleteUOMRecord(id: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/setup/uoms/${id}`);
    cachedRawUoms = [];
  },

  async getUOMConversionFactors(): Promise<UOMConversionFactorRecord[]> {
    await ensureLookups();
    const res = await axiosClient.get('/v1/stock/setup/uom-conversion-factors');
    return unwrapList<any>(res.data).map((d) => mapUomConversionDtoToRecord(d, cachedRawUoms));
  },

  async getUOMConversionFactorById(id: string): Promise<UOMConversionFactorRecord | undefined> {
    const all = await this.getUOMConversionFactors();
    return all.find((u) => u.id === id);
  },

  async createUOMConversionFactor(entry: Partial<UOMConversionFactorRecord>): Promise<UOMConversionFactorRecord> {
    await ensureLookups();
    const fromUom = cachedRawUoms.find(
      (u) =>
        u.uomName?.toLowerCase() === (entry.fromUOM || '').toLowerCase() ||
        u.id === entry.fromUOM
    );
    const toUom = cachedRawUoms.find(
      (u) =>
        u.uomName?.toLowerCase() === (entry.toUOM || '').toLowerCase() ||
        u.id === entry.toUOM
    );
    const res = await axiosClient.post('/v1/stock/setup/uom-conversion-factors', {
      category: entry.category || 'Unit',
      fromUomId: fromUom?.id || EMPTY_GUID,
      fromUomName: fromUom?.uomName || entry.fromUOM || '',
      toUomId: toUom?.id || EMPTY_GUID,
      toUomName: toUom?.uomName || entry.toUOM || '',
      value: Number(entry.value || 1),
    });
    const dto = res.data?.data || res.data;
    const mapped = mapUomConversionDtoToRecord(dto, cachedRawUoms);
    return {
      ...mapped,
      category: entry.category || mapped.category || 'Unit',
      fromUOM: fromUom?.uomName || entry.fromUOM || mapped.fromUOM,
      toUOM: toUom?.uomName || entry.toUOM || mapped.toUOM,
    };
  },

  async updateUOMConversionFactor(
    id: string,
    entry: Partial<UOMConversionFactorRecord>
  ): Promise<UOMConversionFactorRecord> {
    await ensureLookups();
    const fromUom = cachedRawUoms.find(
      (u) =>
        u.uomName?.toLowerCase() === (entry.fromUOM || '').toLowerCase() ||
        u.id === entry.fromUOM
    );
    const toUom = cachedRawUoms.find(
      (u) =>
        u.uomName?.toLowerCase() === (entry.toUOM || '').toLowerCase() ||
        u.id === entry.toUOM
    );
    const res = await axiosClient.put(`/v1/stock/setup/uom-conversion-factors/${id}`, {
      id,
      category: entry.category || 'Unit',
      fromUomId: fromUom?.id || EMPTY_GUID,
      fromUomName: fromUom?.uomName || entry.fromUOM || '',
      toUomId: toUom?.id || EMPTY_GUID,
      toUomName: toUom?.uomName || entry.toUOM || '',
      value: Number(entry.value || 1),
    });
    const dto = res.data?.data || res.data;
    const mapped = mapUomConversionDtoToRecord(dto, cachedRawUoms);
    return {
      ...mapped,
      category: entry.category || mapped.category || 'Unit',
      fromUOM: fromUom?.uomName || entry.fromUOM || mapped.fromUOM,
      toUOM: toUom?.uomName || entry.toUOM || mapped.toUOM,
    };
  },

  async deleteUOMConversionFactor(id: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/setup/uom-conversion-factors/${id}`);
  },

  async getSerialNos(params?: Record<string, any>): Promise<SerialNoRecord[]> {
    const res = await axiosClient.get('/v1/stock/setup/serial-numbers', {
      params: { ...DEFAULT_PAGE_QUERY, ...params },
    });
    return unwrapList<any>(res.data).map(mapSerialNumberDtoToRecord);
  },

  async getSerialNoById(id: string): Promise<SerialNoRecord | undefined> {
    const res = await axiosClient.get(`/v1/stock/setup/serial-numbers/${id}`);
    return mapSerialNumberDtoToRecord(res.data);
  },

  async createSerialNo(entry: Partial<SerialNoRecord>): Promise<SerialNoRecord> {
    await ensureLookups();
    const itemKey = (entry.itemCode || '').trim().toLowerCase();
    const whKey = (entry.warehouse || '').trim().toLowerCase();
    const matchedItem = cachedRawItems.find(
      (i) => i.itemCode?.toLowerCase() === itemKey || i.id === entry.itemCode
    );
    const matchedWh = cachedRawWarehouses.find(
      (w) => w.name?.toLowerCase() === whKey || w.id === entry.warehouse
    );
    const res = await axiosClient.post('/v1/stock/setup/serial-numbers', {
      serialNo: entry.serialNo || '',
      itemId: matchedItem?.id || EMPTY_GUID,
      warehouseId: matchedWh?.id || null,
      company: entry.company || null,
      workOrder: entry.workOrder || null,
      status: entry.status || 'Active',
      warrantyExpiryDate: entry.warrantyExpiryDate ? toIsoDateSafe(entry.warrantyExpiryDate) : null,
      amcExpiryDate: entry.amcExpiryDate ? toIsoDateSafe(entry.amcExpiryDate) : null,
    });
    return mapSerialNumberDtoToRecord(res.data);
  },

  async updateSerialNo(id: string, entry: Partial<SerialNoRecord>): Promise<SerialNoRecord> {
    await ensureLookups();
    const itemKey = (entry.itemCode || '').trim().toLowerCase();
    const whKey = (entry.warehouse || '').trim().toLowerCase();
    const matchedItem = cachedRawItems.find(
      (i) => i.itemCode?.toLowerCase() === itemKey || i.id === entry.itemCode
    );
    const matchedWh = cachedRawWarehouses.find(
      (w) => w.name?.toLowerCase() === whKey || w.id === entry.warehouse
    );
    const res = await axiosClient.put(`/v1/stock/setup/serial-numbers/${id}`, {
      id,
      serialNo: entry.serialNo || '',
      itemId: matchedItem?.id || EMPTY_GUID,
      warehouseId: matchedWh?.id || null,
      company: entry.company || null,
      workOrder: entry.workOrder || null,
      status: entry.status || 'Active',
      warrantyExpiryDate: entry.warrantyExpiryDate ? toIsoDateSafe(entry.warrantyExpiryDate) : null,
      amcExpiryDate: entry.amcExpiryDate ? toIsoDateSafe(entry.amcExpiryDate) : null,
    });
    return mapSerialNumberDtoToRecord(res.data);
  },

  async deleteSerialNo(id: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/setup/serial-numbers/${id}`);
  },

  async getBatches(params?: Record<string, any>): Promise<BatchRecord[]> {
    await ensureLookups();
    const res = await axiosClient.get('/v1/stock/setup/batches', {
      params: { ...DEFAULT_PAGE_QUERY, ...params },
    });
    return unwrapList<any>(res.data).map((d) => mapBatchDtoToRecord(d, cachedRawUoms));
  },

  async getBatchById(id: string): Promise<BatchRecord | undefined> {
    await ensureLookups();
    const res = await axiosClient.get(`/v1/stock/setup/batches/${id}`);
    return mapBatchDtoToRecord(res.data, cachedRawUoms);
  },

  async createBatch(entry: Partial<BatchRecord>): Promise<BatchRecord> {
    await ensureLookups();
    const itemKey = (entry.item || '').trim().toLowerCase();
    const uomKey = (entry.batchUOM || '').trim().toLowerCase();
    const matchedItem = cachedRawItems.find(
      (i) => i.itemCode?.toLowerCase() === itemKey || i.id === entry.item
    );
    const matchedUom = cachedRawUoms.find(
      (u) => u.name?.toLowerCase() === uomKey || u.id === entry.batchUOM
    );
    const res = await axiosClient.post('/v1/stock/setup/batches', {
      batchNo: entry.batchId || '',
      itemId: matchedItem?.id || EMPTY_GUID,
      stockUomId: matchedUom?.id || null,
      disabled: entry.status === 'Disabled',
      useBatchwiseValuation: entry.useBatchWiseValuation !== false,
      allowNegativeStock: Boolean(entry.allowNegativeStock),
      manufacturingDate: entry.manufacturingDate ? toIsoDateSafe(entry.manufacturingDate) : null,
      expiryDate: entry.expiryDate ? toIsoDateSafe(entry.expiryDate) : null,
      description: entry.description || null,
    });
    return mapBatchDtoToRecord(res.data, cachedRawUoms);
  },

  async updateBatch(id: string, entry: Partial<BatchRecord>): Promise<BatchRecord> {
    await ensureLookups();
    const itemKey = (entry.item || '').trim().toLowerCase();
    const uomKey = (entry.batchUOM || '').trim().toLowerCase();
    const matchedItem = cachedRawItems.find(
      (i) => i.itemCode?.toLowerCase() === itemKey || i.id === entry.item
    );
    const matchedUom = cachedRawUoms.find(
      (u) => u.name?.toLowerCase() === uomKey || u.id === entry.batchUOM
    );
    const res = await axiosClient.put(`/v1/stock/setup/batches/${id}`, {
      id,
      batchNo: entry.batchId || '',
      itemId: matchedItem?.id || EMPTY_GUID,
      stockUomId: matchedUom?.id || null,
      disabled: entry.status === 'Disabled',
      useBatchwiseValuation: entry.useBatchWiseValuation !== false,
      allowNegativeStock: Boolean(entry.allowNegativeStock),
      manufacturingDate: entry.manufacturingDate ? toIsoDateSafe(entry.manufacturingDate) : null,
      expiryDate: entry.expiryDate ? toIsoDateSafe(entry.expiryDate) : null,
      description: entry.description || null,
    });
    return mapBatchDtoToRecord(res.data, cachedRawUoms);
  },

  async deleteBatch(id: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/setup/batches/${id}`);
  },

  async splitBatch(id: string, splitQty: number, newBatchNo: string): Promise<BatchRecord> {
    await ensureLookups();
    const res = await axiosClient.post(`/v1/stock/setup/batches/${id}/split`, {
      splitQty: Number(splitQty),
      newBatchNo,
    });
    return mapBatchDtoToRecord(res.data, cachedRawUoms);
  },

  async getSerialAndBatchBundles(params?: Record<string, any>): Promise<SerialAndBatchBundleRecord[]> {
    const res = await axiosClient.get('/v1/stock/setup/serial-batch-bundles', {
      params: { ...DEFAULT_PAGE_QUERY, ...params },
    });
    return unwrapList<any>(res.data).map(mapBundleDtoToRecord);
  },

  async getSerialAndBatchBundleById(id: string): Promise<SerialAndBatchBundleRecord | undefined> {
    const res = await axiosClient.get(`/v1/stock/setup/serial-batch-bundles/${id}`);
    return mapBundleDtoToRecord(res.data);
  },

  async createSerialAndBatchBundle(entry: Partial<SerialAndBatchBundleRecord>): Promise<SerialAndBatchBundleRecord> {
    await ensureLookups();
    const matchedItem = cachedRawItems.find((i) => i.itemCode === entry.itemCode || i.id === entry.itemCode);
    const matchedWh = cachedRawWarehouses.find((w) => w.name === entry.warehouse || w.id === entry.warehouse);
    const res = await axiosClient.post('/v1/stock/setup/serial-batch-bundles', {
      namingSeries: entry.namingSeries || '',
      itemId: matchedItem?.id || EMPTY_GUID,
      warehouseId: matchedWh?.id || EMPTY_GUID,
      transactionType: entry.typeOfTransaction === 'Outward' ? 'Outward' : 'Inward',
      voucherType: entry.voucherType || 'StockEntry',
      voucherNo: entry.voucherNo || null,
      hasSerialNo: Boolean(entry.hasSerialNo),
      hasBatchNo: Boolean(entry.hasBatchNo),
      entries: (entry.items || []).map((i) => ({
        serialNo: i.serialNo || null,
        batchNo: i.batchNo || null,
        warehouseId: matchedWh?.id || EMPTY_GUID,
        qty: Number(i.qty || 0),
      })),
    });
    return mapBundleDtoToRecord(res.data);
  },

  async updateSerialAndBatchBundle(
    id: string,
    entry: Partial<SerialAndBatchBundleRecord>
  ): Promise<SerialAndBatchBundleRecord> {
    await ensureLookups();
    const matchedItem = cachedRawItems.find((i) => i.itemCode === entry.itemCode || i.id === entry.itemCode);
    const matchedWh = cachedRawWarehouses.find((w) => w.name === entry.warehouse || w.id === entry.warehouse);
    const res = await axiosClient.put(`/v1/stock/setup/serial-batch-bundles/${id}`, {
      id,
      namingSeries: entry.namingSeries || '',
      itemId: matchedItem?.id || EMPTY_GUID,
      warehouseId: matchedWh?.id || EMPTY_GUID,
      transactionType: entry.typeOfTransaction === 'Outward' ? 'Outward' : 'Inward',
      voucherType: entry.voucherType || 'StockEntry',
      voucherNo: entry.voucherNo || null,
      hasSerialNo: Boolean(entry.hasSerialNo),
      hasBatchNo: Boolean(entry.hasBatchNo),
      entries: (entry.items || []).map((i) => ({
        serialNo: i.serialNo || null,
        batchNo: i.batchNo || null,
        warehouseId: matchedWh?.id || EMPTY_GUID,
        qty: Number(i.qty || 0),
      })),
    });
    return mapBundleDtoToRecord(res.data);
  },

  async deleteSerialAndBatchBundle(id: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/setup/serial-batch-bundles/${id}`);
  },

  async autoPickSerialAndBatchBundle(
    itemId: string,
    warehouseId: string,
    qty: number
  ): Promise<SerialAndBatchBundleRecord> {
    const res = await axiosClient.post('/v1/stock/setup/serial-batch-bundles/auto-pick', null, {
      params: { itemId, warehouseId, qty },
    });
    return mapBundleDtoToRecord(res.data);
  },

  async getInventoryDimensions(): Promise<InventoryDimensionRecord[]> {
    const res = await axiosClient.get('/v1/stock/setup/inventory-dimensions');
    return unwrapList<any>(res.data).map(mapInventoryDimensionDtoToRecord);
  },

  async getInventoryDimensionById(id: string): Promise<InventoryDimensionRecord | undefined> {
    const all = await this.getInventoryDimensions();
    return all.find((d) => d.id === id || d.dimensionName === id);
  },

  async createInventoryDimension(entry: Partial<InventoryDimensionRecord>): Promise<InventoryDimensionRecord> {
    const res = await axiosClient.post('/v1/stock/setup/inventory-dimensions', {
      dimensionName: entry.dimensionName || '',
      referenceDocument: entry.referenceDocument || '',
      disabled: false,
      applyToAllInventoryDocuments: entry.applyToAllInventoryDocuments !== false,
      fetchValueFrom: entry.fetchValueFrom || null,
      mandatoryDependsOn: Boolean(entry.mandatory),
      mandatoryDependsOnExpression: entry.mandatoryDependsOn || null,
      validateNegativeStock: Boolean(entry.validateNegativeStock),
    });
    const dto = res.data?.data || res.data;
    return mapInventoryDimensionDtoToRecord(dto);
  },

  async updateInventoryDimension(
    id: string,
    entry: Partial<InventoryDimensionRecord>
  ): Promise<InventoryDimensionRecord> {
    const res = await axiosClient.put(`/v1/stock/setup/inventory-dimensions/${id}`, {
      id,
      dimensionName: entry.dimensionName || '',
      referenceDocument: entry.referenceDocument || '',
      disabled: false,
      applyToAllInventoryDocuments: entry.applyToAllInventoryDocuments !== false,
      fetchValueFrom: entry.fetchValueFrom || null,
      mandatoryDependsOn: Boolean(entry.mandatory),
      mandatoryDependsOnExpression: entry.mandatoryDependsOn || null,
      validateNegativeStock: Boolean(entry.validateNegativeStock),
    });
    const dto = res.data?.data || res.data;
    return mapInventoryDimensionDtoToRecord(dto);
  },

  async deleteInventoryDimension(id: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/setup/inventory-dimensions/${id}`);
  },

  async getShippingRules(): Promise<ShippingRuleRecord[]> {
    const res = await axiosClient.get('/v1/stock/setup/shipping-rules');
    return unwrapList<any>(res.data).map(mapShippingRuleDtoToRecord);
  },

  async getShippingRuleById(id: string): Promise<ShippingRuleRecord | undefined> {
    const all = await this.getShippingRules();
    return all.find((r) => r.id === id || r.shippingRuleLabel === id);
  },

  async createShippingRule(entry: Partial<ShippingRuleRecord>): Promise<ShippingRuleRecord> {
    const calcApiMap: Record<string, string> = {
      Fixed: 'Fixed',
      'Net Total': 'NetTotal',
      'Net Weight': 'NetWeight',
    };
    const res = await axiosClient.post('/v1/stock/setup/shipping-rules', {
      label: entry.shippingRuleLabel || '',
      ruleType: entry.shippingRuleType || 'Selling',
      disabled: Boolean(entry.disabled),
      shippingAmountAccount: entry.shippingAccount || null,
      calculateBasedOn: calcApiMap[entry.calculateBasedOn || 'Net Total'] || 'NetTotal',
      fixedShippingAmount: Number(entry.shippingAmount || 0),
      countries: (entry.countries || []).map((c) => ({ country: c.country })),
    });
    const dto = res.data?.data || res.data;
    return mapShippingRuleDtoToRecord(dto);
  },

  async updateShippingRule(
    id: string,
    entry: Partial<ShippingRuleRecord>
  ): Promise<ShippingRuleRecord> {
    const calcApiMap: Record<string, string> = {
      Fixed: 'Fixed',
      'Net Total': 'NetTotal',
      'Net Weight': 'NetWeight',
    };
    const res = await axiosClient.put(`/v1/stock/setup/shipping-rules/${id}`, {
      id,
      label: entry.shippingRuleLabel || '',
      ruleType: entry.shippingRuleType || 'Selling',
      disabled: Boolean(entry.disabled),
      shippingAmountAccount: entry.shippingAccount || null,
      calculateBasedOn: calcApiMap[entry.calculateBasedOn || 'Net Total'] || 'NetTotal',
      fixedShippingAmount: Number(entry.shippingAmount || 0),
      countries: (entry.countries || []).map((c) => ({ country: c.country })),
    });
    const dto = res.data?.data || res.data;
    return mapShippingRuleDtoToRecord(dto);
  },

  async deleteShippingRule(id: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/setup/shipping-rules/${id}`);
  },

  async getItemAlternatives(itemId?: string): Promise<ItemAlternativeRecord[]> {
    const res = await axiosClient.get('/v1/stock/setup/item-alternatives', {
      params: itemId ? { itemId } : undefined,
    });
    return unwrapList<any>(res.data).map(mapItemAlternativeDtoToRecord);
  },

  async getItemAlternativeById(id: string): Promise<ItemAlternativeRecord | undefined> {
    const res = await axiosClient.get(`/v1/stock/setup/item-alternatives/${id}`);
    return mapItemAlternativeDtoToRecord(res.data);
  },

  async createItemAlternative(entry: Partial<ItemAlternativeRecord>): Promise<ItemAlternativeRecord> {
    await ensureLookups();
    const guidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const findItemId = (val?: string) => {
      if (!val) return EMPTY_GUID;
      const found = cachedRawItems.find((i) => i.itemCode === val || i.id === val || i.itemName === val);
      if (found) return found.id;
      return guidRe.test(val) ? val : EMPTY_GUID;
    };
    const res = await axiosClient.post('/v1/stock/setup/item-alternatives', {
      itemId: findItemId(entry.itemCode),
      alternativeItemId: findItemId(entry.alternativeItemCode),
      twoWay: Boolean(entry.twoWay),
    });
    const mapped = mapItemAlternativeDtoToRecord(res.data);
    return {
      ...mapped,
      itemCode: mapped.itemCode || entry.itemCode || '',
      alternativeItemCode: mapped.alternativeItemCode || entry.alternativeItemCode || '',
    };
  },

  async updateItemAlternative(id: string, entry: Partial<ItemAlternativeRecord>): Promise<ItemAlternativeRecord> {
    await ensureLookups();
    const guidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const findItemId = (val?: string) => {
      if (!val) return EMPTY_GUID;
      const found = cachedRawItems.find((i) => i.itemCode === val || i.id === val || i.itemName === val);
      if (found) return found.id;
      return guidRe.test(val) ? val : EMPTY_GUID;
    };
    const res = await axiosClient.put(`/v1/stock/setup/item-alternatives/${id}`, {
      id,
      itemId: findItemId(entry.itemCode),
      alternativeItemId: findItemId(entry.alternativeItemCode),
      twoWay: Boolean(entry.twoWay),
    });
    const mapped = mapItemAlternativeDtoToRecord(res.data);
    return {
      ...mapped,
      itemCode: mapped.itemCode || entry.itemCode || '',
      alternativeItemCode: mapped.alternativeItemCode || entry.alternativeItemCode || '',
    };
  },

  async deleteItemAlternative(id: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/setup/item-alternatives/${id}`);
  },

  async getDeliveryTrips(params?: Record<string, any>): Promise<DeliveryTripRecord[]> {
    const res = await axiosClient.get('/v1/stock/setup/delivery-trips', {
      params: { ...DEFAULT_PAGE_QUERY, ...params },
    });
    return unwrapList<any>(res.data).map(mapDeliveryTripDtoToRecord);
  },

  async getDeliveryTripById(id: string): Promise<DeliveryTripRecord | undefined> {
    const res = await axiosClient.get(`/v1/stock/setup/delivery-trips/${id}`);
    return mapDeliveryTripDtoToRecord(res.data);
  },

  async createDeliveryTrip(entry: Partial<DeliveryTripRecord>): Promise<DeliveryTripRecord> {
    const toIso = (val?: string) => {
      if (!val) return null;
      const d = new Date(val.replace(' ', 'T'));
      return Number.isNaN(d.getTime()) ? null : d.toISOString();
    };
    const res = await axiosClient.post('/v1/stock/setup/delivery-trips', {
      company: entry.company || 'Altensor',
      tripNo: entry.series || '',
      driverName: entry.driver || '',
      driverAddress: entry.driverAddress || null,
      vehiclePlateNo: entry.vehicle || '',
      initialEmailNotificationSent: Boolean(entry.initialEmailNotificationSent),
      departureTime: toIso(entry.departureTime) || new Date().toISOString(),
      stops: (entry.deliveryStops || []).map((s, idx) => ({
        sequenceNo: idx + 1,
        customerId: s.customerId || null,
        customerName: s.customer,
        address: s.addressName,
        locked: Boolean(s.locked),
        deliveryNoteNo: s.deliveryNote,
        estimatedArrival: toIso(s.estimatedArrival),
      })),
    });
    return mapDeliveryTripDtoToRecord(res.data);
  },

  async updateDeliveryTrip(id: string, entry: Partial<DeliveryTripRecord>): Promise<DeliveryTripRecord> {
    const toIso = (val?: string) => {
      if (!val) return null;
      const d = new Date(val.replace(' ', 'T'));
      return Number.isNaN(d.getTime()) ? null : d.toISOString();
    };
    const res = await axiosClient.put(`/v1/stock/setup/delivery-trips/${id}`, {
      id,
      company: entry.company || 'Altensor',
      tripNo: entry.series || '',
      driverName: entry.driver || '',
      driverAddress: entry.driverAddress || null,
      vehiclePlateNo: entry.vehicle || '',
      initialEmailNotificationSent: Boolean(entry.initialEmailNotificationSent),
      departureTime: toIso(entry.departureTime) || new Date().toISOString(),
      stops: (entry.deliveryStops || []).map((s, idx) => ({
        sequenceNo: idx + 1,
        customerId: s.customerId || null,
        customerName: s.customer,
        address: s.addressName,
        locked: Boolean(s.locked),
        deliveryNoteNo: s.deliveryNote,
        estimatedArrival: toIso(s.estimatedArrival),
      })),
    });
    return mapDeliveryTripDtoToRecord(res.data);
  },

  async deleteDeliveryTrip(id: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/setup/delivery-trips/${id}`);
  },

  async dispatchDeliveryTrip(id: string): Promise<DeliveryTripRecord> {
    const res = await axiosClient.post(`/v1/stock/setup/delivery-trips/${id}/dispatch`);
    return mapDeliveryTripDtoToRecord(res.data);
  },

  async markDeliveryStopVisited(tripId: string, stopId: string): Promise<DeliveryTripRecord> {
    const res = await axiosClient.post(`/v1/stock/setup/delivery-trips/${tripId}/stops/${stopId}/visited`);
    return mapDeliveryTripDtoToRecord(res.data);
  },

  async getQualityInspectionTemplates(): Promise<QualityInspectionTemplateRecord[]> {
    const res = await axiosClient.get('/v1/stock/setup/quality-inspection-templates');
    return unwrapList<any>(res.data).map(mapQiTemplateDtoToRecord);
  },

  async getQualityInspectionTemplateById(id: string): Promise<QualityInspectionTemplateRecord | undefined> {
    const all = await this.getQualityInspectionTemplates();
    return all.find((t) => t.id === id || t.templateName === id);
  },

  async createQualityInspectionTemplate(entry: Partial<QualityInspectionTemplateRecord>): Promise<QualityInspectionTemplateRecord> {
    const res = await axiosClient.post('/v1/stock/setup/quality-inspection-templates', {
      templateName: entry.templateName || '',
      parameters: (entry.parameters || []).map((p) => ({
        parameterName: p.parameter,
        acceptanceCriteriaValue: p.acceptanceCriteria || null,
        numeric: Boolean(p.numeric),
        minValue: p.minValue ?? null,
        maxValue: p.maxValue ?? null,
      })),
    });
    const dto = res.data?.data || res.data;
    return mapQiTemplateDtoToRecord(dto);
  },

  async updateQualityInspectionTemplate(
    id: string,
    entry: Partial<QualityInspectionTemplateRecord>
  ): Promise<QualityInspectionTemplateRecord> {
    const res = await axiosClient.put(`/v1/stock/setup/quality-inspection-templates/${id}`, {
      id,
      templateName: entry.templateName || '',
      parameters: (entry.parameters || []).map((p) => ({
        parameterName: p.parameter,
        acceptanceCriteriaValue: p.acceptanceCriteria || null,
        numeric: Boolean(p.numeric),
        minValue: p.minValue ?? null,
        maxValue: p.maxValue ?? null,
      })),
    });
    const dto = res.data?.data || res.data;
    return mapQiTemplateDtoToRecord(dto);
  },

  async deleteQualityInspectionTemplate(id: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/setup/quality-inspection-templates/${id}`);
  },

  // ==========================================
  // DOCUMENT METADATA & BULK ACTIONS (/api/v1/stock/documents/...)
  // ==========================================
  async getDocumentComments(docType: string, docId: string): Promise<any[]> {
    const res = await axiosClient.get(`/v1/stock/documents/${docType}/${docId}/comments`);
    return Array.isArray(res.data) ? res.data : [];
  },

  async addDocumentComment(docType: string, docId: string, content: string): Promise<any> {
    const res = await axiosClient.post(`/v1/stock/documents/${docType}/${docId}/comments`, { content });
    return res.data;
  },

  async getDocumentActivity(docType: string, docId: string): Promise<any[]> {
    const res = await axiosClient.get(`/v1/stock/documents/${docType}/${docId}/activity`);
    return Array.isArray(res.data) ? res.data : [];
  },

  async getDocumentAttachments(docType: string, docId: string): Promise<any[]> {
    const res = await axiosClient.get(`/v1/stock/documents/${docType}/${docId}/attachments`);
    return Array.isArray(res.data) ? res.data : [];
  },

  async getAttachmentLibrary(search?: string, limit = 50): Promise<any[]> {
    const res = await axiosClient.get('/v1/stock/documents/attachments/library', {
      params: { search: search || undefined, limit },
    });
    return Array.isArray(res.data) ? res.data : [];
  },

  async addDocumentAttachment(
    docType: string,
    docId: string,
    payload: {
      fileName: string;
      contentType?: string;
      fileSizeBytes?: number;
      base64Content?: string;
      externalUrl?: string;
      sourceType?: 'Device' | 'Library' | 'Link' | 'Camera';
      storagePath?: string;
      libraryAttachmentId?: string;
      optimize?: boolean;
      isPrivate?: boolean;
    }
  ): Promise<any> {
    const res = await axiosClient.post(`/v1/stock/documents/${docType}/${docId}/attachments`, payload);
    return res.data;
  },

  async updateAttachmentVisibility(attachmentId: string, isPrivate: boolean): Promise<any> {
    const res = await axiosClient.patch(`/v1/stock/documents/attachments/${attachmentId}/visibility`, {
      isPrivate,
    });
    return res.data;
  },

  async downloadDocumentAttachment(attachmentId: string, inline = true): Promise<Blob> {
    const res = await axiosClient.get(`/v1/stock/documents/attachments/${attachmentId}/download`, {
      params: { inline },
      responseType: 'blob',
    });
    return res.data;
  },

  async deleteDocumentAttachment(attachmentId: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/documents/attachments/${attachmentId}`);
  },

  async getDocumentTags(docType: string, docId: string): Promise<any[]> {
    const res = await axiosClient.get(`/v1/stock/documents/${docType}/${docId}/tags`);
    return Array.isArray(res.data) ? res.data : [];
  },

  async addDocumentTag(docType: string, docId: string, tagName: string, colorHex?: string): Promise<any> {
    const res = await axiosClient.post(`/v1/stock/documents/${docType}/${docId}/tags`, { tagName, colorHex });
    return res.data;
  },

  async removeDocumentTag(docType: string, docId: string, tagName: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/documents/${docType}/${docId}/tags/${encodeURIComponent(tagName)}`);
  },

  async getDocumentAssignments(docType: string, docId: string): Promise<any[]> {
    const res = await axiosClient.get(`/v1/stock/documents/${docType}/${docId}/assignments`);
    return Array.isArray(res.data) ? res.data : [];
  },

  async assignDocument(
    docType: string,
    docId: string,
    payload: { assignedToUserId?: string; priority?: string; dueDate?: string; note?: string }
  ): Promise<any> {
    const res = await axiosClient.post(`/v1/stock/documents/${docType}/${docId}/assignments`, payload);
    return res.data;
  },

  async completeDocumentAssignment(assignmentId: string): Promise<void> {
    await axiosClient.post(`/v1/stock/documents/assignments/${assignmentId}/complete`);
  },

  async getDocumentShares(docType: string, docId: string): Promise<any[]> {
    const res = await axiosClient.get(`/v1/stock/documents/${docType}/${docId}/shares`);
    return Array.isArray(res.data) ? res.data : [];
  },

  async upsertDocumentShare(
    docType: string,
    docId: string,
    payload: {
      id?: string;
      userId?: string | null;
      userName: string;
      isEveryone?: boolean;
      canRead: boolean;
      canWrite: boolean;
      canSubmit: boolean;
      canShare: boolean;
    }
  ): Promise<any> {
    const res = await axiosClient.post(`/v1/stock/documents/${docType}/${docId}/shares`, payload);
    return res.data;
  },

  async deleteDocumentShare(_docType: string, _docId: string, shareId: string): Promise<void> {
    await axiosClient.delete(`/v1/stock/documents/shares/${shareId}`);
  },

  async getDocumentUsers(search?: string, limit = 20): Promise<any[]> {
    const res = await axiosClient.get('/v1/stock/documents/users', {
      params: { search: search || undefined, limit },
    });
    return Array.isArray(res.data) ? res.data : [];
  },

  async getDocumentConnections(docType: string, docId: string): Promise<any> {
    const res = await axiosClient.get(`/v1/stock/documents/${docType}/${docId}/connections`);
    return res.data;
  },

  async executeBulkAction(
    docType: string,
    action: 'Delete' | 'Submit' | 'Cancel' | 'AddTag' | 'Assign',
    ids: string[],
    extra?: { tagName?: string; assignToUserId?: string; reason?: string }
  ): Promise<any> {
    const res = await axiosClient.post(`/v1/stock/documents/${docType}/bulk-action`, {
      action,
      ids,
      ...extra,
    });
    return res.data;
  },
  // ==========================================
  async getStockLedgerReport(filter?: Record<string, any>): Promise<any[]> {
    const res = await axiosClient.get('/v1/stock/reports/stock-ledger', { params: filter });
    return Array.isArray(res.data) ? res.data : [];
  },

  async getStockBalanceReport(filter?: Record<string, any>): Promise<any[]> {
    const res = await axiosClient.get('/v1/stock/reports/stock-balance', { params: filter });
    return Array.isArray(res.data) ? res.data : [];
  },

  async getProjectedQtyReport(filter?: Record<string, any>): Promise<any[]> {
    const res = await axiosClient.get('/v1/stock/reports/projected-qty', { params: filter });
    return Array.isArray(res.data) ? res.data : [];
  },

  async getStockAgeingReport(filter?: Record<string, any>): Promise<any[]> {
    const res = await axiosClient.get('/v1/stock/reports/stock-ageing', { params: filter });
    return Array.isArray(res.data) ? res.data : [];
  },

  async getItemPriceStockReport(filter?: Record<string, any>): Promise<any[]> {
    const res = await axiosClient.get('/v1/stock/reports/item-price-stock', { params: filter });
    return Array.isArray(res.data) ? res.data : [];
  },

  async getWarehouseWiseBalanceReport(filter?: Record<string, any>): Promise<any[]> {
    const res = await axiosClient.get('/v1/stock/reports/warehouse-wise-balance', { params: filter });
    return Array.isArray(res.data) ? res.data : [];
  },

  async getStockAnalyticsReport(filter?: Record<string, any>): Promise<any[]> {
    const res = await axiosClient.get('/v1/stock/reports/stock-analytics', { params: filter });
    return Array.isArray(res.data) ? res.data : [];
  },

  async getTotalStockSummaryReport(filter?: Record<string, any>): Promise<any[]> {
    const res = await axiosClient.get('/v1/stock/reports/total-stock-summary', { params: filter });
    return Array.isArray(res.data) ? res.data : [];
  },

  async getItemVariantDetailsReport(templateItemId: string): Promise<any[]> {
    const res = await axiosClient.get(`/v1/stock/reports/item-variant-details/${templateItemId}`);
    return Array.isArray(res.data) ? res.data : [];
  },

  async getBatchWiseBalanceReport(filter?: Record<string, any>): Promise<any[]> {
    const res = await axiosClient.get('/v1/stock/reports/batch-wise-balance', { params: filter });
    return Array.isArray(res.data) ? res.data : [];
  },

  async getBatchExpiryStatusReport(filter?: Record<string, any>): Promise<any[]> {
    const res = await axiosClient.get('/v1/stock/reports/batch-expiry-status', { params: filter });
    return Array.isArray(res.data) ? res.data : [];
  },

  async getSerialNoLedgerReport(filter?: Record<string, any>): Promise<any[]> {
    const res = await axiosClient.get('/v1/stock/reports/serial-no-ledger', { params: filter });
    return Array.isArray(res.data) ? res.data : [];
  },

  async getStockVsSerialBatchReport(filter?: Record<string, any>): Promise<any[]> {
    const res = await axiosClient.get('/v1/stock/reports/stock-vs-serial-batch', { params: filter });
    return Array.isArray(res.data) ? res.data : [];
  },

  async getDeliveryAndReceiptTrendsReport(filter?: Record<string, any>): Promise<any[]> {
    const res = await axiosClient.get('/v1/stock/reports/delivery-and-receipt-trends', { params: filter });
    return Array.isArray(res.data) ? res.data : [];
  },
};

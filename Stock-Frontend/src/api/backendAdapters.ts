import type {
  Warehouse,
  StockProduct,
  StockMovement,
  StockEntryRecord,
  StockEntryType,
  StockEntryStatus,
  PurchaseReceiptRecord,
  PurchaseReceiptStatus,
  DeliveryNoteRecord,
  DeliveryNoteStatus,
  MaterialRequestRecord,
  MaterialRequestStatus,
  MaterialRequestPurpose,
  PickListRecord,
  PickListStatus,
  PickListPurpose,
  StockReconciliationRecord,
  StockReconciliationStatus,
  StockReconciliationPurpose,
  LandedCostVoucherRecord,
  LandedCostVoucherStatus,
  RepostItemValuationRecord,
  RepostItemValuationStatus,
  PackingSlipRecord,
  PackingSlipStatus,
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
  DeliveryTripStatus,
  QualityInspectionTemplateRecord,
} from '../types';

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export function unwrapList<T>(data: PagedResult<T> | T[] | null | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

export function formatTimeAgo(dateStr?: string | null): string {
  if (!dateStr) return 'Recently';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return 'Recently';
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

// ---------- Enum Helpers ----------

const STOCK_ENTRY_PURPOSE_TO_UI: Record<string, StockEntryType> = {
  MaterialIssue: 'Material Issue',
  MaterialReceipt: 'Material Receipt',
  MaterialTransfer: 'Material Transfer',
  MaterialTransferForManufacture: 'Material Transfer for Manufacture',
  MaterialConsumptionForManufacture: 'Material Consumption for Manufacture',
  Manufacture: 'Manufacture',
  Repack: 'Repack',
  SendToSubcontractor: 'Send to Subcontractor',
};

const STOCK_ENTRY_PURPOSE_TO_API: Record<string, string> = {
  'Material Issue': 'MaterialIssue',
  'Material Receipt': 'MaterialReceipt',
  'Material Transfer': 'MaterialTransfer',
  'Material Transfer for Manufacture': 'MaterialTransferForManufacture',
  'Material Consumption for Manufacture': 'MaterialConsumptionForManufacture',
  Manufacture: 'Manufacture',
  Repack: 'Repack',
  'Send to Subcontractor': 'SendToSubcontractor',
};

const MR_PURPOSE_TO_UI: Record<string, MaterialRequestPurpose> = {
  Purchase: 'Purchase',
  MaterialTransfer: 'Material Transfer',
  MaterialIssue: 'Material Issue',
  Manufacture: 'Manufacture',
  CustomerProvided: 'Customer Provided',
};

const MR_PURPOSE_TO_API: Record<string, string> = {
  Purchase: 'Purchase',
  'Material Transfer': 'MaterialTransfer',
  'Material Issue': 'MaterialIssue',
  Manufacture: 'Manufacture',
  'Customer Provided': 'CustomerProvided',
};

const PICK_PURPOSE_TO_UI: Record<string, PickListPurpose> = {
  MaterialTransferForManufacture: 'Material Transfer for Manufacture',
  MaterialTransfer: 'Material Transfer',
  Delivery: 'Delivery',
};

const PICK_PURPOSE_TO_API: Record<string, string> = {
  'Material Transfer for Manufacture': 'MaterialTransferForManufacture',
  'Material Transfer': 'MaterialTransfer',
  Delivery: 'Delivery',
};

function mapDocStatusToStockEntry(status?: string): StockEntryStatus {
  if (status === 'Submitted' || status === 'Completed') return 'Submitted';
  if (status === 'Cancelled') return 'Cancelled';
  return 'Draft';
}

function mapDocStatusToPr(status?: string): PurchaseReceiptStatus {
  if (status === 'ToBill' || status === 'Submitted') return 'To Bill';
  if (status === 'Completed' || status === 'Closed') return 'Completed';
  if (status === 'Cancelled') return 'Cancelled';
  return 'Draft';
}

function mapDocStatusToDn(status?: string): DeliveryNoteStatus {
  if (status === 'ToBill' || status === 'Submitted') return 'To Bill';
  if (status === 'Completed') return 'Completed';
  if (status === 'ReturnIssued') return 'Return Issued';
  if (status === 'Cancelled') return 'Cancelled';
  if (status === 'Closed') return 'Closed';
  return 'Draft';
}

function mapDocStatusToMr(status?: string): MaterialRequestStatus {
  if (status === 'PartiallyOrdered') return 'Partially Ordered';
  if (
    status === 'Draft' ||
    status === 'Submitted' ||
    status === 'Stopped' ||
    status === 'Cancelled' ||
    status === 'Pending' ||
    status === 'Ordered' ||
    status === 'Issued' ||
    status === 'Transferred' ||
    status === 'Received'
  ) {
    return status;
  }
  return 'Draft';
}

function mapDocStatusToPick(status?: string): PickListStatus {
  if (status === 'Submitted' || status === 'ToBill' || status === 'ToReceive') return 'Open';
  if (status === 'Completed' || status === 'Closed') return 'Completed';
  if (status === 'Cancelled') return 'Cancelled';
  return 'Draft';
}

// ---------- Setup Mappers ----------

export function mapWarehouseDtoToLegacy(dto: any): Warehouse {
  return {
    id: dto.id,
    code: dto.code || '',
    name: dto.name || '',
    location: [dto.addressLine1, dto.city, dto.state].filter(Boolean).join(', ') || 'Main',
    capacity: 1000,
    usedCapacity: 0,
    managerName: '',
    contactPhone: dto.phoneNo || dto.mobileNo || '',
    status: dto.disabled ? 'inactive' : 'active',
    totalProductsCount: 0,
    totalStockValue: Number(dto.totalStockValue || 0),
    createdAt: new Date().toISOString(),
  };
}

export function mapWarehouseDtoToRecord(dto: any): WarehouseRecord {
  return {
    id: dto.id,
    warehouseName: dto.name || dto.code || '',
    status: dto.disabled ? 'Disabled' : 'Enabled',
    company: 'Altensor',
    account: dto.accountCode || '',
    isGroupWarehouse: Boolean(dto.isGroup),
    isRejectedWarehouse: Boolean(dto.isRejectedWarehouse),
    parentWarehouse: dto.parentWarehouseName || dto.parentWarehouseId || '',
    phoneNo: dto.phoneNo || '',
    mobileNo: dto.mobileNo || '',
    addressLine1: dto.addressLine1 || '',
    addressLine2: dto.addressLine2 || '',
    city: dto.city || '',
    stateProvince: dto.state || '',
    pin: dto.pin || '',
    warehouseType: dto.warehouseType || 'Main',
    defaultInTransitWarehouse: dto.defaultInTransitWarehouseId || '',
    createdOn: new Date().toISOString(),
    commentsCount: 0,
    isLiked: false,
  };
}

export function mapWarehouseRecordToDto(
  rec: Partial<WarehouseRecord>,
  parentId?: string,
  defaultInTransitWarehouseId?: string
): any {
  return {
    code: (rec.warehouseName || 'WH').toUpperCase().replace(/\s+/g, '-').slice(0, 20),
    name: rec.warehouseName || '',
    parentWarehouseId: parentId || null,
    isGroup: Boolean(rec.isGroupWarehouse),
    disabled: rec.status === 'Disabled',
    isRejectedWarehouse: Boolean(rec.isRejectedWarehouse),
    warehouseType: rec.warehouseType || 'Main',
    accountCode: rec.account || null,
    addressLine1: rec.addressLine1 || null,
    addressLine2: rec.addressLine2 || null,
    city: rec.city || null,
    state: rec.stateProvince || null,
    pin: rec.pin || null,
    phoneNo: rec.phoneNo || null,
    mobileNo: rec.mobileNo || null,
    defaultInTransitWarehouseId: defaultInTransitWarehouseId || null,
  };
}

export function mapItemDtoToRecord(dto: any): ItemRecord {
  const valMap: Record<string, string> = {
    FIFO: 'FIFO',
    MovingAverage: 'Moving Average',
    LIFO: 'LIFO',
  };
  const mrMap: Record<string, string> = {
    Purchase: 'Purchase',
    MaterialTransfer: 'Material Transfer',
    MaterialIssue: 'Material Issue',
    Manufacture: 'Manufacture',
    CustomerProvided: 'Customer Provided',
  };
  let formattedEndOfLife = '31-12-2099';
  if (dto.endOfLife) {
    const d = new Date(dto.endOfLife);
    if (!Number.isNaN(d.getTime())) {
      const dd = String(d.getUTCDate()).padStart(2, '0');
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const yyyy = d.getUTCFullYear();
      formattedEndOfLife = `${dd}-${mm}-${yyyy}`;
    }
  }
  return {
    id: dto.id,
    itemCode: dto.itemCode || '',
    itemName: dto.itemName || '',
    status: dto.disabled ? 'Disabled' : 'Enabled',
    itemGroup: dto.itemGroupName || 'All Item Groups',
    uom: dto.stockUomName || 'Nos',
    itemType: dto.isStockItem ? 'Stock Item' : 'Non-Stock Item',
    purpose: dto.defaultMaterialRequestType || 'Purchase',
    maintainStock: Boolean(dto.isStockItem),
    isFixedAsset: Boolean(dto.isFixedAsset),
    hasVariants: Boolean(dto.hasVariants),
    variantOf: dto.variantOfItemId || undefined,
    brand: dto.brandName || '',
    description: dto.description || '',
    allowSales: dto.isSalesItem !== false,
    allowPurchase: dto.isPurchaseItem !== false,
    allowAlternativeItem: Boolean(dto.allowAlternativeItem),
    isCustomerProvidedItem: Boolean(dto.isCustomerProvidedItem),
    standardSellingRate: Number(dto.standardSellingRate || 0),
    overDeliveryAllowance: Number(dto.overDeliveryReceiptAllowancePercent || 0),
    valuationMethod: valMap[dto.valuationMethod] || '',
    valuationRate: Number(dto.valuationRate || 0),
    endOfLife: formattedEndOfLife,
    warrantyPeriodDays: Number(dto.warrantyPeriodDays || 0),
    defaultMaterialRequestType: mrMap[dto.defaultMaterialRequestType] || 'Purchase',
    weightPerUnit: Number(dto.weightPerUnit || 0),
    weightUom: dto.weightUomId || '',
    allowNegativeStock: Boolean(dto.allowNegativeStock),
    hasBatchNo: Boolean(dto.hasBatchNo),
    hasSerialNo: Boolean(dto.hasSerialNo),
    purchaseUom: dto.purchaseUomId || '',
    minOrderQty: Number(dto.minOrderQty || 0),
    safetyStock: Number(dto.safetyStock || 0),
    leadTimeDays: Number(dto.leadTimeDays || 0),
    lastPurchaseRate: Number(dto.lastPurchaseRate || 0),
    salesUom: dto.salesUomId || '',
    maxDiscountPercent: Number(dto.maxDiscountPercent || 0),
    grantCommission: dto.grantCommission !== false,
    includeItemInManufacturing: dto.includeItemInManufacturing !== false,
    isSubcontractedItem: Boolean(dto.isSubContractedItem),
    inspectionRequiredBeforePurchase: Boolean(dto.inspectionRequiredBeforePurchase),
    inspectionRequiredBeforeDelivery: Boolean(dto.inspectionRequiredBeforeDelivery),
    qualityInspectionTemplateId: dto.qualityInspectionTemplateId || '',
    qualityInspectionTemplate: dto.qualityInspectionTemplateId || '',
    itemDefaults: dto.itemDefaults || [],
    uomConversions: dto.uomConversions || [],
    taxes: dto.taxes || [],
    barcodes: dto.barcodes || [],
    reorderLevels: dto.reorderLevels || [],
    suppliers: dto.suppliers || [],
    customerDetails: dto.customerDetails || [],
    createdOn: new Date().toISOString(),
    lastUpdatedOn: new Date().toISOString(),
    timeAgoText: 'just now',
    commentsCount: 0,
    isLiked: false,
  };
}

export function mapItemDtoToProduct(dto: any): StockProduct {
  return {
    id: dto.id,
    sku: dto.itemCode || '',
    barcode: dto.barcodes?.[0]?.barcode || dto.itemCode || '',
    name: dto.itemName || '',
    category: dto.itemGroupName || 'General',
    warehouseId: dto.itemDefaults?.[0]?.defaultWarehouseId || '',
    warehouseName: '',
    unit: dto.stockUomName || 'Nos',
    currentStock: Number(dto.openingStock || 0),
    minStock: Number(dto.safetyStock || 0),
    maxStock: 0,
    buyPrice: Number(dto.valuationRate || dto.lastPurchaseRate || 0),
    sellPrice: Number(dto.standardSellingRate || 0),
    currency: 'AZN',
    status: Number(dto.openingStock || 0) <= 0 ? 'out_of_stock' : 'in_stock',
    updatedAt: new Date().toISOString(),
  };
}

export function mapItemGroupDtoToRecord(dto: any): ItemGroupRecord {
  return {
    id: dto.id,
    itemGroupName: dto.groupName || '',
    parentItemGroup: dto.parentGroupName || '',
    isGroup: Boolean(dto.isGroup),
    timeAgoText: 'Active',
    commentsCount: 0,
    isLiked: false,
    defaults: Array.isArray(dto.defaults) ? dto.defaults : [],
    taxes: Array.isArray(dto.taxes) ? dto.taxes : [],
    createdOn: new Date().toISOString(),
    lastUpdatedOn: new Date().toISOString(),
  };
}

export function flattenItemGroupTree(nodes: any[]): ItemGroupRecord[] {
  const result: ItemGroupRecord[] = [];
  const walk = (list: any[]) => {
    for (const node of list) {
      result.push(mapItemGroupDtoToRecord(node));
      if (Array.isArray(node.children) && node.children.length > 0) {
        walk(node.children);
      }
    }
  };
  walk(nodes || []);
  return result;
}

export function mapItemAttributeDtoToRecord(dto: any): ItemAttributeRecord {
  return {
    id: dto.id,
    attributeName: dto.attributeName || '',
    status: 'Enabled',
    disabled: false,
    numericValues: Boolean(dto.numericValues),
    values: (dto.values || []).map((v: any, idx: number) => ({
      id: v.id || String(idx + 1),
      attributeValue: v.attributeValue || '',
      abbreviation: v.abbreviation || '',
    })),
    timeAgoText: 'Active',
    commentsCount: 0,
    isLiked: false,
  };
}

export function mapBrandDtoToRecord(dto: any): BrandRecord {
  return {
    id: dto.id,
    brandName: dto.brandName || '',
    description: dto.description || '',
    defaults: Array.isArray(dto.defaults) ? dto.defaults : [],
    timeAgoText: 'Active',
    commentsCount: 0,
    isLiked: false,
  };
}

export function mapUomDtoToRecord(dto: any): UOMRecord {
  return {
    id: dto.id,
    uomName: dto.uomName || '',
    symbol: dto.symbol || '',
    commonCode: dto.commonCode || '',
    description: dto.description || '',
    category: dto.category || '',
    status: dto.enabled === false ? 'Disabled' : 'Enabled',
    enabled: dto.enabled !== false,
    mustBeWholeNumber: Boolean(dto.mustBeWholeNumber),
    commentsCount: 0,
    isLiked: false,
  };
}

export function mapUomConversionDtoToRecord(dto: any, uoms?: any[]): UOMConversionFactorRecord {
  const matchedFrom = uoms?.find((u) => u.id === dto.fromUomId)?.uomName;
  const matchedTo = uoms?.find((u) => u.id === dto.toUomId)?.uomName;
  return {
    id: dto.id,
    category: dto.category || 'Unit',
    fromUOM: dto.fromUomName || matchedFrom || dto.fromUomId || '',
    toUOM: dto.toUomName || matchedTo || dto.toUomId || '',
    value: String(dto.value ?? 1),
    commentsCount: 0,
    isLiked: false,
  };
}

export function mapSerialNumberDtoToRecord(dto: any): SerialNoRecord {
  const statusMap: Record<string, 'Active' | 'Delivered' | 'Expired'> = {
    Active: 'Active',
    Delivered: 'Delivered',
    Expired: 'Expired',
    Inactive: 'Expired',
    Returned: 'Active',
  };
  return {
    id: dto.id,
    serialNo: dto.serialNo || '',
    itemCode: dto.itemCode || dto.itemName || '',
    status: statusMap[dto.status] || 'Active',
    warehouse: dto.warehouseName || '',
    company: 'Altensor',
    warrantyExpiryDate: dto.warrantyExpiryDate ? String(dto.warrantyExpiryDate).slice(0, 10) : '',
    amcExpiryDate: dto.amcExpiryDate ? String(dto.amcExpiryDate).slice(0, 10) : '',
    createdOn: dto.purchaseDate || new Date().toISOString(),
    commentsCount: 0,
    isLiked: false,
  };
}

export function mapBatchDtoToRecord(dto: any, uoms?: any[]): BatchRecord {
  const isExpired = dto.expiryDate && new Date(dto.expiryDate).getTime() < Date.now();
  const uom = uoms?.find((u) => u.id === dto.stockUomId);
  return {
    id: dto.id,
    batchId: dto.batchNo || '',
    item: dto.itemCode || dto.itemName || '',
    batchUOM: uom?.name || dto.stockUomName || '',
    manufacturingDate: dto.manufacturingDate ? String(dto.manufacturingDate).slice(0, 10) : '',
    expiryDate: dto.expiryDate ? String(dto.expiryDate).slice(0, 10) : '',
    useBatchWiseValuation: Boolean(dto.useBatchwiseValuation),
    description: dto.description || '',
    status: dto.disabled ? 'Disabled' : isExpired ? 'Expired' : 'Active',
    commentsCount: 0,
    isLiked: false,
  };
}

export function mapBundleDtoToRecord(dto: any): SerialAndBatchBundleRecord {
  return {
    id: dto.id,
    namingSeries: dto.namingSeries || '',
    company: 'Altensor',
    hasSerialNo: Boolean(dto.hasSerialNo),
    hasBatchNo: Boolean(dto.hasBatchNo),
    itemCode: dto.itemCode || '',
    warehouse: dto.warehouseName || '',
    typeOfTransaction: dto.transactionType === 'Outward' ? 'Outward' : 'Inward',
    voucherType: dto.voucherType || '',
    voucherNo: dto.voucherNo || '',
    isCancelled: Boolean(dto.isCancelled),
    status: dto.isCancelled ? 'Cancelled' : 'Submitted',
    items: (dto.entries || []).map((e: any, idx: number) => ({
      id: e.id || String(idx + 1),
      serialNo: e.serialNo || '',
      batchNo: e.batchNo || '',
      qty: Number(e.qty || 0),
      warehouse: dto.warehouseName || '',
    })),
    commentsCount: 0,
    isLiked: false,
  };
}

export function mapInventoryDimensionDtoToRecord(dto: any): InventoryDimensionRecord {
  return {
    id: dto.id,
    dimensionName: dto.dimensionName || '',
    referenceDocument: dto.referenceDocument || '',
    applyToAllInventoryDocuments: Boolean(dto.applyToAllInventoryDocuments),
    validateNegativeStock: Boolean(dto.validateNegativeStock),
    mandatory: Boolean(dto.mandatoryDependsOn),
    commentsCount: 0,
    isLiked: false,
  };
}

export function mapShippingRuleDtoToRecord(dto: any): ShippingRuleRecord {
  const calcMap: Record<string, 'Fixed' | 'Net Total' | 'Net Weight'> = {
    Fixed: 'Fixed',
    NetTotal: 'Net Total',
    NetWeight: 'Net Weight',
  };
  return {
    id: dto.id,
    shippingRuleLabel: dto.label || '',
    shippingRuleType: dto.ruleType === 'Buying' ? 'Buying' : 'Selling',
    disabled: Boolean(dto.disabled),
    company: 'Altensor',
    shippingAccount: dto.shippingAmountAccount || '',
    calculateBasedOn: calcMap[dto.calculateBasedOn] || 'Net Total',
    shippingAmount: Number(dto.fixedShippingAmount || 0),
    countries: (dto.countries || []).map((c: any, idx: number) => ({
      id: c.id || String(idx + 1),
      country: c.country || '',
    })),
    status: dto.disabled ? 'Disabled' : 'Active',
    commentsCount: 0,
    isLiked: false,
  };
}

export function mapItemAlternativeDtoToRecord(dto: any): ItemAlternativeRecord {
  return {
    id: dto.id,
    itemCode: dto.itemCode || dto.itemName || '',
    alternativeItemCode: dto.alternativeItemCode || dto.alternativeItemName || '',
    twoWay: Boolean(dto.twoWay),
    commentsCount: 0,
    isLiked: false,
  };
}

export function mapQiTemplateDtoToRecord(dto: any): QualityInspectionTemplateRecord {
  return {
    id: dto.id,
    templateName: dto.templateName || '',
    parameters: (dto.parameters || []).map((p: any, idx: number) => ({
      id: p.id || String(idx + 1),
      parameter: p.parameterName || '',
      acceptanceCriteria: p.acceptanceCriteriaValue || '',
      numeric: Boolean(p.numeric),
      minValue: p.minValue ?? undefined,
      maxValue: p.maxValue ?? undefined,
    })),
    commentsCount: 0,
    isLiked: false,
  };
}

export function mapDeliveryTripDtoToRecord(dto: any): DeliveryTripRecord {
  const statusMap: Record<string, DeliveryTripStatus> = {
    Draft: 'Draft',
    Scheduled: 'Draft',
    InTransit: 'In Transit',
    Completed: 'Completed',
    Cancelled: 'Cancelled',
  };
  return {
    id: dto.id,
    series: dto.tripNo || dto.id,
    company: 'Altensor',
    initialEmailNotificationSent: false,
    driver: dto.driverName || '',
    vehicle: dto.vehiclePlateNo || '',
    driverAddress: '',
    departureTime: dto.departureTime || new Date().toISOString(),
    status: statusMap[dto.status] || 'Draft',
    deliveryStops: (dto.stops || []).map((s: any, idx: number) => ({
      id: s.id || String(idx + 1),
      customer: s.customerName || '',
      addressName: s.address || '',
      locked: Boolean(s.locked),
      deliveryNote: s.deliveryNoteNo || '',
      estimatedArrival: s.estimatedArrival || '',
    })),
    commentsCount: 0,
    isLiked: false,
  };
}

// ---------- Transaction Mappers ----------

export function mapStockEntryDtoToRecord(dto: any): StockEntryRecord {
  const purposeUi = STOCK_ENTRY_PURPOSE_TO_UI[dto.purpose] || 'Material Transfer';
  const postingDate = dto.postingDate ? String(dto.postingDate).slice(0, 10) : new Date().toISOString().slice(0, 10);
  return {
    id: dto.id,
    title: dto.entryNo || dto.id,
    stockEntryType: purposeUi,
    status: mapDocStatusToStockEntry(dto.status),
    purpose: purposeUi,
    defaultSourceWarehouse: dto.defaultSourceWarehouseName || '',
    defaultTargetWarehouse: dto.defaultTargetWarehouseName || '',
    perTransferred: dto.status === 'Submitted' || dto.status === 'Completed' ? 100 : 0,
    isReturn: false,
    company: 'Altensor',
    series: dto.entryNo || '',
    createdOn: postingDate,
    lastUpdatedOn: postingDate,
    timeAgoText: formatTimeAgo(dto.postingDate),
    commentsCount: 0,
    isLiked: false,
    remarks: dto.remarks || '',
    items: (dto.lines || []).map((l: any, idx: number) => ({
      id: l.id || String(idx + 1),
      itemCode: l.itemCode || '',
      itemName: l.itemName || '',
      qty: Number(l.qty || 0),
      uom: l.uomName || 'Nos',
      basicRate: Number(l.basicRate || 0),
      amount: Number(l.amount || l.basicAmount || 0),
    })),
  };
}

export function mapStockEntryRecordToDto(
  rec: Partial<StockEntryRecord>,
  ctx: { items?: any[]; warehouses?: any[]; uoms?: any[] }
): any {
  const purposeApi = STOCK_ENTRY_PURPOSE_TO_API[rec.stockEntryType || rec.purpose || 'Material Transfer'] || 'MaterialTransfer';
  const findWhId = (name?: string) =>
    ctx.warehouses?.find((w) => w.name === name || w.code === name || w.id === name)?.id || null;
  const defaultUomId = ctx.uoms?.[0]?.id || '00000000-0000-0000-0000-000000000000';

  return {
    entryNo: rec.series || rec.title || '',
    purpose: purposeApi,
    postingDate: rec.createdOn ? new Date(rec.createdOn).toISOString() : new Date().toISOString(),
    defaultSourceWarehouseId: findWhId(rec.defaultSourceWarehouse),
    defaultTargetWarehouseId: findWhId(rec.defaultTargetWarehouse),
    remarks: rec.remarks || null,
    lines: (rec.items || []).map((line) => {
      const matchedItem = ctx.items?.find((i) => i.itemCode === line.itemCode || i.id === line.itemCode);
      const uomId =
        ctx.uoms?.find((u) => u.uomName === line.uom)?.id ||
        matchedItem?.stockUomId ||
        defaultUomId;
      return {
        sourceWarehouseId: findWhId(rec.defaultSourceWarehouse),
        targetWarehouseId: findWhId(rec.defaultTargetWarehouse),
        itemId: matchedItem?.id || '00000000-0000-0000-0000-000000000000',
        itemCode: line.itemCode,
        itemName: line.itemName,
        qty: Number(line.qty || 0),
        uomId,
        stockUomId: matchedItem?.stockUomId || uomId,
        conversionFactor: 1,
        basicRate: Number(line.basicRate || 0),
        amount: Number(line.amount || 0),
      };
    }),
  };
}

export function mapPurchaseReceiptDtoToRecord(dto: any): PurchaseReceiptRecord {
  const postingDate = dto.postingDate ? String(dto.postingDate).slice(0, 10) : new Date().toISOString().slice(0, 10);
  return {
    id: dto.id,
    supplierName: dto.vendorName || '',
    status: mapDocStatusToPr(dto.status),
    date: postingDate,
    postingDate,
    postingTime: dto.postingTime || '00:00:00',
    grandTotal: Number(dto.grandTotal || 0),
    currency: dto.currency || 'AZN',
    perAmountBilled: Number(dto.perBilledPercent || 0),
    perReturned: dto.isReturn ? 100 : 0,
    company: 'Altensor',
    series: dto.receiptNo || dto.id,
    exchangeRate: Number(dto.exchangeRate || 1),
    netTotal: Number(dto.totalNetAmount || 0),
    acceptedWarehouse: dto.acceptedWarehouseName || '',
    rejectedWarehouse: dto.rejectedWarehouseName || '',
    createdOn: postingDate,
    lastUpdatedOn: postingDate,
    timeAgoText: formatTimeAgo(dto.postingDate),
    commentsCount: 0,
    isLiked: false,
    remarks: dto.remarks || '',
    items: (dto.lines || []).map((l: any, idx: number) => ({
      id: l.id || String(idx + 1),
      itemCode: l.itemCode || '',
      itemName: l.itemName || '',
      receivedQty: Number(l.receivedQty || 0),
      acceptedQty: Number(l.acceptedQty || 0),
      rejectedQty: Number(l.rejectedQty || 0),
      uom: l.uomName || 'Nos',
      rate: Number(l.rate || 0),
      amount: Number(l.amount || 0),
      warehouse: l.acceptedWarehouseName || dto.acceptedWarehouseName || '',
    })),
  };
}

export function mapDeliveryNoteDtoToRecord(dto: any): DeliveryNoteRecord {
  const postingDate = dto.postingDate ? String(dto.postingDate).slice(0, 10) : new Date().toISOString().slice(0, 10);
  return {
    id: dto.id,
    customer: dto.customerName || dto.customerId || '',
    customerName: dto.customerName || '',
    status: mapDocStatusToDn(dto.status),
    date: postingDate,
    postingDate,
    postingTime: dto.postingTime || '00:00:00',
    grandTotal: Number(dto.grandTotal || 0),
    currency: dto.currency || 'AZN',
    perAmountBilled: Number(dto.perBilledPercent || 0),
    perReturned: dto.isReturn ? 100 : 0,
    company: 'Altensor',
    series: dto.deliveryNo || dto.id,
    setSourceWarehouse: dto.sourceWarehouseName || '',
    isReturn: Boolean(dto.isReturn),
    exchangeRate: Number(dto.exchangeRate || 1),
    netTotal: Number(dto.totalNetAmount || 0),
    createdOn: postingDate,
    lastUpdatedOn: postingDate,
    timeAgoText: formatTimeAgo(dto.postingDate),
    commentsCount: 0,
    isLiked: false,
    remarks: dto.remarks || '',
    items: (dto.lines || []).map((l: any, idx: number) => ({
      id: l.id || String(idx + 1),
      itemCode: l.itemCode || '',
      itemName: l.itemName || '',
      qty: Number(l.qty || 0),
      uom: l.uomName || 'Nos',
      rate: Number(l.sellingRate || 0),
      amount: Number(l.netSellingAmount || 0),
      warehouse: l.warehouseName || dto.sourceWarehouseName || '',
    })),
  };
}

export function mapMaterialRequestDtoToRecord(dto: any): MaterialRequestRecord {
  const txDate = dto.transactionDate ? String(dto.transactionDate).slice(0, 10) : new Date().toISOString().slice(0, 10);
  const reqBy = dto.requiredByDate ? String(dto.requiredByDate).slice(0, 10) : txDate;
  return {
    id: dto.id,
    title: dto.requestNo || dto.id,
    status: mapDocStatusToMr(dto.status),
    purpose: MR_PURPOSE_TO_UI[dto.requestType] || 'Purchase',
    transactionDate: txDate,
    requiredBy: reqBy,
    company: 'Altensor',
    series: dto.requestNo || '',
    setWarehouse: dto.setWarehouseName || '',
    createdOn: txDate,
    lastUpdatedOn: txDate,
    timeAgoText: formatTimeAgo(dto.transactionDate),
    commentsCount: 0,
    isLiked: false,
    items: (dto.lines || []).map((l: any, idx: number) => ({
      id: l.id || String(idx + 1),
      itemCode: l.itemCode || '',
      itemName: l.itemName || '',
      requiredBy: l.scheduleDate ? String(l.scheduleDate).slice(0, 10) : reqBy,
      qty: Number(l.qty || 0),
      warehouse: l.warehouseName || dto.setWarehouseName || '',
      uom: l.uomName || 'Nos',
      rate: Number(l.estimatedRate || 0),
      amount: Number(l.amount || 0),
    })),
  };
}

export function mapPickListDtoToRecord(dto: any): PickListRecord {
  return {
    id: dto.id,
    status: mapDocStatusToPick(dto.status),
    deliveryStatus: dto.status === 'Completed' ? 'Fully Delivered' : 'Not Delivered',
    company: 'Altensor',
    customer: dto.customerName || '',
    series: dto.pickListNo || dto.id,
    purpose: PICK_PURPOSE_TO_UI[dto.purpose] || 'Delivery',
    warehouse: dto.parentWarehouseName || '',
    considerRejectedWarehouses: Boolean(dto.considerRejectedWarehouses),
    createdOn: new Date().toISOString(),
    lastUpdatedOn: new Date().toISOString(),
    timeAgoText: 'Active',
    commentsCount: 0,
    isLiked: false,
    items: (dto.locations || []).map((l: any, idx: number) => ({
      id: l.id || String(idx + 1),
      item: l.itemCode || '',
      itemName: l.itemName || '',
      warehouse: l.warehouseName || '',
      qty: Number(l.requestedQty || 0),
      stockQty: Number(l.stockQty || 0),
      pickedQty: Number(l.pickedQty || 0),
      uom: l.uomName || 'Nos',
    })),
  };
}

export function mapStockReconciliationDtoToRecord(dto: any): StockReconciliationRecord {
  const postingDate = dto.postingDate ? String(dto.postingDate).slice(0, 10) : new Date().toISOString().slice(0, 10);
  return {
    id: dto.id,
    status: mapDocStatusToStockEntry(dto.status) as StockReconciliationStatus,
    series: dto.reconciliationNo || dto.id,
    company: 'Altensor',
    purpose: dto.purpose === 'OpeningStock' ? 'Opening Stock' : 'Stock Reconciliation',
    postingDate,
    postingTime: dto.postingTime || '00:00:00',
    defaultWarehouse: dto.defaultWarehouseName || '',
    differenceAccount: dto.expenseAccount || '6100',
    differenceAmount: Number(dto.totalDifferenceAmount || 0),
    costCenter: dto.costCenter || '',
    createdOn: postingDate,
    lastUpdatedOn: postingDate,
    timeAgoText: formatTimeAgo(dto.postingDate),
    commentsCount: 0,
    isLiked: false,
    items: (dto.lines || []).map((l: any, idx: number) => ({
      id: l.id || String(idx + 1),
      itemCode: l.itemCode || '',
      itemName: l.itemName || '',
      warehouse: l.warehouseName || '',
      qty: Number(l.reconciledQty ?? l.currentQty ?? 0),
      valuationRate: Number(l.reconciledValuationRate ?? l.currentValuationRate ?? 0),
      amount: Number(l.reconciledAmount ?? 0),
    })),
  };
}

export function mapLandedCostVoucherDtoToRecord(dto: any): LandedCostVoucherRecord {
  const postingDate = dto.postingDate ? String(dto.postingDate).slice(0, 10) : new Date().toISOString().slice(0, 10);
  return {
    id: dto.id,
    status: mapDocStatusToStockEntry(dto.status) as LandedCostVoucherStatus,
    series: dto.voucherNo || dto.id,
    company: 'Altensor',
    postingDate,
    distributeChargesBasedOn:
      dto.distributeChargesBasedOn === 'Qty' ? 'Qty' : 'Amount',
    vouchers: (dto.receiptDocuments || []).map((r: any, idx: number) => ({
      id: r.id || String(idx + 1),
      receiptDocumentType: r.receiptDocumentType === 'PurchaseInvoice' ? 'Purchase Invoice' : 'Purchase Receipt',
      receiptDocument: r.receiptDocumentNo || r.receiptDocumentId || '',
      supplier: String(r.supplierId || ''),
      grandTotal: Number(r.grandTotal || 0),
    })),
    items: (dto.itemAllocations || []).map((i: any, idx: number) => ({
      id: i.id || String(idx + 1),
      itemCode: i.itemCode || '',
      description: i.itemCode || '',
      qty: Number(i.qty || 0),
      amount: Number(i.originalAmount || 0),
      applicableCharges: Number(i.allocatedApplicableCharges || 0),
    })),
    vendorInvoices: [],
    landedCosts: (dto.taxesAndCharges || []).map((t: any, idx: number) => ({
      id: t.id || String(idx + 1),
      expenseAccount: t.expenseAccount || '',
      description: t.description || '',
      amount: Number(t.amount || 0),
    })),
    createdOn: postingDate,
    lastUpdatedOn: postingDate,
    timeAgoText: formatTimeAgo(dto.postingDate),
    commentsCount: 0,
    isLiked: false,
  };
}

export function mapRepostValuationDtoToRecord(dto: any): RepostItemValuationRecord {
  const statusMap: Record<string, RepostItemValuationStatus> = {
    Queued: 'Queued',
    InProgress: 'In Progress',
    Completed: 'Completed',
    Failed: 'Failed',
    Skipped: 'Cancelled',
  };
  const postingDate = dto.postingDate ? String(dto.postingDate).slice(0, 10) : new Date().toISOString().slice(0, 10);
  return {
    id: dto.id,
    status: statusMap[dto.status] || 'Queued',
    basedOn: dto.basedOn === 'Transaction' ? 'Transaction' : 'Item and Warehouse',
    voucherType: dto.voucherType || '',
    voucherNo: dto.voucherId || '',
    itemCode: dto.itemCode || '',
    warehouse: dto.warehouseName || '',
    postingDate,
    postingTime: dto.postingTime || '00:00:00',
    company: 'Altensor',
    allowNegativeStock: Boolean(dto.allowNegativeStock),
    viaLandedCostVoucher: Boolean(dto.viaLandedCostVoucher),
    noOfItemsToRepost: Number(dto.entriesProcessedCount || 0),
    createdOn: postingDate,
    lastUpdatedOn: postingDate,
    timeAgoText: formatTimeAgo(dto.postingDate),
    commentsCount: 0,
    isLiked: false,
  };
}

export function mapPackingSlipDtoToRecord(dto: any): PackingSlipRecord {
  return {
    id: dto.id,
    status: mapDocStatusToStockEntry(dto.status) as PackingSlipStatus,
    deliveryNote: dto.deliveryNoteNo || dto.deliveryNoteId || '',
    series: dto.slipNo || dto.id,
    fromPackageNo: Number(dto.fromPackageNo || 1),
    toPackageNo: Number(dto.toPackageNo || 1),
    netWeight: Number(dto.netWeightPkg || 0),
    grossWeight: Number(dto.grossWeightPkg || 0),
    items: (dto.lines || []).map((l: any, idx: number) => ({
      id: l.id || String(idx + 1),
      itemCode: l.itemCode || '',
      itemName: l.itemName || '',
      qty: Number(l.qty || 0),
      netWeight: Number(l.netWeight || 0),
    })),
    createdOn: new Date().toISOString(),
    lastUpdatedOn: new Date().toISOString(),
    timeAgoText: 'Active',
    commentsCount: 0,
    isLiked: false,
  };
}

export function mapMovementFromLedgerRow(row: any): StockMovement {
  const inQty = Number(row.inQty || 0);
  const outQty = Number(row.outQty || 0);
  const isIn = inQty > 0 && outQty === 0;
  const qty = isIn ? inQty : outQty || inQty;
  const rate = Number(row.valuationRate || row.incomingRate || row.outgoingRate || 0);
  return {
    id: row.id,
    documentNo: row.voucherNo || '',
    type: isIn ? 'IN' : 'OUT',
    productId: row.itemId,
    productName: row.itemName || '',
    productSku: row.itemCode || '',
    toWarehouseId: isIn ? row.warehouseId : undefined,
    toWarehouseName: isIn ? row.warehouseName : undefined,
    fromWarehouseId: !isIn ? row.warehouseId : undefined,
    fromWarehouseName: !isIn ? row.warehouseName : undefined,
    quantity: qty,
    unit: row.stockUomName || 'Nos',
    unitPrice: rate,
    totalPrice: Math.abs(Number(row.stockValueDifference || qty * rate)),
    date: row.postingDate || new Date().toISOString(),
    performedBy: row.voucherType || 'Stock',
    note: row.batchNo ? `Batch: ${row.batchNo}` : undefined,
    status: 'completed',
  };
}

export {
  STOCK_ENTRY_PURPOSE_TO_API,
  MR_PURPOSE_TO_API,
  PICK_PURPOSE_TO_API,
};

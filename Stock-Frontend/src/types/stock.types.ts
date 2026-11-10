export interface Warehouse {
  id: string;
  code: string;
  name: string;
  location: string;
  capacity: number; // e.g. capacity units or m2
  usedCapacity: number;
  managerName: string;
  contactPhone: string;
  status: 'active' | 'inactive' | 'full';
  totalProductsCount: number;
  totalStockValue: number;
  createdAt: string;
}

export type StockItemStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface StockProduct {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  description?: string;
  category: string;
  warehouseId: string;
  warehouseName: string;
  unit: string; // 'ədəd' | 'kq' | 'litr' | 'metr' | 'qutu'
  currentStock: number;
  minStock: number;
  maxStock: number;
  buyPrice: number;
  sellPrice: number;
  currency: string;
  supplierId?: string;
  supplierName?: string;
  status: StockItemStatus;
  updatedAt: string;
}

export interface StockCategory {
  id: string;
  name: string;
  description?: string;
  productCount: number;
}

export type MovementType = 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';

export interface StockMovement {
  id: string;
  documentNo: string;
  type: MovementType;
  productId: string;
  productName: string;
  productSku: string;
  fromWarehouseId?: string;
  fromWarehouseName?: string;
  toWarehouseId?: string;
  toWarehouseName?: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  totalPrice?: number;
  date: string;
  note?: string;
  performedBy: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  totalSuppliedCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface StockStats {
  totalProducts: number;
  totalWarehouses: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalInventoryValue: number;
  recentMovementsCount: number;
}

// Frappe / Altensor ERP Stock Entry Types
export type StockEntryType =
  | 'Material Receipt'
  | 'Material Issue'
  | 'Material Transfer'
  | 'Manufacture'
  | 'Repack';

export type StockEntryStatus = 'Draft' | 'Submitted' | 'Cancelled';

export interface StockEntryItem {
  id: string;
  itemCode: string;
  itemName: string;
  qty: number;
  uom: string;
  basicRate: number;
  amount: number;
}

export interface StockEntryRecord {
  id: string;
  title: string;
  stockEntryType: StockEntryType;
  status: StockEntryStatus;
  purpose: string;
  defaultSourceWarehouse?: string;
  defaultTargetWarehouse?: string;
  perTransferred: number;
  isReturn: boolean;
  company?: string;
  series?: string;
  supplierName?: string;
  createdOn: string;
  lastUpdatedOn: string;
  timeAgoText: string;
  commentsCount: number;
  isLiked?: boolean;
  items: StockEntryItem[];
  remarks?: string;
}

export type StockViewMode = 'list' | 'report' | 'dashboard' | 'kanban';

export interface FilterRule {
  id: string;
  field: string;
  operator: 'Equals' | 'Like' | 'In' | '!=';
  value: string;
}

// Frappe / Altensor ERP Purchase Receipt Types
export type PurchaseReceiptStatus = 'Draft' | 'To Bill' | 'Completed' | 'Cancelled';

export interface PurchaseReceiptItem {
  id: string;
  itemCode: string;
  itemName: string;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty?: number;
  uom: string;
  rate: number;
  amount: number;
  warehouse: string;
}

export interface PurchaseReceiptRecord {
  id: string;
  supplierName: string;
  status: PurchaseReceiptStatus;
  date: string;
  postingDate?: string;
  postingTime?: string;
  grandTotal: number;
  currency: string;
  perAmountBilled: number;
  perReturned: number;
  company: string;
  series: string;
  exchangeRate?: number;
  netTotal?: number;
  acceptedWarehouse?: string;
  rejectedWarehouse?: string;
  createdOn: string;
  lastUpdatedOn: string;
  timeAgoText: string;
  commentsCount: number;
  isLiked?: boolean;
  items: PurchaseReceiptItem[];
  remarks?: string;
}

// Frappe / Altensor ERP Delivery Note Types
export type DeliveryNoteStatus =
  | 'Draft'
  | 'To Bill'
  | 'Completed'
  | 'Return Issued'
  | 'Cancelled'
  | 'Closed';

export interface DeliveryNoteItem {
  id: string;
  itemCode: string;
  itemName: string;
  qty: number;
  uom: string;
  rate: number;
  amount: number;
  warehouse?: string;
  targetWarehouse?: string;
}

export interface DeliveryNoteRecord {
  id: string;
  customer: string;
  customerName: string;
  status: DeliveryNoteStatus;
  date: string;
  postingDate?: string;
  postingTime?: string;
  grandTotal: number;
  currency: string;
  perAmountBilled: number;
  perReturned: number;
  company: string;
  series: string;
  setTargetWarehouse?: string;
  setSourceWarehouse?: string;
  isReturn?: boolean;
  exchangeRate?: number;
  netTotal?: number;
  createdOn: string;
  lastUpdatedOn: string;
  timeAgoText: string;
  commentsCount: number;
  isLiked?: boolean;
  items: DeliveryNoteItem[];
  remarks?: string;
}

// ==========================================
// MATERIAL REQUEST TYPES (Frappe ERP / Material Request)
// ==========================================

export type MaterialRequestStatus =
  | 'Draft'
  | 'Submitted'
  | 'Stopped'
  | 'Cancelled'
  | 'Pending'
  | 'Partially Ordered'
  | 'Ordered'
  | 'Issued'
  | 'Transferred'
  | 'Received';

export type MaterialRequestPurpose =
  | 'Purchase'
  | 'Material Transfer'
  | 'Material Issue'
  | 'Manufacture'
  | 'Customer Provided';

export interface MaterialRequestItem {
  id: string;
  itemCode: string;
  itemName?: string;
  requiredBy: string;
  qty: number;
  warehouse: string;
  uom: string;
  rate?: number;
  amount?: number;
}

export interface MaterialRequestRecord {
  id: string;
  title: string;
  status: MaterialRequestStatus;
  purpose: MaterialRequestPurpose;
  transactionDate: string;
  requiredBy: string;
  company: string;
  series: string;
  priceList?: string;
  setWarehouse?: string;
  createdOn: string;
  lastUpdatedOn: string;
  timeAgoText: string;
  commentsCount: number;
  isLiked?: boolean;
  items: MaterialRequestItem[];
  terms?: string;
  termsContent?: string;
  letterHead?: string;
  printHeading?: string;
}

// ==========================================
// PICK LIST TYPES (Frappe ERP / Pick List)
// ==========================================

export type PickListStatus = 'Draft' | 'Open' | 'Completed' | 'Cancelled';

export type PickListDeliveryStatus =
  | 'Not Delivered'
  | 'Fully Delivered'
  | 'Partly Delivered'
  | 'Not Applicable';

export type PickListPurpose =
  | 'Material Transfer for Manufacture'
  | 'Material Transfer'
  | 'Delivery';

export interface PickListItemLocation {
  id: string;
  item: string;
  itemName?: string;
  warehouse: string;
  qty: number;
  stockQty: number;
  pickedQty: number;
  uom?: string;
}

export interface PickListRecord {
  id: string;
  status: PickListStatus;
  deliveryStatus?: PickListDeliveryStatus;
  company: string;
  customer: string;
  series: string;
  purpose: PickListPurpose;
  warehouse?: string;
  considerRejectedWarehouses?: boolean;
  pickManually?: boolean;
  ignorePricingRule?: boolean;
  scanMode?: boolean;
  promptQty?: boolean;
  groupSameItems?: boolean;
  workOrder?: string;
  createdOn: string;
  lastUpdatedOn: string;
  timeAgoText: string;
  commentsCount: number;
  isLiked?: boolean;
  items: PickListItemLocation[];
}

// ==========================================
// 8. STOCK RECONCILIATION TYPES (Frappe ERP 1:1)
// ==========================================
export type StockReconciliationStatus = 'Draft' | 'Submitted' | 'Cancelled';
export type StockReconciliationPurpose = 'Opening Stock' | 'Stock Reconciliation';

export interface StockReconciliationItem {
  id: string;
  itemCode: string;
  itemName?: string;
  warehouse: string;
  qty: number;
  stockUom?: string;
  valuationRate: number;
  amount?: number;
}

export interface StockReconciliationRecord {
  id: string;
  status: StockReconciliationStatus;
  series: string;
  company: string;
  purpose: StockReconciliationPurpose;
  postingDate: string;
  postingTime: string;
  editPostingDateTime?: boolean;
  defaultWarehouse?: string;
  scanBarcode?: string;
  scanMode?: boolean;
  differenceAccount?: string;
  differenceAmount?: number;
  costCenter?: string;
  createdOn: string;
  lastUpdatedOn: string;
  timeAgoText: string;
  commentsCount: number;
  isLiked?: boolean;
  items: StockReconciliationItem[];
}

// ==========================================
// 9. LANDED COST VOUCHER TYPES (Frappe ERP 1:1)
// ==========================================
export type LandedCostVoucherStatus = 'Draft' | 'Submitted' | 'Cancelled';
export type ReceiptDocumentType = 'Purchase Receipt' | 'Purchase Invoice';
export type DistributeChargesBasedOn = 'Qty' | 'Amount' | 'Distribute Manually';

export interface LandedCostVoucherReceipt {
  id: string;
  receiptDocumentType: ReceiptDocumentType;
  receiptDocument: string;
  supplier: string;
  grandTotal: number;
}

export interface LandedCostVoucherItem {
  id: string;
  itemCode: string;
  description: string;
  qty: number;
  amount: number;
  applicableCharges: number;
}

export interface LandedCostVendorInvoice {
  id: string;
  vendorInvoice: string;
  amount: number;
}

export interface LandedCostExpense {
  id: string;
  expenseAccount: string;
  description: string;
  amount: number;
}

export interface LandedCostVoucherRecord {
  id: string;
  status: LandedCostVoucherStatus;
  series: string;
  company: string;
  postingDate: string;
  vouchers: LandedCostVoucherReceipt[];
  items: LandedCostVoucherItem[];
  vendorInvoices: LandedCostVendorInvoice[];
  landedCosts: LandedCostExpense[];
  distributeChargesBasedOn: DistributeChargesBasedOn;
  createdOn: string;
  lastUpdatedOn: string;
  timeAgoText: string;
  commentsCount: number;
  isLiked?: boolean;
}

// ==========================================
// 10. REPOST ITEM VALUATION TYPES (Frappe ERP 1:1)
// ==========================================
export type RepostItemValuationStatus =
  | 'Queued'
  | 'In Progress'
  | 'Completed'
  | 'Failed'
  | 'Cancelled';

export type RepostBasedOn = 'Transaction' | 'Item and Warehouse';

export interface RepostItemValuationRecord {
  id: string;
  status: RepostItemValuationStatus;
  basedOn: RepostBasedOn;
  voucherType?: string;
  voucherNo?: string;
  itemCode?: string;
  warehouse?: string;
  postingDate?: string;
  postingTime?: string;
  company: string;
  repostOnlyAccountingLedgers?: boolean;
  allowNegativeStock?: boolean;
  viaLandedCostVoucher?: boolean;
  allowZeroRate?: boolean;
  recreateStockLedgers?: boolean;
  noOfItemsToRepost?: number;
  createdOn: string;
  lastUpdatedOn: string;
  timeAgoText: string;
  commentsCount: number;
  isLiked?: boolean;
}

// ==========================================
// 11. PACKING SLIP TYPES (Frappe ERP 1:1)
// ==========================================
export type PackingSlipStatus = 'Draft' | 'Submitted' | 'Cancelled';

export interface PackingSlipItem {
  id: string;
  itemCode: string;
  itemName: string;
  qty: number;
  netWeight: number;
  pageBreak?: boolean;
}

export interface PackingSlipRecord {
  id: string;
  status: PackingSlipStatus;
  deliveryNote: string;
  series: string;
  fromPackageNo: number;
  toPackageNo: number;
  items: PackingSlipItem[];
  netWeight: number;
  grossWeight: number;
  grossWeightUom?: string;
  letterHead?: string;
  createdOn: string;
  lastUpdatedOn: string;
  timeAgoText: string;
  commentsCount: number;
  isLiked?: boolean;
}

// ==========================================
// 12. ITEM TYPES (Frappe ERP 1:1)
// ==========================================
export type ItemStatus = 'Enabled' | 'Disabled';

export interface ItemRecord {
  id: string;
  itemCode: string;
  itemName: string;
  status: ItemStatus;
  itemGroup: string;
  uom: string;
  itemType: string;
  purpose: string;
  maintainStock: boolean;
  isFixedAsset: boolean;
  hasVariants?: boolean;
  variantOf?: string;
  createdOn: string;
  lastUpdatedOn: string;
  timeAgoText: string;
  commentsCount: number;
  isLiked?: boolean;
}

// ==========================================
// 13. ITEM GROUP TYPES (Frappe ERP 1:1)
// ==========================================
export interface ItemGroupDefaultRow {
  id: string;
  company: string;
  defaultWarehouse?: string;
  defaultPriceList?: string;
}

export interface ItemGroupTaxRow {
  id: string;
  itemTaxTemplate: string;
  taxCategory?: string;
  validFrom?: string;
  minNetRate?: number | string;
  maxNetRate?: number | string;
}

export interface ItemGroupRecord {
  id: string;
  itemGroupName: string;
  parentItemGroup?: string;
  isGroup: boolean;
  timeAgoText: string;
  commentsCount: number;
  isLiked?: boolean;
  defaults?: ItemGroupDefaultRow[];
  taxes?: ItemGroupTaxRow[];
  createdOn?: string;
  lastUpdatedOn?: string;
}

// ==========================================
// 14. ITEM ATTRIBUTE TYPES (Frappe ERP 1:1)
// ==========================================
export interface ItemAttributeValueRow {
  id: string;
  attributeValue: string;
  abbreviation: string;
}

export interface ItemAttributeRecord {
  id: string;
  attributeName: string;
  status: 'Enabled' | 'Disabled';
  disabled?: boolean;
  numericValues?: boolean;
  values?: ItemAttributeValueRow[];
  timeAgoText: string;
  commentsCount: number;
  isLiked?: boolean;
  createdOn?: string;
  lastUpdatedOn?: string;
}

// ==========================================
// 15. BRAND TYPES (Frappe ERP 1:1)
// ==========================================
export interface BrandDefaultRow {
  id: string;
  company: string;
  defaultWarehouse?: string;
  defaultPriceList?: string;
}

export interface BrandRecord {
  id: string;
  brandName: string;
  description?: string;
  defaults?: BrandDefaultRow[];
  timeAgoText: string;
  commentsCount: number;
  isLiked?: boolean;
  createdOn?: string;
  lastUpdatedOn?: string;
}

export interface WarehouseRecord {
  id: string;
  warehouseName: string;
  status: 'Enabled' | 'Disabled';
  company: string;
  account?: string;
  isGroupWarehouse?: boolean;
  isRejectedWarehouse?: boolean;
  parentWarehouse?: string;
  customer?: string;
  phoneNo?: string;
  mobileNo?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  pin?: string;
  warehouseType?: string;
  defaultInTransitWarehouse?: string;
  isLiked?: boolean;
  createdOn?: string;
  commentsCount?: number;
  lastEdited?: string;
  createdBy?: string;
}

export interface UOMRecord {
  id: string;
  uomName: string;
  status: 'Enabled' | 'Disabled';
  category?: string;
  symbol?: string;
  commonCode?: string;
  description?: string;
  mustBeWholeNumber?: boolean;
  enabled?: boolean;
  isLiked?: boolean;
  createdOn?: string;
  commentsCount?: number;
  lastEdited?: string;
  createdBy?: string;
}

export interface UOMConversionFactorRecord {
  id: string; // e.g. "MAT-UOM-CNV-00235"
  category: string; // e.g. "Mass"
  fromUOM: string; // e.g. "Gram"
  toUOM: string; // e.g. "Ounce"
  value: string; // e.g. "0.035274000"
  isLiked?: boolean;
  createdOn?: string;
  commentsCount?: number;
  lastEdited?: string;
  createdBy?: string;
}

export interface SerialNoRecord {
  id: string;
  serialNo: string;
  itemCode: string;
  status: 'Active' | 'Delivered' | 'Expired';
  warehouse?: string;
  company: string;
  warrantyExpiryDate?: string;
  amcExpiryDate?: string;
  workOrder?: string;
  isLiked?: boolean;
  createdOn?: string;
  commentsCount?: number;
  lastEdited?: string;
  createdBy?: string;
}

export interface BatchRecord {
  id: string;
  batchId: string;
  item: string;
  manufacturingDate?: string;
  batchUOM?: string;
  expiryDate?: string;
  useBatchWiseValuation?: boolean;
  allowNegativeStock?: boolean;
  description?: string;
  status?: 'Active' | 'Expired' | 'Disabled';
  isLiked?: boolean;
  createdOn?: string;
  commentsCount?: number;
  lastEdited?: string;
  createdBy?: string;
}

export interface SerialAndBatchBundleItem {
  id: string;
  serialNo?: string;
  batchNo?: string;
  qty: number;
  warehouse?: string;
}

export interface SerialAndBatchBundleRecord {
  id: string;
  namingSeries: string;
  company: string;
  hasSerialNo?: boolean;
  hasBatchNo?: boolean;
  itemCode: string;
  warehouse: string;
  typeOfTransaction: 'Inward' | 'Outward' | 'Maintenance';
  items: SerialAndBatchBundleItem[];
  voucherType?: string;
  voucherNo?: string;
  isCancelled?: boolean;
  isPacked?: boolean;
  postingDatetime?: string;
  status?: 'Draft' | 'Submitted' | 'Cancelled';
  isLiked?: boolean;
  createdOn?: string;
  commentsCount?: number;
  lastEdited?: string;
  createdBy?: string;
}

// ==========================================
// 20. INVENTORY DIMENSION TYPES (Frappe ERP 1:1)
// ==========================================
export interface InventoryDimensionRecord {
  id: string;
  dimensionName: string;
  referenceDocument: string;
  applyToAllInventoryDocuments: boolean;
  validateNegativeStock: boolean;
  fetchValueFrom?: string;
  mandatory: boolean;
  mandatoryDependsOn?: string;
  createdOn?: string;
  lastEdited?: string;
  createdBy?: string;
  commentsCount?: number;
  isLiked?: boolean;
}

// ==========================================
// 21. SHIPPING RULE TYPES (Frappe ERP 1:1)
// ==========================================
export type ShippingRuleType = 'Selling' | 'Buying';
export type ShippingCalculateBasedOn = 'Fixed' | 'Net Total' | 'Net Weight';

export interface ShippingRuleCountry {
  id: string;
  country: string;
}

export interface ShippingRuleRecord {
  id: string;
  shippingRuleLabel: string;
  shippingRuleType: ShippingRuleType;
  disabled: boolean;
  company: string;
  shippingAccount: string;
  calculateBasedOn: ShippingCalculateBasedOn;
  shippingAmount: number;
  countries: ShippingRuleCountry[];
  status?: 'Active' | 'Disabled';
  createdOn?: string;
  lastEdited?: string;
  createdBy?: string;
  commentsCount?: number;
  isLiked?: boolean;
}

// ==========================================
// 22. ITEM ALTERNATIVE TYPES (Frappe ERP 1:1)
// ==========================================
export interface ItemAlternativeRecord {
  id: string;
  itemCode: string;
  alternativeItemCode: string;
  twoWay: boolean;
  createdOn?: string;
  lastEdited?: string;
  createdBy?: string;
  commentsCount?: number;
  isLiked?: boolean;
}

// ==========================================
// 23. DELIVERY TRIP TYPES (Frappe ERP 1:1)
// ==========================================
export type DeliveryTripStatus = 'Draft' | 'In Transit' | 'Completed' | 'Cancelled';

export interface DeliveryStopItem {
  id: string;
  customer: string;
  addressName: string;
  locked: boolean;
  deliveryNote: string;
  estimatedArrival: string;
}

export interface DeliveryTripRecord {
  id: string;
  series: string;
  company: string;
  initialEmailNotificationSent: boolean;
  driver: string;
  vehicle: string;
  driverAddress: string;
  departureTime: string;
  status: DeliveryTripStatus;
  deliveryStops: DeliveryStopItem[];
  createdOn?: string;
  lastEdited?: string;
  createdBy?: string;
  commentsCount?: number;
  isLiked?: boolean;
}

// ==========================================
// 24. QUALITY INSPECTION TEMPLATE TYPES (Frappe ERP 1:1)
// ==========================================
export interface QualityInspectionParameterItem {
  id: string;
  parameter: string;
  acceptanceCriteria?: string;
  numeric: boolean;
  minValue?: number;
  maxValue?: number;
}

export interface QualityInspectionTemplateRecord {
  id: string;
  templateName: string;
  parameters: QualityInspectionParameterItem[];
  createdOn?: string;
  lastEdited?: string;
  createdBy?: string;
  commentsCount?: number;
  isLiked?: boolean;
}




















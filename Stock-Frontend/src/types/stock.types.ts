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




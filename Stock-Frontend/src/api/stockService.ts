import { axiosClient } from './axiosClient';
import type {
  Warehouse,
  StockProduct,
  StockMovement,
  Supplier,
  StockStats,
  StockCategory,
} from '../types';

// Initial starter mock data for immediate UI rendering and testing
export const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-1',
    code: 'WH-01',
    name: 'Mərkəzi Baş Anbar',
    location: 'Bakı ş., Nərimanov r-nu, Əhməd Rəcəbli küç. 25',
    capacity: 5000,
    usedCapacity: 3820,
    managerName: 'Rəşad Əliyev',
    contactPhone: '+994 50 234 56 78',
    status: 'active',
    totalProductsCount: 142,
    totalStockValue: 185420.5,
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'wh-2',
    code: 'WH-02',
    name: 'Sumqayıt Logistika Mərkəzi',
    location: 'Sumqayıt ş., Sülh küç. 44',
    capacity: 3500,
    usedCapacity: 1200,
    managerName: 'Kənan Məmmədov',
    contactPhone: '+994 55 987 65 43',
    status: 'active',
    totalProductsCount: 68,
    totalStockValue: 74210.0,
    createdAt: '2026-03-01T09:00:00Z',
  },
  {
    id: 'wh-3',
    code: 'WH-03',
    name: 'Gəncə Regional Anbarı',
    location: 'Gəncə ş., H. Əliyev pr. 102',
    capacity: 2000,
    usedCapacity: 1850,
    managerName: 'Samir Quliyev',
    contactPhone: '+994 70 345 12 90',
    status: 'active',
    totalProductsCount: 45,
    totalStockValue: 39150.0,
    createdAt: '2026-04-10T11:30:00Z',
  },
];

export const INITIAL_PRODUCTS: StockProduct[] = [
  {
    id: 'prod-1',
    sku: 'STK-ELC-001',
    barcode: '4760012345678',
    name: 'Dell UltraSharp 27" 4K Monitor',
    category: 'Elektronika',
    warehouseId: 'wh-1',
    warehouseName: 'Mərkəzi Baş Anbar',
    unit: 'ədəd',
    currentStock: 24,
    minStock: 10,
    maxStock: 50,
    buyPrice: 850,
    sellPrice: 1150,
    currency: '₼',
    status: 'in_stock',
    updatedAt: '2026-11-01T14:20:00Z',
  },
  {
    id: 'prod-2',
    sku: 'STK-ELC-002',
    barcode: '4760012345679',
    name: 'Logitech MX Master 3S Siçan',
    category: 'Aksesuarlar',
    warehouseId: 'wh-1',
    warehouseName: 'Mərkəzi Baş Anbar',
    unit: 'ədəd',
    currentStock: 4,
    minStock: 15,
    maxStock: 80,
    buyPrice: 170,
    sellPrice: 240,
    currency: '₼',
    status: 'low_stock',
    updatedAt: '2026-11-01T12:00:00Z',
  },
  {
    id: 'prod-3',
    sku: 'STK-FUR-001',
    barcode: '4760012345680',
    name: 'Ergonomik Ofis Kreslosu Premium',
    category: 'Mebel',
    warehouseId: 'wh-2',
    warehouseName: 'Sumqayıt Logistika Mərkəzi',
    unit: 'ədəd',
    currentStock: 0,
    minStock: 5,
    maxStock: 30,
    buyPrice: 320,
    sellPrice: 480,
    currency: '₼',
    status: 'out_of_stock',
    updatedAt: '2026-10-30T17:45:00Z',
  },
  {
    id: 'prod-4',
    sku: 'STK-OFF-001',
    barcode: '4760012345681',
    name: 'A4 Kağız Double A (80 qr, 500 vərəq)',
    category: 'Dəftərxana',
    warehouseId: 'wh-1',
    warehouseName: 'Mərkəzi Baş Anbar',
    unit: 'qutu',
    currentStock: 180,
    minStock: 50,
    maxStock: 400,
    buyPrice: 7.5,
    sellPrice: 11,
    currency: '₼',
    status: 'in_stock',
    updatedAt: '2026-11-01T15:10:00Z',
  },
];

export const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-1',
    documentNo: 'DOC-2026-0042',
    type: 'IN',
    productId: 'prod-1',
    productName: 'Dell UltraSharp 27" 4K Monitor',
    productSku: 'STK-ELC-001',
    toWarehouseId: 'wh-1',
    toWarehouseName: 'Mərkəzi Baş Anbar',
    quantity: 15,
    unit: 'ədəd',
    unitPrice: 850,
    totalPrice: 12750,
    date: '2026-11-01T10:15:00Z',
    performedBy: 'Rəşad Əliyev',
    note: 'Təchizatçıdan yeni partiya qəbul edildi',
    status: 'completed',
  },
  {
    id: 'mov-2',
    documentNo: 'DOC-2026-0041',
    type: 'OUT',
    productId: 'prod-2',
    productName: 'Logitech MX Master 3S Siçan',
    productSku: 'STK-ELC-002',
    fromWarehouseId: 'wh-1',
    fromWarehouseName: 'Mərkəzi Baş Anbar',
    quantity: 6,
    unit: 'ədəd',
    unitPrice: 240,
    totalPrice: 1440,
    date: '2026-10-31T16:30:00Z',
    performedBy: 'Aysel Həsənova',
    note: 'Satış sifarişi #ORD-889 üzrə çıxış',
    status: 'completed',
  },
  {
    id: 'mov-3',
    documentNo: 'DOC-2026-0040',
    type: 'TRANSFER',
    productId: 'prod-4',
    productName: 'A4 Kağız Double A (80 qr, 500 vərəq)',
    productSku: 'STK-OFF-001',
    fromWarehouseId: 'wh-1',
    fromWarehouseName: 'Mərkəzi Baş Anbar',
    toWarehouseId: 'wh-3',
    toWarehouseName: 'Gəncə Regional Anbarı',
    quantity: 40,
    unit: 'qutu',
    date: '2026-10-30T11:00:00Z',
    performedBy: 'Kənan Məmmədov',
    note: 'Filial anbarına daxili yerdəyişmə',
    status: 'completed',
  },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    code: 'SUP-001',
    name: 'Tech Distribution LLC',
    contactPerson: 'Fərid Nəzərov',
    email: 'info@techdistribution.az',
    phone: '+994 12 400 11 22',
    address: 'Bakı ş., Tbilisi pr. 49',
    totalSuppliedCount: 28,
    status: 'active',
    createdAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'sup-2',
    code: 'SUP-002',
    name: 'Office Pro Supply MMC',
    contactPerson: 'Leyla Əhmədova',
    email: 'sales@officepro.az',
    phone: '+994 12 555 88 99',
    address: 'Bakı ş., Babək pr. 10',
    totalSuppliedCount: 15,
    status: 'active',
    createdAt: '2026-02-14T14:00:00Z',
  },
];

export const stockService = {
  // Warehouses
  async getWarehouses(): Promise<Warehouse[]> {
    try {
      const res = await axiosClient.get<Warehouse[]>('/warehouses');
      return res.data;
    } catch {
      return INITIAL_WAREHOUSES;
    }
  },

  async createWarehouse(warehouse: Partial<Warehouse>): Promise<Warehouse> {
    try {
      const res = await axiosClient.post<Warehouse>('/warehouses', warehouse);
      return res.data;
    } catch {
      const created: Warehouse = {
        id: `wh-${Date.now()}`,
        code: warehouse.code || `WH-${Math.floor(10 + Math.random() * 90)}`,
        name: warehouse.name || 'Yeni Anbar',
        location: warehouse.location || '',
        capacity: warehouse.capacity || 1000,
        usedCapacity: 0,
        managerName: warehouse.managerName || 'Cavabdeh Təyin Edilməyib',
        contactPhone: warehouse.contactPhone || '',
        status: warehouse.status || 'active',
        totalProductsCount: 0,
        totalStockValue: 0,
        createdAt: new Date().toISOString(),
      };
      return created;
    }
  },

  // Products / Inventory
  async getProducts(): Promise<StockProduct[]> {
    try {
      const res = await axiosClient.get<StockProduct[]>('/products');
      return res.data;
    } catch {
      return INITIAL_PRODUCTS;
    }
  },

  async createProduct(product: Partial<StockProduct>): Promise<StockProduct> {
    try {
      const res = await axiosClient.post<StockProduct>('/products', product);
      return res.data;
    } catch {
      const currentStock = product.currentStock || 0;
      const minStock = product.minStock || 5;
      let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
      if (currentStock === 0) status = 'out_of_stock';
      else if (currentStock <= minStock) status = 'low_stock';

      const created: StockProduct = {
        id: `prod-${Date.now()}`,
        sku: product.sku || `STK-${Math.floor(1000 + Math.random() * 9000)}`,
        barcode: product.barcode || `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
        name: product.name || 'Yeni Məhsul',
        category: product.category || 'Ümumi',
        warehouseId: product.warehouseId || 'wh-1',
        warehouseName: product.warehouseName || 'Mərkəzi Baş Anbar',
        unit: product.unit || 'ədəd',
        currentStock,
        minStock,
        maxStock: product.maxStock || 100,
        buyPrice: product.buyPrice || 0,
        sellPrice: product.sellPrice || 0,
        currency: '₼',
        status,
        updatedAt: new Date().toISOString(),
      };
      return created;
    }
  },

  // Stock Movements
  async getMovements(): Promise<StockMovement[]> {
    try {
      const res = await axiosClient.get<StockMovement[]>('/movements');
      return res.data;
    } catch {
      return INITIAL_MOVEMENTS;
    }
  },

  async createMovement(movement: Partial<StockMovement>): Promise<StockMovement> {
    try {
      const res = await axiosClient.post<StockMovement>('/movements', movement);
      return res.data;
    } catch {
      const created: StockMovement = {
        id: `mov-${Date.now()}`,
        documentNo: movement.documentNo || `DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        type: movement.type || 'IN',
        productId: movement.productId || '',
        productName: movement.productName || '',
        productSku: movement.productSku || '',
        fromWarehouseId: movement.fromWarehouseId,
        fromWarehouseName: movement.fromWarehouseName,
        toWarehouseId: movement.toWarehouseId,
        toWarehouseName: movement.toWarehouseName,
        quantity: movement.quantity || 1,
        unit: movement.unit || 'ədəd',
        unitPrice: movement.unitPrice || 0,
        totalPrice: (movement.quantity || 1) * (movement.unitPrice || 0),
        date: new Date().toISOString(),
        performedBy: movement.performedBy || 'İstifadəçi',
        note: movement.note || '',
        status: 'completed',
      };
      return created;
    }
  },

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    try {
      const res = await axiosClient.get<Supplier[]>('/suppliers');
      return res.data;
    } catch {
      return INITIAL_SUPPLIERS;
    }
  },

  // Stats
  async getStats(): Promise<StockStats> {
    try {
      const res = await axiosClient.get<StockStats>('/stats');
      return res.data;
    } catch {
      return {
        totalProducts: 255,
        totalWarehouses: 3,
        lowStockCount: 12,
        outOfStockCount: 4,
        totalInventoryValue: 298780.5,
        recentMovementsCount: 38,
      };
    }
  },

  // Stock Entries (Frappe ERP / Stock Entry)
  async getStockEntries(): Promise<import('../types').StockEntryRecord[]> {
    try {
      const res = await axiosClient.get<import('../types').StockEntryRecord[]>('/stock-entries');
      return res.data;
    } catch {
      return INITIAL_STOCK_ENTRIES;
    }
  },

  async createStockEntry(entry: Partial<import('../types').StockEntryRecord>): Promise<import('../types').StockEntryRecord> {
    try {
      const res = await axiosClient.post<import('../types').StockEntryRecord>('/stock-entries', entry);
      return res.data;
    } catch {
      const newEntry: import('../types').StockEntryRecord = {
        id: `STE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`,
        title: entry.stockEntryType || 'Material Receipt',
        stockEntryType: entry.stockEntryType || 'Material Receipt',
        status: entry.status || 'Draft',
        purpose: entry.purpose || entry.stockEntryType || 'Material Receipt',
        defaultSourceWarehouse: entry.defaultSourceWarehouse || '',
        defaultTargetWarehouse: entry.defaultTargetWarehouse || 'Devam Eden İşler - AD',
        perTransferred: entry.perTransferred || 0,
        isReturn: !!entry.isReturn,
        company: 'Altensor ERP',
        series: 'STE-.YYYY.-',
        supplierName: entry.supplierName || 'Global Tech Supplies',
        createdOn: new Date().toISOString(),
        lastUpdatedOn: new Date().toISOString(),
        timeAgoText: 'now',
        commentsCount: 0,
        isLiked: false,
        items: entry.items || [
          {
            id: 'item-1',
            itemCode: 'SKU-001',
            itemName: 'Demo Item Group Raw Component',
            qty: 10,
            uom: 'Nos',
            basicRate: 250,
            amount: 2500,
          },
        ],
        remarks: entry.remarks || 'Standard stock entry creation',
      };
      return newEntry;
    }
  },
};

export const INITIAL_STOCK_ENTRIES: import('../types').StockEntryRecord[] = [
  {
    id: 'MAT-STE-2026-00001',
    title: 'Material Receipt',
    stockEntryType: 'Material Receipt',
    status: 'Draft',
    purpose: 'Material Receipt',
    defaultSourceWarehouse: '',
    defaultTargetWarehouse: 'Devam Eden İşler - AD',
    perTransferred: 0,
    isReturn: false,
    company: 'Altensor ERP Corp',
    series: 'MAT-STE-.YYYY.-',
    supplierName: 'AzLogistics MMC',
    createdOn: new Date().toISOString(),
    lastUpdatedOn: new Date().toISOString(),
    timeAgoText: 'now',
    commentsCount: 0,
    isLiked: false,
    items: [
      {
        id: 'ite-1',
        itemCode: 'SKU-001',
        itemName: 'Demo Item Group Component',
        qty: 25,
        uom: 'Nos',
        basicRate: 120,
        amount: 3000,
      },
    ],
    remarks: 'Material receipt for ongoing production batches',
  },
  {
    id: 'MAT-STE-2026-00002',
    title: 'Material Transfer',
    stockEntryType: 'Material Transfer',
    status: 'Submitted',
    purpose: 'Material Transfer',
    defaultSourceWarehouse: 'Sumqayıt Logistika Mərkəzi',
    defaultTargetWarehouse: 'Mərkəzi Baş Anbar',
    perTransferred: 100,
    isReturn: false,
    company: 'Altensor ERP Corp',
    series: 'MAT-STE-.YYYY.-',
    supplierName: 'Baku Express',
    createdOn: new Date(Date.now() - 3600000 * 4).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 3600000 * 2).toISOString(),
    timeAgoText: '4 hours ago',
    commentsCount: 2,
    isLiked: true,
    items: [
      {
        id: 'ite-2',
        itemCode: 'SKU-002',
        itemName: 'Industrial Servo Motor X12',
        qty: 8,
        uom: 'Set',
        basicRate: 650,
        amount: 5200,
      },
    ],
    remarks: 'Inter-warehouse standard replenishment',
  },
  {
    id: 'MAT-STE-2026-00003',
    title: 'Material Issue',
    stockEntryType: 'Material Issue',
    status: 'Submitted',
    purpose: 'Material Issue',
    defaultSourceWarehouse: 'Mərkəzi Baş Anbar',
    defaultTargetWarehouse: '',
    perTransferred: 100,
    isReturn: false,
    company: 'Altensor ERP Corp',
    series: 'MAT-STE-.YYYY.-',
    supplierName: 'Internal Maintenance',
    createdOn: new Date(Date.now() - 3600000 * 26).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 3600000 * 20).toISOString(),
    timeAgoText: '1 day ago',
    commentsCount: 1,
    isLiked: false,
    items: [
      {
        id: 'ite-3',
        itemCode: 'SKU-004',
        itemName: 'Hydraulic Valve Pack',
        qty: 4,
        uom: 'Nos',
        basicRate: 420,
        amount: 1680,
      },
    ],
    remarks: 'Issued for scheduled plant maintenance',
  },
];



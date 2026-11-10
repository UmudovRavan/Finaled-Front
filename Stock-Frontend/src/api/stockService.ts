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

  // Purchase Receipts (Frappe ERP / Purchase Receipt)
  async getPurchaseReceipts(): Promise<import('../types').PurchaseReceiptRecord[]> {
    try {
      const res = await axiosClient.get<import('../types').PurchaseReceiptRecord[]>('/purchase-receipts');
      return res.data;
    } catch {
      return INITIAL_PURCHASE_RECEIPTS;
    }
  },

  async createPurchaseReceipt(entry: Partial<import('../types').PurchaseReceiptRecord>): Promise<import('../types').PurchaseReceiptRecord> {
    try {
      const res = await axiosClient.post<import('../types').PurchaseReceiptRecord[]>('/purchase-receipts', entry);
      return res.data as any;
    } catch {
      const newEntry: import('../types').PurchaseReceiptRecord = {
        id: `MAT-PR-RE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`,
        supplierName: entry.supplierName || 'Summit Traders Ltd.',
        status: entry.status || 'Draft',
        date: entry.date || '03-11-2026',
        postingTime: entry.postingTime || '22:15:00',
        grandTotal: entry.grandTotal || 396.0,
        currency: entry.currency || 'USD',
        perAmountBilled: entry.perAmountBilled || 0,
        perReturned: entry.perReturned || 0,
        company: entry.company || 'Avalon (Demo)',
        series: entry.series || 'MAT-PR-RE-.YYYY.-',
        acceptedWarehouse: entry.acceptedWarehouse || 'Devam Eden İşler - AD',
        createdOn: new Date().toISOString(),
        lastUpdatedOn: new Date().toISOString(),
        timeAgoText: 'now',
        commentsCount: 0,
        isLiked: false,
        items: entry.items || [
          {
            id: 'item-pr-1',
            itemCode: 'SKU002: Laptop',
            itemName: 'High Performance Business Laptop',
            receivedQty: 10,
            acceptedQty: 10,
            rejectedQty: 0,
            uom: 'Nos',
            rate: 39.6,
            amount: 396.0,
            warehouse: 'Devam Eden İşler - AD',
          },
        ],
        remarks: entry.remarks || 'Standard purchase receipt creation',
      };
      return newEntry;
    }
  },

  // Delivery Notes (Frappe ERP / Delivery Note)
  async getDeliveryNotes(): Promise<import('../types').DeliveryNoteRecord[]> {
    try {
      const res = await axiosClient.get<import('../types').DeliveryNoteRecord[]>('/delivery-notes');
      return res.data;
    } catch {
      return INITIAL_DELIVERY_NOTES;
    }
  },

  async createDeliveryNote(entry: Partial<import('../types').DeliveryNoteRecord>): Promise<import('../types').DeliveryNoteRecord> {
    try {
      const res = await axiosClient.post<import('../types').DeliveryNoteRecord>('/delivery-notes', entry);
      return res.data;
    } catch {
      const newEntry: import('../types').DeliveryNoteRecord = {
        id: `MAT-DN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`,
        customer: entry.customer || entry.customerName || 'Grant Plastics Ltd.',
        customerName: entry.customerName || entry.customer || 'Grant Plastics Ltd.',
        status: entry.status || 'Draft',
        date: entry.date || '09-11-2026',
        postingTime: entry.postingTime || '14:54:00',
        grandTotal: entry.grandTotal ?? 0.0,
        currency: entry.currency || 'USD',
        perAmountBilled: entry.perAmountBilled || 0,
        perReturned: entry.perReturned || 0,
        company: entry.company || 'Avalon (Demo)',
        series: entry.series || 'MAT-DN-.YYYY.-',
        setTargetWarehouse: entry.setTargetWarehouse || '',
        setSourceWarehouse: entry.setSourceWarehouse || 'Stores - AD',
        isReturn: !!entry.isReturn,
        createdOn: new Date().toISOString(),
        lastUpdatedOn: new Date().toISOString(),
        timeAgoText: 'now',
        commentsCount: 0,
        isLiked: false,
        items: entry.items || [
          {
            id: 'item-dn-1',
            itemCode: 'SKU002: Laptop',
            itemName: 'High Performance Business Laptop',
            qty: 1,
            uom: 'Nos',
            rate: 0.0,
            amount: 0.0,
            warehouse: 'Stores - AD',
          },
        ],
        remarks: entry.remarks || 'Standard delivery note creation',
      };
      return newEntry;
    }
  },

  // Material Requests (Frappe ERP / Material Request)
  async getMaterialRequests(): Promise<import('../types').MaterialRequestRecord[]> {
    try {
      const res = await axiosClient.get<import('../types').MaterialRequestRecord[]>('/material-requests');
      return res.data;
    } catch {
      return INITIAL_MATERIAL_REQUESTS;
    }
  },

  async createMaterialRequest(entry: Partial<import('../types').MaterialRequestRecord>): Promise<import('../types').MaterialRequestRecord> {
    try {
      const res = await axiosClient.post<import('../types').MaterialRequestRecord>('/material-requests', entry);
      return res.data;
    } catch {
      const newEntry: import('../types').MaterialRequestRecord = {
        id: `MAT-MR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`,
        title: entry.title || `${entry.purpose || 'Purchase'} Request`,
        status: entry.status || 'Draft',
        purpose: entry.purpose || 'Purchase',
        transactionDate: entry.transactionDate || '09-11-2026',
        requiredBy: entry.requiredBy || '13-11-2026',
        company: entry.company || 'Avalon (Demo)',
        series: entry.series || 'MAT-MR-.YYYY.-',
        priceList: entry.priceList || 'Standard Buying',
        setWarehouse: entry.setWarehouse || '',
        createdOn: new Date().toISOString(),
        lastUpdatedOn: new Date().toISOString(),
        timeAgoText: 'now',
        commentsCount: 0,
        isLiked: false,
        items: entry.items || [
          {
            id: 'it-mr-1',
            itemCode: 'SKU002: Laptop',
            itemName: 'SKU002: Laptop',
            requiredBy: entry.requiredBy || '13-11-2026',
            qty: 1,
            warehouse: 'Bitmiş Ürünler - AD',
            uom: 'Nos',
          },
        ],
        terms: entry.terms || '',
        termsContent: entry.termsContent || '',
        letterHead: entry.letterHead || 'Company Letterhead - Grey',
        printHeading: entry.printHeading || '',
      };
      return newEntry;
    }
  },

  // Pick Lists (Frappe ERP / Pick List)
  async getPickLists(): Promise<import('../types').PickListRecord[]> {
    try {
      const res = await axiosClient.get<import('../types').PickListRecord[]>('/pick-lists');
      return res.data;
    } catch {
      return INITIAL_PICK_LISTS;
    }
  },

  async createPickList(entry: Partial<import('../types').PickListRecord>): Promise<import('../types').PickListRecord> {
    try {
      const res = await axiosClient.post<import('../types').PickListRecord>('/pick-lists', entry);
      return res.data;
    } catch {
      const newEntry: import('../types').PickListRecord = {
        id: `STO-PICK-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`,
        status: entry.status || 'Draft',
        deliveryStatus: entry.deliveryStatus || 'Not Delivered',
        company: entry.company || 'Avalon (Demo)',
        customer: entry.customer || 'Palmer Productions Ltd.',
        series: entry.series || 'STO-PICK-.YYYY.-',
        purpose: entry.purpose || 'Material Transfer for Manufacture',
        warehouse: entry.warehouse || '',
        considerRejectedWarehouses: !!entry.considerRejectedWarehouses,
        pickManually: !!entry.pickManually,
        ignorePricingRule: !!entry.ignorePricingRule,
        scanMode: !!entry.scanMode,
        promptQty: !!entry.promptQty,
        groupSameItems: !!entry.groupSameItems,
        workOrder: entry.workOrder || '',
        createdOn: new Date().toISOString(),
        lastUpdatedOn: new Date().toISOString(),
        timeAgoText: '1 m',
        commentsCount: 0,
        isLiked: false,
        items: entry.items || [],
      };
      return newEntry;
    }
  },

  // Stock Reconciliation (Frappe ERP / Stock Reconciliation)
  async getStockReconciliations(): Promise<import('../types').StockReconciliationRecord[]> {
    try {
      const res = await axiosClient.get<import('../types').StockReconciliationRecord[]>('/stock-reconciliations');
      return res.data;
    } catch {
      return INITIAL_STOCK_RECONCILIATIONS;
    }
  },

  async createStockReconciliation(entry: Partial<import('../types').StockReconciliationRecord>): Promise<import('../types').StockReconciliationRecord> {
    try {
      const res = await axiosClient.post<import('../types').StockReconciliationRecord>('/stock-reconciliations', entry);
      return res.data;
    } catch {
      const newEntry: import('../types').StockReconciliationRecord = {
        id: `MAT-RECO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`,
        status: entry.status || 'Draft',
        series: entry.series || 'MAT-RECO-.YYYY.-',
        company: entry.company || 'Avalon (Demo)',
        purpose: entry.purpose || 'Opening Stock',
        postingDate: entry.postingDate || '10-11-2026',
        postingTime: entry.postingTime || '00:32:40',
        editPostingDateTime: !!entry.editPostingDateTime,
        defaultWarehouse: entry.defaultWarehouse || 'Bitmiş Ürünler - AD',
        scanBarcode: entry.scanBarcode || '',
        scanMode: !!entry.scanMode,
        differenceAccount: entry.differenceAccount || '111.01 - Sermaye Ekipmanı - AD',
        differenceAmount: entry.differenceAmount ?? 9.0,
        costCenter: entry.costCenter || '',
        createdOn: new Date().toISOString(),
        lastUpdatedOn: new Date().toISOString(),
        timeAgoText: 'now',
        commentsCount: 0,
        isLiked: false,
        items: entry.items && entry.items.length > 0 ? entry.items : [
          {
            id: 'it-reco-1',
            itemCode: 'SKU001: T-shirt',
            itemName: 'SKU001: T-shirt',
            warehouse: entry.defaultWarehouse || 'Bitmiş Ürünler - AD',
            qty: 3,
            stockUom: 'Nos',
            valuationRate: 3.0,
            amount: 9.0,
          },
        ],
      };
      return newEntry;
    }
  },

  // Landed Cost Vouchers (Frappe ERP / Landed Cost Voucher)
  async getLandedCostVouchers(): Promise<import('../types').LandedCostVoucherRecord[]> {
    try {
      const res = await axiosClient.get<import('../types').LandedCostVoucherRecord[]>('/landed-cost-vouchers');
      return res.data;
    } catch {
      return INITIAL_LANDED_COST_VOUCHERS;
    }
  },

  async createLandedCostVoucher(entry: Partial<import('../types').LandedCostVoucherRecord>): Promise<import('../types').LandedCostVoucherRecord> {
    try {
      const res = await axiosClient.post<import('../types').LandedCostVoucherRecord>('/landed-cost-vouchers', entry);
      return res.data;
    } catch {
      const newEntry: import('../types').LandedCostVoucherRecord = {
        id: `MAT-LCV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`,
        status: entry.status || 'Draft',
        series: entry.series || 'MAT-LCV-.YYYY.-',
        company: entry.company || 'Avalon (Demo)',
        postingDate: entry.postingDate || '10-11-2026',
        distributeChargesBasedOn: entry.distributeChargesBasedOn || 'Qty',
        createdOn: new Date().toISOString(),
        lastUpdatedOn: new Date().toISOString(),
        timeAgoText: 'now',
        commentsCount: 0,
        isLiked: false,
        vouchers: entry.vouchers || [
          {
            id: 'lcv-v-1',
            receiptDocumentType: 'Purchase Receipt',
            receiptDocument: '',
            supplier: '',
            grandTotal: 0,
          },
        ],
        items: entry.items || [
          {
            id: 'lcv-it-1',
            itemCode: '',
            description: '',
            qty: 0,
            amount: 0,
            applicableCharges: 0,
          },
        ],
        vendorInvoices: entry.vendorInvoices || [],
        landedCosts: entry.landedCosts || [
          {
            id: 'lcv-exp-1',
            expenseAccount: '',
            description: '',
            amount: 0,
          },
        ],
      };
      return newEntry;
    }
  },

  // Repost Item Valuations (Frappe ERP / Repost Item Valuation)
  async getRepostItemValuations(): Promise<import('../types').RepostItemValuationRecord[]> {
    try {
      const res = await axiosClient.get<import('../types').RepostItemValuationRecord[]>('/repost-item-valuations');
      return res.data;
    } catch {
      return INITIAL_REPOST_ITEM_VALUATIONS;
    }
  },

  async createRepostItemValuation(entry: Partial<import('../types').RepostItemValuationRecord>): Promise<import('../types').RepostItemValuationRecord> {
    try {
      const res = await axiosClient.post<import('../types').RepostItemValuationRecord>('/repost-item-valuations', entry);
      return res.data;
    } catch {
      const randomStr = Math.random().toString(36).substring(2, 12);
      const newEntry: import('../types').RepostItemValuationRecord = {
        id: entry.id || randomStr,
        status: entry.status || 'Queued',
        basedOn: entry.basedOn || 'Transaction',
        voucherType: entry.voucherType || '',
        voucherNo: entry.voucherNo || '',
        itemCode: entry.itemCode || '',
        warehouse: entry.warehouse || '',
        postingDate: entry.postingDate || '10-11-2026',
        postingTime: entry.postingTime || new Date().toTimeString().split(' ')[0],
        company: entry.company || 'Avalon (Demo)',
        repostOnlyAccountingLedgers: entry.repostOnlyAccountingLedgers ?? false,
        allowNegativeStock: entry.allowNegativeStock ?? true,
        viaLandedCostVoucher: entry.viaLandedCostVoucher ?? false,
        allowZeroRate: entry.allowZeroRate ?? false,
        recreateStockLedgers: entry.recreateStockLedgers ?? false,
        noOfItemsToRepost: entry.noOfItemsToRepost || 1,
        createdOn: new Date().toISOString(),
        lastUpdatedOn: new Date().toISOString(),
        timeAgoText: 'now',
        commentsCount: 0,
        isLiked: false,
      };
      return newEntry;
    }
  },

  // Packing Slips (Frappe ERP / Packing Slip)
  async getPackingSlips(): Promise<import('../types').PackingSlipRecord[]> {
    try {
      const res = await axiosClient.get<import('../types').PackingSlipRecord[]>('/packing-slips');
      return res.data;
    } catch {
      return INITIAL_PACKING_SLIPS;
    }
  },

  async createPackingSlip(entry: Partial<import('../types').PackingSlipRecord>): Promise<import('../types').PackingSlipRecord> {
    try {
      const res = await axiosClient.post<import('../types').PackingSlipRecord>('/packing-slips', entry);
      return res.data;
    } catch {
      const newEntry: import('../types').PackingSlipRecord = {
        id: `MAT-PAC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`,
        status: entry.status || 'Draft',
        deliveryNote: entry.deliveryNote || 'MAT-DN-2026-00001',
        series: entry.series || 'MAT-PAC-.YYYY.-',
        fromPackageNo: entry.fromPackageNo ?? 1,
        toPackageNo: entry.toPackageNo ?? 1,
        netWeight: entry.netWeight ?? 0,
        grossWeight: entry.grossWeight ?? 0,
        grossWeightUom: entry.grossWeightUom || '',
        letterHead: entry.letterHead || 'Company Letterhead - Grey',
        createdOn: new Date().toISOString(),
        lastUpdatedOn: new Date().toISOString(),
        timeAgoText: 'now',
        commentsCount: 0,
        isLiked: false,
        items: entry.items || [
          {
            id: 'pac-it-1',
            itemCode: 'SKU002: Laptop',
            itemName: 'Laptop',
            qty: 1,
            netWeight: 0,
            pageBreak: false,
          },
        ],
      };
      return newEntry;
    }
  },

  // Items (Frappe ERP / Item 1:1)
  async getItems(): Promise<import('../types').ItemRecord[]> {
    try {
      const res = await axiosClient.get<import('../types').ItemRecord[]>('/items');
      return res.data;
    } catch {
      return INITIAL_ITEMS;
    }
  },

  async createItem(entry: Partial<import('../types').ItemRecord>): Promise<import('../types').ItemRecord> {
    try {
      const res = await axiosClient.post<import('../types').ItemRecord>('/items', entry);
      return res.data;
    } catch {
      const code = entry.itemCode || entry.id || `ITEM-${Math.floor(Math.random() * 9000) + 1000}`;
      const newEntry: import('../types').ItemRecord = {
        id: code,
        itemCode: code,
        itemName: entry.itemName || code,
        status: entry.status || 'Enabled',
        itemGroup: entry.itemGroup || 'Products',
        uom: entry.uom || 'Nos',
        itemType: entry.itemType || 'Stock',
        purpose: entry.purpose || 'Sales & Purchase',
        maintainStock: entry.maintainStock ?? true,
        isFixedAsset: entry.isFixedAsset ?? false,
        hasVariants: entry.hasVariants ?? false,
        variantOf: entry.variantOf || '',
        createdOn: new Date().toISOString(),
        lastUpdatedOn: new Date().toISOString(),
        timeAgoText: 'now',
        commentsCount: 0,
        isLiked: false,
      };
      return newEntry;
    }
  },

  // Item Groups (Frappe ERP / Item Group 1:1)
  async getItemGroups(): Promise<import('../types').ItemGroupRecord[]> {
    try {
      const res = await axiosClient.get<import('../types').ItemGroupRecord[]>('/item-groups');
      return res.data;
    } catch {
      return INITIAL_ITEM_GROUPS;
    }
  },

  async getItemGroupById(id: string): Promise<import('../types').ItemGroupRecord | undefined> {
    const list = await this.getItemGroups();
    return list.find((g) => g.id.toLowerCase() === id.toLowerCase() || g.itemGroupName.toLowerCase() === id.toLowerCase());
  },

  async createItemGroup(entry: Partial<import('../types').ItemGroupRecord>): Promise<import('../types').ItemGroupRecord> {
    try {
      const res = await axiosClient.post<import('../types').ItemGroupRecord>('/item-groups', entry);
      return res.data;
    } catch {
      const name = entry.itemGroupName || entry.id || 'New Item Group';
      const newEntry: import('../types').ItemGroupRecord = {
        id: name,
        itemGroupName: name,
        parentItemGroup: entry.parentItemGroup || '',
        isGroup: entry.isGroup ?? false,
        timeAgoText: 'now',
        commentsCount: 0,
        isLiked: false,
        defaults: entry.defaults || [],
        taxes: entry.taxes || [],
        createdOn: new Date().toISOString(),
        lastUpdatedOn: new Date().toISOString(),
      };
      return newEntry;
    }
  },

  // Item Attributes (Frappe ERP / Item Attribute 1:1)
  async getItemAttributes(): Promise<import('../types').ItemAttributeRecord[]> {
    try {
      const res = await axiosClient.get<import('../types').ItemAttributeRecord[]>('/item-attributes');
      return res.data;
    } catch {
      return INITIAL_ITEM_ATTRIBUTES;
    }
  },

  async getItemAttributeById(id: string): Promise<import('../types').ItemAttributeRecord | undefined> {
    const list = await this.getItemAttributes();
    return list.find((a) => a.id.toLowerCase() === id.toLowerCase() || a.attributeName.toLowerCase() === id.toLowerCase());
  },

  async createItemAttribute(entry: Partial<import('../types').ItemAttributeRecord>): Promise<import('../types').ItemAttributeRecord> {
    try {
      const res = await axiosClient.post<import('../types').ItemAttributeRecord>('/item-attributes', entry);
      return res.data;
    } catch {
      const name = entry.attributeName || entry.id || 'New Attribute';
      const isDis = entry.disabled ?? false;
      const newEntry: import('../types').ItemAttributeRecord = {
        id: name,
        attributeName: name,
        status: isDis ? 'Disabled' : 'Enabled',
        disabled: isDis,
        numericValues: entry.numericValues ?? false,
        values: entry.values || [],
        timeAgoText: 'now',
        commentsCount: 0,
        isLiked: false,
        createdOn: new Date().toISOString(),
        lastUpdatedOn: new Date().toISOString(),
      };
      return newEntry;
    }
  },

  // Brands (Frappe ERP / Brand 1:1)
  async getBrands(): Promise<import('../types').BrandRecord[]> {
    try {
      const res = await axiosClient.get<import('../types').BrandRecord[]>('/brands');
      return res.data;
    } catch {
      return INITIAL_BRANDS;
    }
  },

  async getBrandById(id: string): Promise<import('../types').BrandRecord | undefined> {
    const list = await this.getBrands();
    return list.find((b) => b.id.toLowerCase() === id.toLowerCase() || b.brandName.toLowerCase() === id.toLowerCase());
  },

  async createBrand(entry: Partial<import('../types').BrandRecord>): Promise<import('../types').BrandRecord> {
    try {
      const res = await axiosClient.post<import('../types').BrandRecord>('/brands', entry);
      return res.data;
    } catch {
      const name = entry.brandName || entry.id || 'New Brand';
      const newEntry: import('../types').BrandRecord = {
        id: name,
        brandName: name,
        description: entry.description || '',
        defaults: entry.defaults || [],
        timeAgoText: 'now',
        commentsCount: 0,
        isLiked: false,
        createdOn: new Date().toISOString(),
        lastUpdatedOn: new Date().toISOString(),
      };
      return newEntry;
    }
  },

  async getWarehouseRecords(): Promise<import('../types').WarehouseRecord[]> {
    try {
      const res = await axiosClient.get<import('../types').WarehouseRecord[]>('/warehouse-records');
      return res.data;
    } catch {
      return INITIAL_WAREHOUSE_RECORDS;
    }
  },

  async getWarehouseRecordById(id: string): Promise<import('../types').WarehouseRecord | undefined> {
    const list = await this.getWarehouseRecords();
    return list.find((w) => w.id.toLowerCase() === id.toLowerCase() || w.warehouseName.toLowerCase() === id.toLowerCase());
  },

  async createWarehouseRecord(entry: Partial<import('../types').WarehouseRecord>): Promise<import('../types').WarehouseRecord> {
    try {
      const res = await axiosClient.post<import('../types').WarehouseRecord>('/warehouse-records', entry);
      return res.data;
    } catch {
      const name = entry.warehouseName || entry.id || 'New Warehouse';
      const company = entry.company || 'Avalon (Demo)';
      const fullId = entry.id || (entry.warehouseName ? `${entry.warehouseName} - ${company.includes('Demo') ? 'AD' : 'A'}` : name);
      const newEntry: import('../types').WarehouseRecord = {
        id: fullId,
        warehouseName: entry.warehouseName || name,
        status: entry.status || 'Enabled',
        company: company,
        account: entry.account || '',
        isGroupWarehouse: Boolean(entry.isGroupWarehouse),
        isRejectedWarehouse: Boolean(entry.isRejectedWarehouse),
        parentWarehouse: entry.parentWarehouse || '',
        customer: entry.customer || '',
        phoneNo: entry.phoneNo || '',
        mobileNo: entry.mobileNo || '',
        addressLine1: entry.addressLine1 || '',
        addressLine2: entry.addressLine2 || '',
        city: entry.city || '',
        stateProvince: entry.stateProvince || '',
        pin: entry.pin || '',
        warehouseType: entry.warehouseType || '',
        defaultInTransitWarehouse: entry.defaultInTransitWarehouse || '',
        isLiked: false,
        createdOn: 'now',
        commentsCount: 0,
        lastEdited: 'just now',
        createdBy: 'just now',
      };
      return newEntry;
    }
  },

  async getUOMRecords(): Promise<import('../types').UOMRecord[]> {
    try {
      const res = await axiosClient.get<import('../types').UOMRecord[]>('/uom-records');
      return res.data;
    } catch {
      return INITIAL_UOM_RECORDS;
    }
  },

  async getUOMRecordById(id: string): Promise<import('../types').UOMRecord | undefined> {
    const list = await this.getUOMRecords();
    return list.find((u) => u.id.toLowerCase() === id.toLowerCase() || u.uomName.toLowerCase() === id.toLowerCase());
  },

  async createUOMRecord(entry: Partial<import('../types').UOMRecord>): Promise<import('../types').UOMRecord> {
    try {
      const res = await axiosClient.post<import('../types').UOMRecord>('/uom-records', entry);
      return res.data;
    } catch {
      const name = entry.uomName || entry.id || 'New UOM';
      const newEntry: import('../types').UOMRecord = {
        id: name,
        uomName: name,
        status: entry.enabled === false ? 'Disabled' : 'Enabled',
        category: entry.category || '',
        symbol: entry.symbol || '',
        commonCode: entry.commonCode || '',
        description: entry.description || '',
        mustBeWholeNumber: Boolean(entry.mustBeWholeNumber),
        enabled: entry.enabled !== false,
        isLiked: false,
        createdOn: 'now',
        commentsCount: 0,
        lastEdited: 'just now',
        createdBy: 'just now',
      };
      return newEntry;
    }
  },

  async getUOMConversionFactors(): Promise<import('../types').UOMConversionFactorRecord[]> {
    try {
      const res = await axiosClient.get<import('../types').UOMConversionFactorRecord[]>('/uom-conversion-factors');
      return res.data;
    } catch {
      return INITIAL_UOM_CONVERSION_FACTORS;
    }
  },

  async getUOMConversionFactorById(id: string): Promise<import('../types').UOMConversionFactorRecord | undefined> {
    const list = await this.getUOMConversionFactors();
    return list.find((c) => c.id.toLowerCase() === id.toLowerCase());
  },

  async createUOMConversionFactor(entry: Partial<import('../types').UOMConversionFactorRecord>): Promise<import('../types').UOMConversionFactorRecord> {
    try {
      const res = await axiosClient.post<import('../types').UOMConversionFactorRecord>('/uom-conversion-factors', entry);
      return res.data;
    } catch {
      const count = 236;
      const genId = entry.id || `MAT-UOM-CNV-${String(count).padStart(5, '0')}`;
      const newEntry: import('../types').UOMConversionFactorRecord = {
        id: genId,
        category: entry.category || 'General',
        fromUOM: entry.fromUOM || '',
        toUOM: entry.toUOM || '',
        value: entry.value || '0.000000000',
        isLiked: false,
        createdOn: 'now',
        commentsCount: 0,
        lastEdited: 'just now',
        createdBy: 'just now',
      };
      return newEntry;
    }
  },

  // Serial No (Frappe ERP / Serial No)
  async getSerialNos(): Promise<import('../types').SerialNoRecord[]> {
    try {
      const res = await axiosClient.get<import('../types').SerialNoRecord[]>('/serial-nos');
      return res.data;
    } catch {
      return INITIAL_SERIAL_NOS;
    }
  },

  async getSerialNoById(id: string): Promise<import('../types').SerialNoRecord | undefined> {
    const list = await this.getSerialNos();
    return list.find((c) => c.id.toLowerCase() === id.toLowerCase() || c.serialNo.toLowerCase() === id.toLowerCase());
  },

  async createSerialNo(entry: Partial<import('../types').SerialNoRecord>): Promise<import('../types').SerialNoRecord> {
    try {
      const res = await axiosClient.post<import('../types').SerialNoRecord>('/serial-nos', entry);
      return res.data;
    } catch {
      const genId = entry.serialNo || `SR-${String(Math.floor(Math.random() * 90000) + 10000)}`;
      const newEntry: import('../types').SerialNoRecord = {
        id: genId,
        serialNo: entry.serialNo || genId,
        itemCode: entry.itemCode || '',
        status: entry.status || 'Active',
        warehouse: entry.warehouse || '',
        company: entry.company || 'Avalon (Demo)',
        warrantyExpiryDate: entry.warrantyExpiryDate || '',
        amcExpiryDate: entry.amcExpiryDate || '',
        workOrder: entry.workOrder || '',
        isLiked: false,
        createdOn: 'now',
        commentsCount: 0,
        lastEdited: 'just now',
        createdBy: 'Administrator',
      };
      return newEntry;
    }
  },

  // Batch (Frappe ERP / Batch)
  async getBatches(): Promise<import('../types').BatchRecord[]> {
    try {
      const res = await axiosClient.get<import('../types').BatchRecord[]>('/batches');
      return res.data;
    } catch {
      return INITIAL_BATCHES;
    }
  },

  async getBatchById(id: string): Promise<import('../types').BatchRecord | undefined> {
    const list = await this.getBatches();
    return list.find((c) => c.id.toLowerCase() === id.toLowerCase() || c.batchId.toLowerCase() === id.toLowerCase());
  },

  async createBatch(entry: Partial<import('../types').BatchRecord>): Promise<import('../types').BatchRecord> {
    try {
      const res = await axiosClient.post<import('../types').BatchRecord>('/batches', entry);
      return res.data;
    } catch {
      const genId = entry.batchId || `BATCH-2026-${String(Math.floor(Math.random() * 90000) + 10000)}`;
      const newEntry: import('../types').BatchRecord = {
        id: genId,
        batchId: entry.batchId || genId,
        item: entry.item || '',
        manufacturingDate: entry.manufacturingDate || '10-11-2026',
        batchUOM: entry.batchUOM || 'Nos',
        expiryDate: entry.expiryDate || '',
        useBatchWiseValuation: !!entry.useBatchWiseValuation,
        allowNegativeStock: !!entry.allowNegativeStock,
        description: entry.description || '',
        status: entry.status || 'Active',
        isLiked: false,
        createdOn: 'now',
        commentsCount: 0,
        lastEdited: 'just now',
        createdBy: 'Administrator',
      };
      return newEntry;
    }
  },

  // Serial and Batch Bundle (Frappe ERP / Serial and Batch Bundle)
  async getSerialAndBatchBundles(): Promise<import('../types').SerialAndBatchBundleRecord[]> {
    try {
      const res = await axiosClient.get<import('../types').SerialAndBatchBundleRecord[]>('/serial-and-batch-bundles');
      return res.data;
    } catch {
      return INITIAL_SERIAL_AND_BATCH_BUNDLES;
    }
  },

  async getSerialAndBatchBundleById(id: string): Promise<import('../types').SerialAndBatchBundleRecord | undefined> {
    const list = await this.getSerialAndBatchBundles();
    return list.find((c) => c.id.toLowerCase() === id.toLowerCase());
  },

  async createSerialAndBatchBundle(entry: Partial<import('../types').SerialAndBatchBundleRecord>): Promise<import('../types').SerialAndBatchBundleRecord> {
    try {
      const res = await axiosClient.post<import('../types').SerialAndBatchBundleRecord>('/serial-and-batch-bundles', entry);
      return res.data;
    } catch {
      const count = Math.floor(Math.random() * 90000) + 10000;
      const genId = entry.id || `SABB-2026-${String(count)}`;
      const newEntry: import('../types').SerialAndBatchBundleRecord = {
        id: genId,
        namingSeries: entry.namingSeries || 'SABB-.########',
        company: entry.company || 'Avalon (Demo)',
        hasSerialNo: !!entry.hasSerialNo,
        hasBatchNo: !!entry.hasBatchNo,
        itemCode: entry.itemCode || '',
        warehouse: entry.warehouse || '',
        typeOfTransaction: entry.typeOfTransaction || 'Inward',
        items: entry.items || [{ id: 'row-1', qty: 1 }],
        voucherType: entry.voucherType || '',
        voucherNo: entry.voucherNo || '',
        isCancelled: !!entry.isCancelled,
        isPacked: !!entry.isPacked,
        postingDatetime: entry.postingDatetime || new Date().toISOString(),
        status: entry.status || 'Draft',
        isLiked: false,
        createdOn: 'now',
        commentsCount: 0,
        lastEdited: 'just now',
        createdBy: 'Administrator',
      };
      return newEntry;
    }
  },

  // Inventory Dimension (Frappe ERP / Inventory Dimension)
  async getInventoryDimensions(): Promise<import('../types').InventoryDimensionRecord[]> {
    try {
      const res = await axiosClient.get<import('../types').InventoryDimensionRecord[]>('/inventory-dimensions');
      return res.data;
    } catch {
      return INITIAL_INVENTORY_DIMENSIONS;
    }
  },

  async getInventoryDimensionById(id: string): Promise<import('../types').InventoryDimensionRecord | undefined> {
    const list = await this.getInventoryDimensions();
    return list.find((c) => c.id.toLowerCase() === id.toLowerCase() || c.dimensionName.toLowerCase() === id.toLowerCase());
  },

  async createInventoryDimension(entry: Partial<import('../types').InventoryDimensionRecord>): Promise<import('../types').InventoryDimensionRecord> {
    try {
      const res = await axiosClient.post<import('../types').InventoryDimensionRecord>('/inventory-dimensions', entry);
      return res.data;
    } catch {
      const genId = entry.dimensionName || `DIM-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      const newEntry: import('../types').InventoryDimensionRecord = {
        id: genId,
        dimensionName: entry.dimensionName || genId,
        referenceDocument: entry.referenceDocument || 'API Request Log',
        applyToAllInventoryDocuments: entry.applyToAllInventoryDocuments !== undefined ? entry.applyToAllInventoryDocuments : true,
        validateNegativeStock: !!entry.validateNegativeStock,
        fetchValueFrom: entry.fetchValueFrom || '',
        mandatory: !!entry.mandatory,
        mandatoryDependsOn: entry.mandatoryDependsOn || '',
        createdOn: '1 d',
        lastEdited: 'yesterday',
        createdBy: 'Administrator',
        commentsCount: 0,
        isLiked: false,
      };
      return newEntry;
    }
  },

  // Shipping Rule (Frappe ERP / Shipping Rule)
  async getShippingRules(): Promise<import('../types').ShippingRuleRecord[]> {
    try {
      const res = await axiosClient.get<import('../types').ShippingRuleRecord[]>('/shipping-rules');
      return res.data;
    } catch {
      return INITIAL_SHIPPING_RULES;
    }
  },

  async getShippingRuleById(id: string): Promise<import('../types').ShippingRuleRecord | undefined> {
    const list = await this.getShippingRules();
    return list.find((c) => c.id.toLowerCase() === id.toLowerCase() || c.shippingRuleLabel.toLowerCase() === id.toLowerCase());
  },

  async createShippingRule(entry: Partial<import('../types').ShippingRuleRecord>): Promise<import('../types').ShippingRuleRecord> {
    try {
      const res = await axiosClient.post<import('../types').ShippingRuleRecord>('/shipping-rules', entry);
      return res.data;
    } catch {
      const genId = entry.shippingRuleLabel || `SHIP-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      const newEntry: import('../types').ShippingRuleRecord = {
        id: genId,
        shippingRuleLabel: entry.shippingRuleLabel || genId,
        shippingRuleType: entry.shippingRuleType || 'Selling',
        disabled: !!entry.disabled,
        company: entry.company || 'Avalon (Demo)',
        shippingAccount: entry.shippingAccount || 'Shipping Charges - AD',
        calculateBasedOn: entry.calculateBasedOn || 'Fixed',
        shippingAmount: Number(entry.shippingAmount) || 0,
        countries: entry.countries || [],
        status: entry.disabled ? 'Disabled' : 'Active',
        createdOn: 'now',
        lastEdited: 'just now',
        createdBy: 'Administrator',
        commentsCount: 0,
        isLiked: false,
      };
      return newEntry;
    }
  },

  // Item Alternative (Frappe ERP / Item Alternative)
  async getItemAlternatives(): Promise<import('../types').ItemAlternativeRecord[]> {
    try {
      const res = await axiosClient.get<import('../types').ItemAlternativeRecord[]>('/item-alternatives');
      return res.data;
    } catch {
      return INITIAL_ITEM_ALTERNATIVES;
    }
  },

  async getItemAlternativeById(id: string): Promise<import('../types').ItemAlternativeRecord | undefined> {
    const list = await this.getItemAlternatives();
    return list.find((c) => c.id.toLowerCase() === id.toLowerCase());
  },

  async createItemAlternative(entry: Partial<import('../types').ItemAlternativeRecord>): Promise<import('../types').ItemAlternativeRecord> {
    try {
      const res = await axiosClient.post<import('../types').ItemAlternativeRecord>('/item-alternatives', entry);
      return res.data;
    } catch {
      const genId = entry.id || `ALT-${String(Math.floor(Math.random() * 90000) + 10000)}`;
      const newEntry: import('../types').ItemAlternativeRecord = {
        id: genId,
        itemCode: entry.itemCode || '',
        alternativeItemCode: entry.alternativeItemCode || '',
        twoWay: !!entry.twoWay,
        createdOn: 'now',
        lastEdited: 'just now',
        createdBy: 'Administrator',
        commentsCount: 0,
        isLiked: false,
      };
      return newEntry;
    }
  },

  // Delivery Trip (Frappe ERP / Delivery Trip)
  async getDeliveryTrips(): Promise<import('../types').DeliveryTripRecord[]> {
    try {
      const res = await axiosClient.get<import('../types').DeliveryTripRecord[]>('/delivery-trips');
      return res.data;
    } catch {
      return INITIAL_DELIVERY_TRIPS;
    }
  },

  async getDeliveryTripById(id: string): Promise<import('../types').DeliveryTripRecord | undefined> {
    const list = await this.getDeliveryTrips();
    return list.find((c) => c.id.toLowerCase() === id.toLowerCase());
  },

  async createDeliveryTrip(entry: Partial<import('../types').DeliveryTripRecord>): Promise<import('../types').DeliveryTripRecord> {
    try {
      const res = await axiosClient.post<import('../types').DeliveryTripRecord>('/delivery-trips', entry);
      return res.data;
    } catch {
      const count = Math.floor(Math.random() * 90000) + 10000;
      const genId = entry.id || `MAT-DT-2026-${String(count)}`;
      const newEntry: import('../types').DeliveryTripRecord = {
        id: genId,
        series: entry.series || 'MAT-DT-.YYYY.-',
        company: entry.company || 'Avalon (Demo)',
        initialEmailNotificationSent: !!entry.initialEmailNotificationSent,
        driver: entry.driver || '',
        vehicle: entry.vehicle || '',
        driverAddress: entry.driverAddress || '',
        departureTime: entry.departureTime || '2026-11-11 10:00:00',
        status: entry.status || 'Draft',
        deliveryStops: entry.deliveryStops || [],
        createdOn: 'now',
        lastEdited: 'just now',
        createdBy: 'Administrator',
        commentsCount: 0,
        isLiked: false,
      };
      return newEntry;
    }
  },

  async getQualityInspectionTemplates(): Promise<import('../types').QualityInspectionTemplateRecord[]> {
    try {
      const res = await axiosClient.get<import('../types').QualityInspectionTemplateRecord[]>('/quality-inspection-templates');
      return res.data;
    } catch {
      return INITIAL_QUALITY_INSPECTION_TEMPLATES;
    }
  },

  async getQualityInspectionTemplateById(id: string): Promise<import('../types').QualityInspectionTemplateRecord | undefined> {
    const list = await this.getQualityInspectionTemplates();
    return list.find((c) => c.id.toLowerCase() === id.toLowerCase());
  },

  async createQualityInspectionTemplate(entry: Partial<import('../types').QualityInspectionTemplateRecord>): Promise<import('../types').QualityInspectionTemplateRecord> {
    try {
      const res = await axiosClient.post<import('../types').QualityInspectionTemplateRecord>('/quality-inspection-templates', entry);
      return res.data;
    } catch {
      const genId = entry.id || entry.templateName || `QIT-${Date.now()}`;
      const newEntry: import('../types').QualityInspectionTemplateRecord = {
        id: genId,
        templateName: entry.templateName || genId,
        parameters: entry.parameters || [],
        createdOn: 'now',
        lastEdited: 'just now',
        createdBy: 'Administrator',
        commentsCount: 0,
        isLiked: false,
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

export const INITIAL_PURCHASE_RECEIPTS: import('../types').PurchaseReceiptRecord[] = [
  {
    id: 'MAT-PR-RE-2026-00001',
    supplierName: 'Summit Traders Ltd.',
    status: 'Draft',
    date: '03-11-2026',
    postingTime: '22:15:00',
    grandTotal: 396.0,
    currency: 'USD',
    perAmountBilled: 0,
    perReturned: 0,
    company: 'Avalon (Demo)',
    series: 'MAT-PR-RE-.YYYY.-',
    acceptedWarehouse: 'Devam Eden İşler - AD',
    createdOn: new Date().toISOString(),
    lastUpdatedOn: new Date().toISOString(),
    timeAgoText: '3 m',
    commentsCount: 0,
    isLiked: false,
    items: [
      {
        id: 'it-pr-1',
        itemCode: 'SKU002: Laptop',
        itemName: 'High Performance Business Laptop',
        receivedQty: 10,
        acceptedQty: 10,
        rejectedQty: 0,
        uom: 'Nos',
        rate: 39.6,
        amount: 396.0,
        warehouse: 'Devam Eden İşler - AD',
      },
    ],
    remarks: 'Received in good condition from Summit Traders',
  },
  {
    id: 'MAT-PR-RE-2026-00002',
    supplierName: 'AzLogistics Supply MMC',
    status: 'To Bill',
    date: '02-11-2026',
    postingTime: '14:20:00',
    grandTotal: 1850.0,
    currency: 'USD',
    perAmountBilled: 50,
    perReturned: 0,
    company: 'Avalon (Demo)',
    series: 'MAT-PR-RE-.YYYY.-',
    acceptedWarehouse: 'Mərkəzi Baş Anbar',
    createdOn: new Date(Date.now() - 3600000 * 24).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 3600000 * 12).toISOString(),
    timeAgoText: '1 day ago',
    commentsCount: 2,
    isLiked: true,
    items: [
      {
        id: 'it-pr-2',
        itemCode: 'SKU005: Raw Steel Sheets',
        itemName: 'Cold Rolled Steel Sheets',
        receivedQty: 50,
        acceptedQty: 50,
        rejectedQty: 0,
        uom: 'Pcs',
        rate: 37.0,
        amount: 1850.0,
        warehouse: 'Mərkəzi Baş Anbar',
      },
    ],
    remarks: 'Partial billing requested by supplier',
  },
  {
    id: 'MAT-PR-RE-2026-00003',
    supplierName: 'Baku Tech Distribution',
    status: 'Completed',
    date: '28-10-2026',
    postingTime: '11:00:00',
    grandTotal: 720.0,
    currency: 'USD',
    perAmountBilled: 100,
    perReturned: 0,
    company: 'Avalon (Demo)',
    series: 'MAT-PR-RE-.YYYY.-',
    acceptedWarehouse: 'Sumqayıt Logistika Mərkəzi',
    createdOn: new Date(Date.now() - 3600000 * 72).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 3600000 * 48).toISOString(),
    timeAgoText: '3 days ago',
    commentsCount: 1,
    isLiked: false,
    items: [
      {
        id: 'it-pr-3',
        itemCode: 'SKU010: Power Supply 650W',
        itemName: 'Industrial Power Supply 650W Bronze',
        receivedQty: 12,
        acceptedQty: 12,
        rejectedQty: 0,
        uom: 'Nos',
        rate: 60.0,
        amount: 720.0,
        warehouse: 'Sumqayıt Logistika Mərkəzi',
      },
    ],
    remarks: 'Full delivery and bill settlement complete',
  },
];

export const INITIAL_DELIVERY_NOTES: import('../types').DeliveryNoteRecord[] = [
  {
    id: 'MAT-DN-2026-00001',
    customer: 'Grant Plastics Ltd.',
    customerName: 'Grant Plastics Ltd.',
    status: 'Draft',
    date: '09-11-2026',
    postingTime: '14:54:00',
    grandTotal: 0.0,
    currency: 'USD',
    perAmountBilled: 0,
    perReturned: 0,
    company: 'Avalon (Demo)',
    series: 'MAT-DN-.YYYY.-',
    setTargetWarehouse: '',
    setSourceWarehouse: 'Stores - AD',
    isReturn: false,
    createdOn: new Date().toISOString(),
    lastUpdatedOn: new Date().toISOString(),
    timeAgoText: 'now',
    commentsCount: 0,
    isLiked: false,
    items: [
      {
        id: 'it-dn-1',
        itemCode: 'SKU002: Laptop',
        itemName: 'High Performance Business Laptop',
        qty: 1,
        uom: 'Nos',
        rate: 0.0,
        amount: 0.0,
        warehouse: 'Stores - AD',
      },
    ],
    remarks: 'Draft delivery note for Grant Plastics Ltd.',
  },
];

export const INITIAL_MATERIAL_REQUESTS: import('../types').MaterialRequestRecord[] = [
  {
    id: 'MAT-MR-2026-00001',
    title: 'Material Issue Request for Laptop',
    status: 'Draft',
    purpose: 'Material Issue',
    transactionDate: '09-11-2026',
    requiredBy: '13-11-2026',
    company: 'Avalon (Demo)',
    series: 'MAT-MR-.YYYY.-',
    priceList: 'Standard Buying',
    setWarehouse: 'Bitmiş Ürünler - AD',
    createdOn: new Date().toISOString(),
    lastUpdatedOn: new Date().toISOString(),
    timeAgoText: 'now',
    commentsCount: 0,
    isLiked: false,
    items: [
      {
        id: 'it-mr-1',
        itemCode: 'SKU002: Laptop',
        itemName: 'SKU002: Laptop',
        requiredBy: '13-11-2026',
        qty: 1,
        warehouse: 'Bitmiş Ürünler - AD',
        uom: 'Nos',
      },
    ],
    letterHead: 'Company Letterhead - Grey',
    printHeading: '',
  },
];

export const INITIAL_PICK_LISTS: import('../types').PickListRecord[] = [
  {
    id: 'STO-PICK-2026-00001',
    status: 'Draft',
    deliveryStatus: 'Not Delivered',
    company: 'Avalon (Demo)',
    customer: 'Palmer Productions Ltd.',
    series: 'STO-PICK-.YYYY.-',
    purpose: 'Delivery',
    warehouse: '',
    considerRejectedWarehouses: false,
    pickManually: false,
    ignorePricingRule: false,
    scanMode: false,
    promptQty: false,
    groupSameItems: false,
    workOrder: '',
    createdOn: new Date().toISOString(),
    lastUpdatedOn: new Date().toISOString(),
    timeAgoText: '1 m',
    commentsCount: 0,
    isLiked: false,
    items: [
      {
        id: 'it-pl-1',
        item: 'SKU002: Laptop',
        itemName: 'SKU002: Laptop',
        warehouse: 'Bitmiş Ürünler - AD',
        qty: 1,
        stockQty: 1,
        pickedQty: 1,
        uom: 'Nos',
      },
    ],
  },
];

export const INITIAL_STOCK_RECONCILIATIONS: import('../types').StockReconciliationRecord[] = [
  {
    id: 'MAT-RECO-2026-00001',
    status: 'Draft',
    series: 'MAT-RECO-.YYYY.-',
    company: 'Avalon (Demo)',
    purpose: 'Opening Stock',
    postingDate: '10-11-2026',
    postingTime: '00:31:35',
    editPostingDateTime: false,
    defaultWarehouse: 'Bitmiş Ürünler - AD',
    scanBarcode: '',
    scanMode: false,
    differenceAccount: '111.01 - Sermaye Ekipmanı - AD',
    differenceAmount: 9.0,
    costCenter: '',
    createdOn: new Date().toISOString(),
    lastUpdatedOn: new Date().toISOString(),
    timeAgoText: 'now',
    commentsCount: 0,
    isLiked: false,
    items: [
      {
        id: 'it-reco-1',
        itemCode: 'SKU001: T-shirt',
        itemName: 'SKU001: T-shirt',
        warehouse: 'Bitmiş Ürünler - AD',
        qty: 3,
        stockUom: 'Nos',
        valuationRate: 3.0,
        amount: 9.0,
      },
    ],
  },
];

export const INITIAL_LANDED_COST_VOUCHERS: import('../types').LandedCostVoucherRecord[] = [
  {
    id: 'MAT-LCV-2026-00001',
    status: 'Draft',
    series: 'MAT-LCV-.YYYY.-',
    company: 'Avalon (Demo)',
    postingDate: '10-11-2026',
    distributeChargesBasedOn: 'Qty',
    createdOn: new Date().toISOString(),
    lastUpdatedOn: new Date().toISOString(),
    timeAgoText: 'now',
    commentsCount: 0,
    isLiked: false,
    vouchers: [
      {
        id: 'lcv-v-1',
        receiptDocumentType: 'Purchase Invoice',
        receiptDocument: 'ACC-PINV-2026-00001',
        supplier: 'Zuckerman Securit...',
        grandTotal: 39000.0,
      },
    ],
    items: [
      {
        id: 'lcv-it-1',
        itemCode: 'SKU010',
        description: '',
        qty: 78,
        amount: 39000.0,
        applicableCharges: 112.0,
      },
    ],
    vendorInvoices: [
      {
        id: 'lcv-vi-1',
        vendorInvoice: '',
        amount: 0,
      },
    ],
    landedCosts: [
      {
        id: 'lcv-exp-1',
        expenseAccount: '113 - Torpaq, tikili və avadanlıqlarla bağlı ...',
        description: 'fafa',
        amount: 112.0,
      },
    ],
  },
];

export const INITIAL_REPOST_ITEM_VALUATIONS: import('../types').RepostItemValuationRecord[] = [
  {
    id: 'c3nehrpeg3',
    status: 'Completed',
    basedOn: 'Item and Warehouse',
    voucherType: '',
    voucherNo: '',
    itemCode: 'SKU002',
    warehouse: 'Devam Eden İşlər - AD',
    postingDate: '01-11-2026',
    postingTime: '23:08:58',
    company: 'Avalon (Demo)',
    repostOnlyAccountingLedgers: false,
    allowNegativeStock: true,
    viaLandedCostVoucher: false,
    allowZeroRate: false,
    recreateStockLedgers: false,
    noOfItemsToRepost: 1,
    createdOn: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    timeAgoText: '1 w',
    commentsCount: 0,
    isLiked: false,
  },
];

export const INITIAL_PACKING_SLIPS: import('../types').PackingSlipRecord[] = [
  {
    id: 'MAT-PAC-2026-00001',
    status: 'Draft',
    deliveryNote: 'MAT-DN-2026-00001',
    series: 'MAT-PAC-.YYYY.-',
    fromPackageNo: 1,
    toPackageNo: 1,
    items: [
      {
        id: 'pac-it-1',
        itemCode: 'SKU002: Laptop',
        itemName: 'Laptop',
        qty: 1,
        netWeight: 0,
        pageBreak: false,
      },
    ],
    netWeight: 0,
    grossWeight: 0.0,
    grossWeightUom: '',
    letterHead: 'Company Letterhead - Grey',
    createdOn: new Date(Date.now() - 32 * 60000).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 32 * 60000).toISOString(),
    timeAgoText: '31 m',
    commentsCount: 0,
    isLiked: false,
  },
];

export const INITIAL_ITEMS: import('../types').ItemRecord[] = [
  {
    id: 'adad',
    itemCode: 'adad',
    itemName: 'adad',
    status: 'Enabled',
    itemGroup: 'Products',
    uom: 'Nos',
    itemType: 'Stock',
    purpose: 'Sales & Purchase',
    maintainStock: true,
    isFixedAsset: false,
    createdOn: new Date(Date.now() - 29 * 60000).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 29 * 60000).toISOString(),
    timeAgoText: '29 m',
    commentsCount: 0,
    isLiked: false,
  },
  {
    id: 'asas',
    itemCode: 'asas',
    itemName: 'daads',
    status: 'Enabled',
    itemGroup: 'Consumable',
    uom: 'Nos',
    itemType: 'Stock',
    purpose: 'Sales & Purchase',
    maintainStock: true,
    isFixedAsset: false,
    createdOn: new Date(Date.now() - 40 * 60000).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 40 * 60000).toISOString(),
    timeAgoText: '40 m',
    commentsCount: 0,
    isLiked: false,
  },
  {
    id: 'SKU010',
    itemCode: 'SKU010',
    itemName: 'Camera',
    status: 'Enabled',
    itemGroup: 'Demo Item Group',
    uom: 'Nos',
    itemType: 'Stock',
    purpose: 'Sales & Purchase',
    maintainStock: true,
    isFixedAsset: false,
    createdOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    timeAgoText: '3 M',
    commentsCount: 0,
    isLiked: false,
  },
  {
    id: 'SKU009',
    itemCode: 'SKU009',
    itemName: 'Headphones',
    status: 'Enabled',
    itemGroup: 'Demo Item Group',
    uom: 'Nos',
    itemType: 'Stock',
    purpose: 'Sales & Purchase',
    maintainStock: true,
    isFixedAsset: false,
    createdOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    timeAgoText: '3 M',
    commentsCount: 0,
    isLiked: false,
  },
  {
    id: 'SKU008',
    itemCode: 'SKU008',
    itemName: 'Backpack',
    status: 'Enabled',
    itemGroup: 'Demo Item Group',
    uom: 'Nos',
    itemType: 'Stock',
    purpose: 'Sales & Purchase',
    maintainStock: true,
    isFixedAsset: false,
    createdOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    timeAgoText: '3 M',
    commentsCount: 0,
    isLiked: false,
  },
  {
    id: 'SKU007',
    itemCode: 'SKU007',
    itemName: 'Television',
    status: 'Enabled',
    itemGroup: 'Demo Item Group',
    uom: 'Nos',
    itemType: 'Stock',
    purpose: 'Sales & Purchase',
    maintainStock: true,
    isFixedAsset: false,
    createdOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    timeAgoText: '3 M',
    commentsCount: 0,
    isLiked: false,
  },
  {
    id: 'SKU006',
    itemCode: 'SKU006',
    itemName: 'Coffee Mug',
    status: 'Enabled',
    itemGroup: 'Demo Item Group',
    uom: 'Nos',
    itemType: 'Stock',
    purpose: 'Sales & Purchase',
    maintainStock: true,
    isFixedAsset: false,
    createdOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    timeAgoText: '3 M',
    commentsCount: 0,
    isLiked: false,
  },
  {
    id: 'SKU005',
    itemCode: 'SKU005',
    itemName: 'Sneakers',
    status: 'Enabled',
    itemGroup: 'Demo Item Group',
    uom: 'Nos',
    itemType: 'Stock',
    purpose: 'Sales & Purchase',
    maintainStock: true,
    isFixedAsset: false,
    createdOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    timeAgoText: '3 M',
    commentsCount: 0,
    isLiked: false,
  },
  {
    id: 'SKU004',
    itemCode: 'SKU004',
    itemName: 'Smartphone',
    status: 'Enabled',
    itemGroup: 'Demo Item Group',
    uom: 'Nos',
    itemType: 'Stock',
    purpose: 'Sales & Purchase',
    maintainStock: true,
    isFixedAsset: false,
    createdOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    timeAgoText: '3 M',
    commentsCount: 0,
    isLiked: false,
  },
  {
    id: 'SKU003',
    itemCode: 'SKU003',
    itemName: 'Book',
    status: 'Enabled',
    itemGroup: 'Demo Item Group',
    uom: 'Nos',
    itemType: 'Stock',
    purpose: 'Sales & Purchase',
    maintainStock: true,
    isFixedAsset: false,
    createdOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    timeAgoText: '3 M',
    commentsCount: 0,
    isLiked: false,
  },
  {
    id: 'SKU002',
    itemCode: 'SKU002',
    itemName: 'Laptop',
    status: 'Enabled',
    itemGroup: 'Demo Item Group',
    uom: 'Nos',
    itemType: 'Stock',
    purpose: 'Sales & Purchase',
    maintainStock: true,
    isFixedAsset: false,
    createdOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    timeAgoText: '3 M',
    commentsCount: 0,
    isLiked: false,
  },
  {
    id: 'SKU001',
    itemCode: 'SKU001',
    itemName: 'T-shirt',
    status: 'Enabled',
    itemGroup: 'Demo Item Group',
    uom: 'Nos',
    itemType: 'Stock',
    purpose: 'Sales & Purchase',
    maintainStock: true,
    isFixedAsset: false,
    createdOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    timeAgoText: '3 M',
    commentsCount: 0,
    isLiked: false,
  },
];

export const INITIAL_ITEM_GROUPS: import('../types').ItemGroupRecord[] = [
  {
    id: 'Demo Item Group',
    itemGroupName: 'Demo Item Group',
    parentItemGroup: '',
    isGroup: false,
    timeAgoText: '3 M',
    commentsCount: 0,
    isLiked: false,
    createdOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    defaults: [],
    taxes: [],
  },
  {
    id: 'Consumable',
    itemGroupName: 'Consumable',
    parentItemGroup: 'All Item Groups',
    isGroup: false,
    timeAgoText: '3 M',
    commentsCount: 0,
    isLiked: false,
    createdOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    defaults: [],
    taxes: [],
  },
  {
    id: 'Sub Assemblies',
    itemGroupName: 'Sub Assemblies',
    parentItemGroup: 'All Item Groups',
    isGroup: false,
    timeAgoText: '3 M',
    commentsCount: 0,
    isLiked: false,
    createdOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    defaults: [],
    taxes: [],
  },
  {
    id: 'Services',
    itemGroupName: 'Services',
    parentItemGroup: 'All Item Groups',
    isGroup: false,
    timeAgoText: '3 M',
    commentsCount: 0,
    isLiked: false,
    createdOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    defaults: [],
    taxes: [],
  },
  {
    id: 'Raw Material',
    itemGroupName: 'Raw Material',
    parentItemGroup: 'All Item Groups',
    isGroup: false,
    timeAgoText: '3 M',
    commentsCount: 0,
    isLiked: false,
    createdOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    defaults: [],
    taxes: [],
  },
  {
    id: 'Products',
    itemGroupName: 'Products',
    parentItemGroup: 'All Item Groups',
    isGroup: false,
    timeAgoText: '3 M',
    commentsCount: 0,
    isLiked: false,
    createdOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    defaults: [],
    taxes: [],
  },
  {
    id: 'All Item Groups',
    itemGroupName: 'All Item Groups',
    parentItemGroup: '',
    isGroup: true,
    timeAgoText: '3 M',
    commentsCount: 0,
    isLiked: false,
    createdOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    defaults: [],
    taxes: [],
  },
];

export const INITIAL_ITEM_ATTRIBUTES: import('../types').ItemAttributeRecord[] = [
  {
    id: 'Colour',
    attributeName: 'Colour',
    status: 'Enabled',
    disabled: false,
    numericValues: false,
    timeAgoText: '3 M',
    commentsCount: 0,
    isLiked: false,
    createdOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    values: [
      { id: 'col-1', attributeValue: 'Red', abbreviation: 'RED' },
      { id: 'col-2', attributeValue: 'Blue', abbreviation: 'BLU' },
      { id: 'col-3', attributeValue: 'Green', abbreviation: 'GRN' },
      { id: 'col-4', attributeValue: 'Black', abbreviation: 'BLK' },
      { id: 'col-5', attributeValue: 'White', abbreviation: 'WHT' },
    ],
  },
  {
    id: 'Size',
    attributeName: 'Size',
    status: 'Enabled',
    disabled: false,
    numericValues: false,
    timeAgoText: '3 M',
    commentsCount: 0,
    isLiked: false,
    createdOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    lastUpdatedOn: new Date(Date.now() - 90 * 86400000).toISOString(),
    values: [
      { id: 'siz-1', attributeValue: 'Small', abbreviation: 'S' },
      { id: 'siz-2', attributeValue: 'Medium', abbreviation: 'M' },
      { id: 'siz-3', attributeValue: 'Large', abbreviation: 'L' },
      { id: 'siz-4', attributeValue: 'Extra Large', abbreviation: 'XL' },
    ],
  },
];

export const INITIAL_BRANDS: import('../types').BrandRecord[] = [
  {
    id: 'ddd',
    brandName: 'ddd',
    description: 'vbnm,',
    defaults: [],
    timeAgoText: 'now',
    commentsCount: 0,
    isLiked: false,
    createdOn: new Date(Date.now() - 12 * 3600000).toISOString(),
    lastUpdatedOn: new Date().toISOString(),
  },
];

export const INITIAL_WAREHOUSE_RECORDS: import('../types').WarehouseRecord[] = [
  {
    id: 'Taşıma Halindeki Ürünler - AD',
    warehouseName: 'Taşıma Halindeki Ürünler',
    status: 'Enabled',
    company: 'Avalon (Demo)',
    account: '',
    isGroupWarehouse: false,
    isRejectedWarehouse: false,
    parentWarehouse: 'Tüm Depolar - AD',
    customer: '',
    phoneNo: '',
    mobileNo: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    pin: '',
    warehouseType: '',
    defaultInTransitWarehouse: '',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Bitmiş Ürünler - AD',
    warehouseName: 'Bitmiş Ürünler',
    status: 'Enabled',
    company: 'Avalon (Demo)',
    account: '',
    isGroupWarehouse: false,
    isRejectedWarehouse: false,
    parentWarehouse: 'Tüm Depolar - AD',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Devam Eden İşler - AD',
    warehouseName: 'Devam Eden İşler',
    status: 'Enabled',
    company: 'Avalon (Demo)',
    account: '',
    isGroupWarehouse: false,
    isRejectedWarehouse: false,
    parentWarehouse: 'Tüm Depolar - AD',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Mağazalar - AD',
    warehouseName: 'Mağazalar',
    status: 'Enabled',
    company: 'Avalon (Demo)',
    account: '',
    isGroupWarehouse: false,
    isRejectedWarehouse: false,
    parentWarehouse: 'Tüm Depolar - AD',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Tüm Depolar - AD',
    warehouseName: 'Tüm Depolar',
    status: 'Enabled',
    company: 'Avalon (Demo)',
    account: '',
    isGroupWarehouse: true,
    isRejectedWarehouse: false,
    parentWarehouse: '',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Taşıma Halindeki Ürünler - A',
    warehouseName: 'Taşıma Halindeki Ürünler',
    status: 'Enabled',
    company: 'Avalon',
    account: '',
    isGroupWarehouse: false,
    isRejectedWarehouse: false,
    parentWarehouse: 'Tüm Depolar - A',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Bitmiş Ürünler - A',
    warehouseName: 'Bitmiş Ürünler',
    status: 'Enabled',
    company: 'Avalon',
    account: '',
    isGroupWarehouse: false,
    isRejectedWarehouse: false,
    parentWarehouse: 'Tüm Depolar - A',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Devam Eden İşler - A',
    warehouseName: 'Devam Eden İşler',
    status: 'Enabled',
    company: 'Avalon',
    account: '',
    isGroupWarehouse: false,
    isRejectedWarehouse: false,
    parentWarehouse: 'Tüm Depolar - A',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Mağazalar - A',
    warehouseName: 'Mağazalar',
    status: 'Enabled',
    company: 'Avalon',
    account: '',
    isGroupWarehouse: false,
    isRejectedWarehouse: false,
    parentWarehouse: 'Tüm Depolar - A',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Tüm Depolar - A',
    warehouseName: 'Tüm Depolar',
    status: 'Enabled',
    company: 'Avalon',
    account: '',
    isGroupWarehouse: true,
    isRejectedWarehouse: false,
    parentWarehouse: '',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
];

export const INITIAL_UOM_RECORDS: import('../types').UOMRecord[] = [
  {
    id: 'Abampere',
    uomName: 'Abampere',
    status: 'Enabled',
    category: 'Electric Current',
    symbol: '',
    commonCode: '',
    description: '',
    mustBeWholeNumber: false,
    enabled: true,
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Acre',
    uomName: 'Acre',
    status: 'Enabled',
    category: 'Area',
    symbol: '',
    commonCode: '',
    description: '',
    mustBeWholeNumber: false,
    enabled: true,
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Acre (US)',
    uomName: 'Acre (US)',
    status: 'Enabled',
    category: 'Area',
    symbol: '',
    commonCode: '',
    description: '',
    mustBeWholeNumber: false,
    enabled: true,
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Ampere',
    uomName: 'Ampere',
    status: 'Enabled',
    category: 'Electric Current',
    symbol: '',
    commonCode: '',
    description: '',
    mustBeWholeNumber: false,
    enabled: true,
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Ampere-Hour',
    uomName: 'Ampere-Hour',
    status: 'Enabled',
    category: 'Electrical Charge',
    symbol: '',
    commonCode: '',
    description: '',
    mustBeWholeNumber: false,
    enabled: true,
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Ampere-Minute',
    uomName: 'Ampere-Minute',
    status: 'Enabled',
    category: 'Electrical Charge',
    symbol: '',
    commonCode: '',
    description: '',
    mustBeWholeNumber: false,
    enabled: true,
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Ampere-Second',
    uomName: 'Ampere-Second',
    status: 'Enabled',
    category: 'Electrical Charge',
    symbol: '',
    commonCode: '',
    description: '',
    mustBeWholeNumber: false,
    enabled: true,
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Are',
    uomName: 'Are',
    status: 'Enabled',
    category: 'Area',
    symbol: '',
    commonCode: '',
    description: '',
    mustBeWholeNumber: false,
    enabled: true,
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Area',
    uomName: 'Area',
    status: 'Enabled',
    category: '',
    symbol: '',
    commonCode: '',
    description: '',
    mustBeWholeNumber: false,
    enabled: true,
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Arshin',
    uomName: 'Arshin',
    status: 'Enabled',
    category: 'Length',
    symbol: '',
    commonCode: '',
    description: '',
    mustBeWholeNumber: false,
    enabled: true,
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Atmosphere',
    uomName: 'Atmosphere',
    status: 'Enabled',
    category: 'Pressure',
    symbol: '',
    commonCode: '',
    description: '',
    mustBeWholeNumber: false,
    enabled: true,
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Bar',
    uomName: 'Bar',
    status: 'Enabled',
    category: 'Pressure',
    symbol: '',
    commonCode: '',
    description: '',
    mustBeWholeNumber: false,
    enabled: true,
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Barleycorn',
    uomName: 'Barleycorn',
    status: 'Enabled',
    category: 'Length',
    symbol: '',
    commonCode: '',
    description: '',
    mustBeWholeNumber: false,
    enabled: true,
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Barrel (Oil)',
    uomName: 'Barrel (Oil)',
    status: 'Enabled',
    category: 'Volume',
    symbol: '',
    commonCode: '',
    description: '',
    mustBeWholeNumber: false,
    enabled: true,
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Nos',
    uomName: 'Nos',
    status: 'Enabled',
    category: 'Unit',
    symbol: 'Nos',
    commonCode: '',
    description: 'Numbers',
    mustBeWholeNumber: true,
    enabled: true,
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Box',
    uomName: 'Box',
    status: 'Enabled',
    category: 'Unit',
    symbol: 'Box',
    commonCode: '',
    description: '',
    mustBeWholeNumber: true,
    enabled: true,
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Kg',
    uomName: 'Kg',
    status: 'Enabled',
    category: 'Mass',
    symbol: 'Kg',
    commonCode: 'KGM',
    description: 'Kilogram',
    mustBeWholeNumber: false,
    enabled: true,
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Meter',
    uomName: 'Meter',
    status: 'Enabled',
    category: 'Length',
    symbol: 'm',
    commonCode: 'MTR',
    description: 'Meter',
    mustBeWholeNumber: false,
    enabled: true,
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Litre',
    uomName: 'Litre',
    status: 'Enabled',
    category: 'Volume',
    symbol: 'L',
    commonCode: 'LTR',
    description: 'Litre',
    mustBeWholeNumber: false,
    enabled: true,
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'Unit',
    uomName: 'Unit',
    status: 'Enabled',
    category: 'Unit',
    symbol: 'Unit',
    commonCode: 'C62',
    description: 'One single item',
    mustBeWholeNumber: true,
    enabled: true,
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
];

export const INITIAL_UOM_CONVERSION_FACTORS: import('../types').UOMConversionFactorRecord[] = [
  {
    id: 'MAT-UOM-CNV-00235',
    category: 'Mass',
    fromUOM: 'Gram',
    toUOM: 'Ounce',
    value: '0.035274000',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'MAT-UOM-CNV-00234',
    category: 'Mass',
    fromUOM: 'Pound',
    toUOM: 'Ounce',
    value: '16',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'MAT-UOM-CNV-00233',
    category: 'Agriculture',
    fromUOM: 'Percent',
    toUOM: 'Parts Per Million',
    value: '10,000',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'MAT-UOM-CNV-00232',
    category: 'Agriculture',
    fromUOM: 'Percent',
    toUOM: 'Percent',
    value: '1',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'MAT-UOM-CNV-00231',
    category: 'Magnetic Induction',
    fromUOM: 'Gauss',
    toUOM: 'Tesla',
    value: '0.000100000',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'MAT-UOM-CNV-00230',
    category: 'Magnetic Induction',
    fromUOM: 'Gauss',
    toUOM: 'Gauss',
    value: '1',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'MAT-UOM-CNV-00229',
    category: 'Magnetic Induction',
    fromUOM: 'Gauss',
    toUOM: 'Gamma',
    value: '100,000',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'MAT-UOM-CNV-00228',
    category: 'Electric Current',
    fromUOM: 'Ampere',
    toUOM: 'Milliampere',
    value: '1,000',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'MAT-UOM-CNV-00227',
    category: 'Electric Current',
    fromUOM: 'Ampere',
    toUOM: 'Kiloampere',
    value: '0.001000000',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'MAT-UOM-CNV-00226',
    category: 'Electric Current',
    fromUOM: 'Ampere',
    toUOM: 'EMU of current',
    value: '0.100000000',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'MAT-UOM-CNV-00225',
    category: 'Electric Current',
    fromUOM: 'Ampere',
    toUOM: 'Biot',
    value: '0.100000000',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'MAT-UOM-CNV-00224',
    category: 'Electric Current',
    fromUOM: 'Ampere',
    toUOM: 'Abampere',
    value: '0.100000000',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'MAT-UOM-CNV-00223',
    category: 'Electric Current',
    fromUOM: 'Ampere',
    toUOM: 'Ampere',
    value: '1',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
  {
    id: 'MAT-UOM-CNV-00222',
    category: 'Electrical Charge',
    fromUOM: 'Coulomb',
    toUOM: 'Nanocoulomb',
    value: '1,000,000,000',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: '3 months ago',
  },
];

export const INITIAL_SERIAL_NOS: import('../types').SerialNoRecord[] = [
  {
    id: 'SR-00001',
    serialNo: 'SR-00001',
    itemCode: 'SKU002: Laptop',
    status: 'Active',
    warehouse: 'Bitmiş Ürünler - AD',
    company: 'Avalon (Demo)',
    warrantyExpiryDate: '2027-11-10',
    amcExpiryDate: '2028-11-10',
    workOrder: '',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: 'Administrator',
  },
  {
    id: 'SR-00002',
    serialNo: 'SR-00002',
    itemCode: 'adad',
    status: 'Active',
    warehouse: 'Stores - AD',
    company: 'Avalon (Demo)',
    warrantyExpiryDate: '2027-05-15',
    amcExpiryDate: '',
    workOrder: 'MFG-WO-2026-00012',
    isLiked: false,
    createdOn: '2 M',
    commentsCount: 1,
    lastEdited: '2 months ago',
    createdBy: 'Administrator',
  },
  {
    id: 'SR-00003',
    serialNo: 'SR-00003',
    itemCode: 'SKU-001',
    status: 'Delivered',
    warehouse: 'Mərkəzi Baş Anbar',
    company: 'Avalon (Demo)',
    warrantyExpiryDate: '2026-12-31',
    amcExpiryDate: '2027-12-31',
    workOrder: '',
    isLiked: false,
    createdOn: '1 M',
    commentsCount: 0,
    lastEdited: '1 month ago',
    createdBy: 'Administrator',
  },
  {
    id: 'SR-00004',
    serialNo: 'SR-00004',
    itemCode: 'SKU-002',
    status: 'Expired',
    warehouse: 'Devam Eden İşler - AD',
    company: 'Avalon',
    warrantyExpiryDate: '2025-01-01',
    amcExpiryDate: '',
    workOrder: '',
    isLiked: false,
    createdOn: '5 M',
    commentsCount: 0,
    lastEdited: '5 months ago',
    createdBy: 'Administrator',
  },
];

export const INITIAL_BATCHES: import('../types').BatchRecord[] = [
  {
    id: 'BATCH-2026-00001',
    batchId: 'BATCH-2026-00001',
    item: 'SKU002: Laptop',
    manufacturingDate: '10-11-2026',
    batchUOM: 'Nos',
    expiryDate: '10-11-2028',
    useBatchWiseValuation: false,
    allowNegativeStock: false,
    description: 'Primary production batch for high performance business laptop.',
    status: 'Active',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: 'Administrator',
  },
  {
    id: 'BATCH-2026-00002',
    batchId: 'BATCH-2026-00002',
    item: 'adad',
    manufacturingDate: '05-10-2026',
    batchUOM: 'Nos',
    expiryDate: '05-10-2027',
    useBatchWiseValuation: true,
    allowNegativeStock: false,
    description: 'Trial run for item adad components.',
    status: 'Active',
    isLiked: false,
    createdOn: '2 M',
    commentsCount: 1,
    lastEdited: '2 months ago',
    createdBy: 'Administrator',
  },
  {
    id: 'BATCH-2026-00003',
    batchId: 'BATCH-2026-00003',
    item: 'SKU-001',
    manufacturingDate: '01-08-2026',
    batchUOM: 'Nos',
    expiryDate: '01-08-2029',
    useBatchWiseValuation: false,
    allowNegativeStock: false,
    description: 'Standard inventory batch for SKU-001.',
    status: 'Active',
    isLiked: false,
    createdOn: '1 M',
    commentsCount: 0,
    lastEdited: '1 month ago',
    createdBy: 'Administrator',
  },
  {
    id: 'BATCH-2026-00004',
    batchId: 'BATCH-2026-00004',
    item: 'SKU-002',
    manufacturingDate: '15-01-2025',
    batchUOM: 'Kg',
    expiryDate: '15-01-2026',
    useBatchWiseValuation: false,
    allowNegativeStock: true,
    description: 'Expired raw material batch.',
    status: 'Expired',
    isLiked: false,
    createdOn: '5 M',
    commentsCount: 0,
    lastEdited: '5 months ago',
    createdBy: 'Administrator',
  },
];

export const INITIAL_SERIAL_AND_BATCH_BUNDLES: import('../types').SerialAndBatchBundleRecord[] = [
  {
    id: 'SABB-2026-00001',
    namingSeries: 'SABB-.########',
    company: 'Avalon (Demo)',
    hasSerialNo: true,
    hasBatchNo: false,
    itemCode: 'SKU002: Laptop',
    warehouse: 'Bitmiş Ürünler - AD',
    typeOfTransaction: 'Inward',
    items: [
      { id: 'row-1', serialNo: 'SR-00001', qty: 1, warehouse: 'Bitmiş Ürünler - AD' },
    ],
    voucherType: 'Purchase Receipt',
    voucherNo: 'MAT-PR-2026-00001',
    isCancelled: false,
    isPacked: false,
    postingDatetime: '2026-11-10 14:30:00',
    status: 'Draft',
    isLiked: false,
    createdOn: '3 M',
    commentsCount: 0,
    lastEdited: '3 months ago',
    createdBy: 'Administrator',
  },
  {
    id: 'SABB-2026-00002',
    namingSeries: 'SABB-.########',
    company: 'Avalon (Demo)',
    hasSerialNo: false,
    hasBatchNo: true,
    itemCode: 'adad',
    warehouse: 'Stores - AD',
    typeOfTransaction: 'Outward',
    items: [
      { id: 'row-1', batchNo: 'BATCH-2026-00002', qty: 5, warehouse: 'Stores - AD' },
    ],
    voucherType: 'Delivery Note',
    voucherNo: 'MAT-DN-2026-00001',
    isCancelled: false,
    isPacked: true,
    postingDatetime: '2026-11-08 11:15:00',
    status: 'Submitted',
    isLiked: false,
    createdOn: '2 M',
    commentsCount: 1,
    lastEdited: '2 months ago',
    createdBy: 'Administrator',
  },
  {
    id: 'SABB-2026-00003',
    namingSeries: 'SABB-.########',
    company: 'Avalon (Demo)',
    hasSerialNo: true,
    hasBatchNo: true,
    itemCode: 'SKU-001',
    warehouse: 'Mərkəzi Baş Anbar',
    typeOfTransaction: 'Inward',
    items: [
      { id: 'row-1', serialNo: 'SR-00003', batchNo: 'BATCH-2026-00003', qty: 1, warehouse: 'Mərkəzi Baş Anbar' },
    ],
    voucherType: 'Stock Entry',
    voucherNo: 'MAT-STE-2026-00001',
    isCancelled: false,
    isPacked: false,
    postingDatetime: '2026-11-05 09:00:00',
    status: 'Draft',
    isLiked: false,
    createdOn: '1 M',
    commentsCount: 0,
    lastEdited: '1 month ago',
    createdBy: 'Administrator',
  },
];

export const INITIAL_INVENTORY_DIMENSIONS: import('../types').InventoryDimensionRecord[] = [
  {
    id: 'dsf',
    dimensionName: 'dsf',
    referenceDocument: 'API Request Log',
    applyToAllInventoryDocuments: true,
    validateNegativeStock: false,
    fetchValueFrom: '',
    mandatory: false,
    mandatoryDependsOn: '',
    createdOn: '1 d',
    lastEdited: 'yesterday',
    createdBy: 'You',
    commentsCount: 0,
    isLiked: false,
  },
  {
    id: 'Branch',
    dimensionName: 'Branch',
    referenceDocument: 'Branch',
    applyToAllInventoryDocuments: true,
    validateNegativeStock: true,
    fetchValueFrom: '',
    mandatory: true,
    mandatoryDependsOn: 'doc.t_warehouse and doc.qty > 0',
    createdOn: '2 M',
    lastEdited: '2 months ago',
    createdBy: 'Administrator',
    commentsCount: 1,
    isLiked: false,
  },
  {
    id: 'Department',
    dimensionName: 'Department',
    referenceDocument: 'Department',
    applyToAllInventoryDocuments: false,
    validateNegativeStock: false,
    fetchValueFrom: '',
    mandatory: false,
    mandatoryDependsOn: '',
    createdOn: '3 M',
    lastEdited: '3 months ago',
    createdBy: 'Administrator',
    commentsCount: 0,
    isLiked: false,
  },
];

export const INITIAL_SHIPPING_RULES: import('../types').ShippingRuleRecord[] = [
  {
    id: 'Standard Shipping - Selling',
    shippingRuleLabel: 'Standard Shipping - Selling',
    shippingRuleType: 'Selling',
    disabled: false,
    company: 'Avalon (Demo)',
    shippingAccount: 'Shipping Charges - AD',
    calculateBasedOn: 'Fixed',
    shippingAmount: 25.0,
    countries: [
      { id: 'c-1', country: 'Azerbaijan' },
      { id: 'c-2', country: 'Turkey' },
    ],
    status: 'Active',
    createdOn: '2 d',
    lastEdited: '2 days ago',
    createdBy: 'Administrator',
    commentsCount: 0,
    isLiked: false,
  },
  {
    id: 'Express Air Freight',
    shippingRuleLabel: 'Express Air Freight',
    shippingRuleType: 'Selling',
    disabled: false,
    company: 'Avalon (Demo)',
    shippingAccount: 'Freight and Forwarding Charges - AD',
    calculateBasedOn: 'Net Weight',
    shippingAmount: 85.0,
    countries: [
      { id: 'c-1', country: 'United States' },
      { id: 'c-2', country: 'Germany' },
    ],
    status: 'Active',
    createdOn: '1 w',
    lastEdited: '1 week ago',
    createdBy: 'Administrator',
    commentsCount: 2,
    isLiked: true,
  },
  {
    id: 'Inward Supplier Delivery',
    shippingRuleLabel: 'Inward Supplier Delivery',
    shippingRuleType: 'Buying',
    disabled: false,
    company: 'Avalon (Demo)',
    shippingAccount: 'Expenses Included In Valuation - AD',
    calculateBasedOn: 'Net Total',
    shippingAmount: 45.0,
    countries: [],
    status: 'Active',
    createdOn: '2 w',
    lastEdited: '2 weeks ago',
    createdBy: 'Administrator',
    commentsCount: 0,
    isLiked: false,
  },
];

export const INITIAL_ITEM_ALTERNATIVES: import('../types').ItemAlternativeRecord[] = [
  {
    id: 'ALT-00001',
    itemCode: 'SKU002: Laptop',
    alternativeItemCode: 'SKU001',
    twoWay: true,
    createdOn: '2 d',
    lastEdited: '2 days ago',
    createdBy: 'Administrator',
    commentsCount: 0,
    isLiked: false,
  },
  {
    id: 'ALT-00002',
    itemCode: 'SKU005: Raw Steel Sheets',
    alternativeItemCode: 'SKU010: Power Supply 650W',
    twoWay: false,
    createdOn: '1 w',
    lastEdited: '1 week ago',
    createdBy: 'Administrator',
    commentsCount: 1,
    isLiked: true,
  },
  {
    id: 'ALT-00003',
    itemCode: 'adad',
    alternativeItemCode: 'SKU-002',
    twoWay: true,
    createdOn: '3 w',
    lastEdited: '3 weeks ago',
    createdBy: 'Administrator',
    commentsCount: 0,
    isLiked: false,
  },
];

export const INITIAL_DELIVERY_TRIPS: import('../types').DeliveryTripRecord[] = [
  {
    id: 'MAT-DT-2026-00001',
    series: 'MAT-DT-.YYYY.-',
    company: 'Avalon (Demo)',
    initialEmailNotificationSent: false,
    driver: 'Rashad Aliyev',
    vehicle: '99-BA-123 (Mercedes Sprinter)',
    driverAddress: 'Baku, Heydar Aliyev Ave. 115',
    departureTime: '2026-11-11 09:30:00',
    status: 'In Transit',
    deliveryStops: [
      {
        id: 'stop-1',
        customer: 'Grant Plastics Ltd.',
        addressName: 'Grant Plastics HQ, Baku',
        locked: true,
        deliveryNote: 'MAT-DN-2026-00001',
        estimatedArrival: '2026-11-11 11:30:00',
      },
      {
        id: 'stop-2',
        customer: 'Summit Traders Ltd.',
        addressName: 'Summit Warehouse 2, Sumqayit',
        locked: false,
        deliveryNote: 'MAT-DN-2026-00002',
        estimatedArrival: '2026-11-11 14:00:00',
      },
    ],
    createdOn: '1 d',
    lastEdited: '1 day ago',
    createdBy: 'Administrator',
    commentsCount: 0,
    isLiked: false,
  },
  {
    id: 'MAT-DT-2026-00002',
    series: 'MAT-DT-.YYYY.-',
    company: 'Avalon (Demo)',
    initialEmailNotificationSent: true,
    driver: 'Kamran Mammadov',
    vehicle: '10-TX-456 (Ford Transit)',
    driverAddress: 'Sumqayit, S. Vurgun str. 12',
    departureTime: '2026-11-10 14:00:00',
    status: 'Completed',
    deliveryStops: [
      {
        id: 'stop-1',
        customer: 'AzLogistics Supply MMC',
        addressName: 'AzLogistics Hub, Lokbatan',
        locked: true,
        deliveryNote: 'MAT-DN-2026-00003',
        estimatedArrival: '2026-11-10 16:30:00',
      },
    ],
    createdOn: '3 d',
    lastEdited: '2 days ago',
    createdBy: 'Administrator',
    commentsCount: 1,
    isLiked: true,
  },
  {
    id: 'MAT-DT-2026-00003',
    series: 'MAT-DT-.YYYY.-',
    company: 'Avalon (Demo)',
    initialEmailNotificationSent: false,
    driver: 'Elvin Huseynov',
    vehicle: '90-ZZ-789 (Isuzu Truck)',
    driverAddress: 'Ganja, N. Ganjavi ave. 45',
    departureTime: '2026-11-12 08:00:00',
    status: 'Draft',
    deliveryStops: [],
    createdOn: 'now',
    lastEdited: 'just now',
    createdBy: 'Administrator',
    commentsCount: 0,
    isLiked: false,
  },
];

export const INITIAL_QUALITY_INSPECTION_TEMPLATES: import('../types').QualityInspectionTemplateRecord[] = [
  {
    id: 'dfghjkl',
    templateName: 'dfghjkl',
    parameters: [
      {
        id: 'param-1',
        parameter: 'dtyui',
        acceptanceCriteria: '',
        numeric: true,
        minValue: 0,
        maxValue: 0,
      },
    ],
    createdOn: '1 d',
    lastEdited: 'yesterday',
    createdBy: 'You',
    commentsCount: 0,
    isLiked: false,
  },
  {
    id: 'QIT-ELEC-001',
    templateName: 'Electrical Safety & Compliance',
    parameters: [
      {
        id: 'param-1',
        parameter: 'Insulation Resistance',
        acceptanceCriteria: '>= 500 MOhm',
        numeric: true,
        minValue: 500,
        maxValue: 10000,
      },
      {
        id: 'param-2',
        parameter: 'Dielectric Strength Test',
        acceptanceCriteria: 'No breakdown at 2500V',
        numeric: false,
      },
      {
        id: 'param-3',
        parameter: 'Ground Continuity',
        acceptanceCriteria: '<= 0.1 Ohm',
        numeric: true,
        minValue: 0,
        maxValue: 0.1,
      },
    ],
    createdOn: '3 d',
    lastEdited: '2 days ago',
    createdBy: 'Administrator',
    commentsCount: 1,
    isLiked: true,
  },
  {
    id: 'QIT-PKG-002',
    templateName: 'Packaging & Seal Integrity',
    parameters: [
      {
        id: 'param-1',
        parameter: 'Seal Peel Strength',
        acceptanceCriteria: 'Within standard tolerance',
        numeric: true,
        minValue: 15,
        maxValue: 30,
      },
      {
        id: 'param-2',
        parameter: 'Barcode Legibility Scan',
        acceptanceCriteria: 'Grade A verification',
        numeric: false,
      },
    ],
    createdOn: '5 d',
    lastEdited: '4 days ago',
    createdBy: 'Administrator',
    commentsCount: 0,
    isLiked: false,
  },
];















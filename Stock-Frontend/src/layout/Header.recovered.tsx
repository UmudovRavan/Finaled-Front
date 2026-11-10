import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Home,
  MoreHorizontal,
  Sun,
  Moon,
  Check,
  RotateCw,
  Plus,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  List,
  Table,
  Gauge,
  Kanban,
  FileSpreadsheet,
  Shield,
  Sliders,
  Settings,
} from 'lucide-react';
import {
  useTheme,
  useLanguage,
  useStockEntry,
  usePurchaseReceipt,
  useDeliveryNote,
  useMaterialRequest,
  usePickList,
  useStockReconciliation,
  useLandedCostVoucher,
  useRepostItemValuation,
  usePackingSlip,
  useItem,
  useItemGroup,
  useItemAttribute,
  useBrand,
  useWarehouse,
  useUOM,
  useUOMConversionFactor,
  useSerialNo,
  useBatch,
  useSerialAndBatchBundle,
  useInventoryDimension,
  useShippingRule,
  useItemAlternative,
  useDeliveryTrip,
  useQualityInspectionTemplate,
} from '../context';
import type { StockViewMode } from '../types';

interface HeaderProps {
  onPageOptions?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onPageOptions }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const [isPageMenuOpen, setIsPageMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // Stock Entry specific dropdowns
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [isSavedFiltersOpen, setIsSavedFiltersOpen] = useState(false);
  const [isStockMoreMenuOpen, setIsStockMoreMenuOpen] = useState(false);

  // Detail actions dropdowns
  const [isDetailCreateOpen, setIsDetailCreateOpen] = useState(false);
  const [isDetailGetItemsOpen, setIsDetailGetItemsOpen] = useState(false);
  const [isDetailPreviewOpen, setIsDetailPreviewOpen] = useState(false);

  // Stock Ledger specific dropdowns
  const [isLedgerActionsOpen, setIsLedgerActionsOpen] = useState(false);
  const [isLedgerMoreOpen, setIsLedgerMoreOpen] = useState(false);

  // Stock Balance specific dropdowns
  const [isBalanceActionsOpen, setIsBalanceActionsOpen] = useState(false);
  const [isBalanceMoreOpen, setIsBalanceMoreOpen] = useState(false);

  const pageMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const viewMenuRef = useRef<HTMLDivElement>(null);
  const savedFiltersRef = useRef<HTMLDivElement>(null);
  const stockMoreMenuRef = useRef<HTMLDivElement>(null);
  const detailCreateRef = useRef<HTMLDivElement>(null);
  const detailGetItemsRef = useRef<HTMLDivElement>(null);
  const detailPreviewRef = useRef<HTMLDivElement>(null);
  const ledgerActionsRef = useRef<HTMLDivElement>(null);
  const ledgerMoreRef = useRef<HTMLDivElement>(null);
  const balanceActionsRef = useRef<HTMLDivElement>(null);
  const balanceMoreRef = useRef<HTMLDivElement>(null);

  const isNewStockEntry = location.pathname.startsWith('/stock-entry/new');
  const isStockEntryList = location.pathname === '/stock-entry';
  const isStockEntryDetail =
    location.pathname.startsWith('/stock-entry/') && !isNewStockEntry;
  const isStockEntry = isStockEntryList || isNewStockEntry || isStockEntryDetail;

  const isNewPurchaseReceipt = location.pathname.startsWith('/purchase-receipt/new');
  const isPurchaseReceiptList = location.pathname === '/purchase-receipt';
  const isPurchaseReceiptDetail =
    location.pathname.startsWith('/purchase-receipt/') && !isNewPurchaseReceipt;
  const isPurchaseReceipt =
    isPurchaseReceiptList || isNewPurchaseReceipt || isPurchaseReceiptDetail;

  const isNewDeliveryNote = location.pathname.startsWith('/delivery-note/new');
  const isDeliveryNoteList = location.pathname === '/delivery-note';
  const isDeliveryNoteDetail =
    location.pathname.startsWith('/delivery-note/') && !isNewDeliveryNote;
  const isDeliveryNote =
    isDeliveryNoteList || isNewDeliveryNote || isDeliveryNoteDetail;

  const isNewMaterialRequest = location.pathname.startsWith('/material-request/new');
  const isMaterialRequestList = location.pathname === '/material-request';
  const isMaterialRequestDetail =
    location.pathname.startsWith('/material-request/') && !isNewMaterialRequest;
  const isMaterialRequest =
    isMaterialRequestList || isNewMaterialRequest || isMaterialRequestDetail;

  const isNewPickList = location.pathname.startsWith('/pick-list/new');
  const isPickListList = location.pathname === '/pick-list';
  const isPickListDetail =
    location.pathname.startsWith('/pick-list/') && !isNewPickList;
  const isPickList = isPickListList || isNewPickList || isPickListDetail;

  const isNewStockReconciliation = location.pathname.startsWith('/stock-reconciliation/new');
  const isStockReconciliationList =
    location.pathname === '/stock-reconciliation' || location.pathname === '/tools/reconciliation';
  const isStockReconciliationDetail =
    location.pathname.startsWith('/stock-reconciliation/') && !isNewStockReconciliation;
  const isStockReconciliation =
    isStockReconciliationList || isNewStockReconciliation || isStockReconciliationDetail;

  const isNewLandedCostVoucher = location.pathname.startsWith('/landed-cost-voucher/new');
  const isLandedCostVoucherList =
    location.pathname === '/landed-cost-voucher' || location.pathname === '/tools/landed-cost';
  const isLandedCostVoucherDetail =
    location.pathname.startsWith('/landed-cost-voucher/') && !isNewLandedCostVoucher;
  const isLandedCostVoucher =
    isLandedCostVoucherList || isNewLandedCostVoucher || isLandedCostVoucherDetail;

  const isNewRepostItemValuation = location.pathname.startsWith('/repost-item-valuation/new');
  const isRepostItemValuationList =
    location.pathname === '/repost-item-valuation' || location.pathname === '/tools/repost-valuation';
  const isRepostItemValuationDetail =
    location.pathname.startsWith('/repost-item-valuation/') && !isNewRepostItemValuation;
  const isRepostItemValuation =
    isRepostItemValuationList || isNewRepostItemValuation || isRepostItemValuationDetail;

  const isNewPackingSlip = location.pathname.startsWith('/packing-slip/new');
  const isPackingSlipList =
    location.pathname === '/packing-slip' || location.pathname === '/tools/packing-slip';
  const isPackingSlipDetail =
    location.pathname.startsWith('/packing-slip/') && !isNewPackingSlip;
  const isPackingSlip =
    isPackingSlipList || isNewPackingSlip || isPackingSlipDetail;

  const isNewItem =
    location.pathname.startsWith('/item/new') ||
    location.pathname.startsWith('/items/new');
  const isItemDetail =
    (location.pathname.startsWith('/item/') && !isNewItem) ||
    (location.pathname.startsWith('/items/') && !isNewItem);
  const isItemList =
    (location.pathname === '/item' ||
      location.pathname === '/items' ||
      location.pathname === '/products') &&
    !isNewItem &&
    !isItemDetail;
  const isItem = isItemList || isNewItem || isItemDetail;

  const isNewItemGroup =
    location.pathname.startsWith('/item-group/new') ||
    location.pathname.startsWith('/item-groups/new');
  const isItemGroupDetail =
    (location.pathname.startsWith('/item-group/') && !isNewItemGroup) ||
    (location.pathname.startsWith('/item-groups/') && !isNewItemGroup);
  const isItemGroupList =
    (location.pathname === '/item-group' || location.pathname === '/item-groups') &&
    !isNewItemGroup &&
    !isItemGroupDetail;
  const isItemGroup = isItemGroupList || isNewItemGroup || isItemGroupDetail;

  const isNewItemAttribute =
    location.pathname.startsWith('/item-attribute/new') ||
    location.pathname.startsWith('/item-attributes/new');
  const isItemAttributeDetail =
    (location.pathname.startsWith('/item-attribute/') && !isNewItemAttribute) ||
    (location.pathname.startsWith('/item-attributes/') && !isNewItemAttribute);
  const isItemAttributeList =
    (location.pathname === '/item-attribute' || location.pathname === '/item-attributes') &&
    !isNewItemAttribute &&
    !isItemAttributeDetail;
  const isItemAttribute = isItemAttributeList || isNewItemAttribute || isItemAttributeDetail;

  const isNewBrand =
    location.pathname.startsWith('/brand/new') ||
    location.pathname.startsWith('/brands/new');
  const isBrandDetail =
    (location.pathname.startsWith('/brand/') && !isNewBrand) ||
    (location.pathname.startsWith('/brands/') && !isNewBrand);
  const isBrandList =
    (location.pathname === '/brand' || location.pathname === '/brands') &&
    !isNewBrand &&
    !isBrandDetail;
  const isBrand = isBrandList || isNewBrand || isBrandDetail;

  const isNewWarehouse =
    location.pathname.startsWith('/warehouse/new') ||
    location.pathname.startsWith('/warehouses/new');
  const isWarehouseDetail =
    (location.pathname.startsWith('/warehouse/') && !isNewWarehouse) ||
    (location.pathname.startsWith('/warehouses/') && !isNewWarehouse);
  const isWarehouseList =
    (location.pathname === '/warehouse' || location.pathname === '/warehouses') &&
    !isNewWarehouse &&
    !isWarehouseDetail;
  const isWarehouse = isWarehouseList || isNewWarehouse || isWarehouseDetail;

  const isNewUom =
    location.pathname.startsWith('/uom/new') ||
    location.pathname.startsWith('/uoms/new');
  const isUomDetail =
    (location.pathname.startsWith('/uom/') && !isNewUom) ||
    (location.pathname.startsWith('/uoms/') && !isNewUom);
  const isUomList =
    (location.pathname === '/uom' || location.pathname === '/uoms') &&
    !isNewUom &&
    !isUomDetail;
  const isUom = isUomList || isNewUom || isUomDetail;

  const isNewUomConversionFactor =
    location.pathname.startsWith('/uom-conversion-factor/new') ||
    location.pathname.startsWith('/uom-conversion-factors/new');
  const isUomConversionFactorDetail =
    (location.pathname.startsWith('/uom-conversion-factor/') && !isNewUomConversionFactor) ||
    (location.pathname.startsWith('/uom-conversion-factors/') && !isNewUomConversionFactor);
  const isUomConversionFactorList =
    (location.pathname === '/uom-conversion-factor' || location.pathname === '/uom-conversion-factors') &&
    !isNewUomConversionFactor &&
    !isUomConversionFactorDetail;
  const isUomConversionFactor =
    isUomConversionFactorList || isNewUomConversionFactor || isUomConversionFactorDetail;

  const isNewSerialNo =
    location.pathname.startsWith('/serial-no/new') ||
    location.pathname.startsWith('/serial-nos/new');
  const isSerialNoDetail =
    (location.pathname.startsWith('/serial-no/') && !isNewSerialNo) ||
    (location.pathname.startsWith('/serial-nos/') && !isNewSerialNo);
  const isSerialNoList =
    (location.pathname === '/serial-no' || location.pathname === '/serial-nos') &&
    !isNewSerialNo &&
    !isSerialNoDetail;
  const isSerialNo = isSerialNoList || isNewSerialNo || isSerialNoDetail;

  const isNewBatch =
    location.pathname.startsWith('/batch/new') ||
    location.pathname.startsWith('/batches/new') ||
    location.pathname.startsWith('/batch-no/new') ||
    location.pathname.startsWith('/batch-nos/new');
  const isBatchDetail =
    (location.pathname.startsWith('/batch/') && !isNewBatch) ||
    (location.pathname.startsWith('/batches/') && !isNewBatch) ||
    (location.pathname.startsWith('/batch-no/') && !isNewBatch) ||
    (location.pathname.startsWith('/batch-nos/') && !isNewBatch);
  const isBatchList =
    (location.pathname === '/batch' ||
      location.pathname === '/batches' ||
      location.pathname === '/batch-no' ||
      location.pathname === '/batch-nos') &&
    !isNewBatch &&
    !isBatchDetail;
  const isBatch = isBatchList || isNewBatch || isBatchDetail;

  const isNewSabb =
    location.pathname.startsWith('/serial-and-batch-bundle/new') ||
    location.pathname.startsWith('/serial-and-batch-bundles/new');
  const isSabbDetail =
    (location.pathname.startsWith('/serial-and-batch-bundle/') && !isNewSabb) ||
    (location.pathname.startsWith('/serial-and-batch-bundles/') && !isNewSabb);
  const isSabbList =
    (location.pathname === '/serial-and-batch-bundle' ||
      location.pathname === '/serial-and-batch-bundles') &&
    !isNewSabb &&
    !isSabbDetail;
  const isSabb = isSabbList || isNewSabb || isSabbDetail;

  const isNewInventoryDimension =
    location.pathname.startsWith('/inventory-dimension/new') ||
    location.pathname.startsWith('/inventory-dimensions/new');
  const isInventoryDimensionDetail =
    (location.pathname.startsWith('/inventory-dimension/') && !isNewInventoryDimension) ||
    (location.pathname.startsWith('/inventory-dimensions/') && !isNewInventoryDimension);
  const isInventoryDimensionList =
    (location.pathname === '/inventory-dimension' ||
      location.pathname === '/inventory-dimensions') &&
    !isNewInventoryDimension &&
    !isInventoryDimensionDetail;
  const isInventoryDimension =
    isInventoryDimensionList || isNewInventoryDimension || isInventoryDimensionDetail;

  const isNewShippingRule =
    location.pathname.startsWith('/shipping-rule/new') ||
    location.pathname.startsWith('/shipping-rules/new');
  const isShippingRuleDetail =
    (location.pathname.startsWith('/shipping-rule/') && !isNewShippingRule) ||
    (location.pathname.startsWith('/shipping-rules/') && !isNewShippingRule);
  const isShippingRuleList =
    (location.pathname === '/shipping-rule' ||
      location.pathname === '/shipping-rules') &&
    !isNewShippingRule &&
    !isShippingRuleDetail;
  const isShippingRule =
    isShippingRuleList || isNewShippingRule || isShippingRuleDetail;

  const isNewItemAlternative =
    location.pathname.startsWith('/item-alternative/new') ||
    location.pathname.startsWith('/item-alternatives/new');
  const isItemAlternativeDetail =
    (location.pathname.startsWith('/item-alternative/') && !isNewItemAlternative) ||
    (location.pathname.startsWith('/item-alternatives/') && !isNewItemAlternative);
  const isItemAlternativeList =
    (location.pathname === '/item-alternative' ||
      location.pathname === '/item-alternatives') &&
    !isNewItemAlternative &&
    !isItemAlternativeDetail;
  const isItemAlternative =
    isItemAlternativeList || isNewItemAlternative || isItemAlternativeDetail;

  const isNewDeliveryTrip =
    location.pathname.startsWith('/delivery-trip/new') ||
    location.pathname.startsWith('/delivery-trips/new');
  const isDeliveryTripDetail =
    (location.pathname.startsWith('/delivery-trip/') && !isNewDeliveryTrip) ||
    (location.pathname.startsWith('/delivery-trips/') && !isNewDeliveryTrip);
  const isDeliveryTripList =
    (location.pathname === '/delivery-trip' ||
      location.pathname === '/delivery-trips') &&
    !isNewDeliveryTrip &&
    !isDeliveryTripDetail;
  const isDeliveryTrip =
    isDeliveryTripList || isNewDeliveryTrip || isDeliveryTripDetail;

  const isNewQualityInspectionTemplate =
    location.pathname.startsWith('/quality-inspection-template/new') ||
    location.pathname.startsWith('/quality-inspection-templates/new');
  const isQualityInspectionTemplateDetail =
    (location.pathname.startsWith('/quality-inspection-template/') && !isNewQualityInspectionTemplate) ||
    (location.pathname.startsWith('/quality-inspection-templates/') && !isNewQualityInspectionTemplate);
  const isQualityInspectionTemplateList =
    (location.pathname === '/quality-inspection-template' ||
      location.pathname === '/quality-inspection-templates') &&
    !isNewQualityInspectionTemplate &&
    !isQualityInspectionTemplateDetail;
  const isQualityInspectionTemplate =
    isQualityInspectionTemplateList || isNewQualityInspectionTemplate || isQualityInspectionTemplateDetail;

  const isStockLedger =
    location.pathname.startsWith('/reports/stock-ledger') ||
    location.pathname.startsWith('/reports/ledger') ||
    location.pathname.includes('Stock%20Ledger');

  const isStockBalance =
    location.pathname.startsWith('/reports/stock-balance') ||
    location.pathname.startsWith('/reports/balance') ||
    location.pathname.includes('Stock%20Balance');

  const isQuickStockBalance =
    location.pathname.startsWith('/reports/quick-stock-balance') ||
    location.pathname.startsWith('/quick-stock-balance');

  const isStockProjectedQty =
    location.pathname.startsWith('/reports/stock-projected-qty') ||
    location.pathname.includes('Stock%20Projected%20Qty');

  const isStockAnalytics =
    location.pathname.startsWith('/reports/stock-analytics') ||
    location.pathname.includes('Stock%20Analytics');

  const isStockAgeing =
    location.pathname.startsWith('/reports/stock-ageing') ||
    location.pathname.includes('Stock%20Ageing');

  const isItemPriceStock =
    location.pathname.startsWith('/reports/item-price-stock') ||
    location.pathname.includes('Item%20Price%20Stock');

  const isPurchaseReceiptTrends =
    location.pathname.startsWith('/reports/purchase-receipt-trends') ||
    location.pathname.includes('Purchase%20Receipt%20Trends');

  const isDeliveryNoteTrends =
    location.pathname.startsWith('/reports/delivery-note-trends') ||
    location.pathname.includes('Delivery%20Note%20Trends');

  const isPurchaseReceiptTrends =
    location.pathname.startsWith('/reports/purchase-receipt-trends') ||
    location.pathname.includes('Purchase%20Receipt%20Trends');

  const isDeliveryNoteTrends =
    location.pathname.startsWith('/reports/delivery-note-trends') ||
    location.pathname.includes('Delivery%20Note%20Trends');

  const isReports = location.pathname.startsWith('/reports');
  const reportSlug = isReports ? location.pathname.replace(/^\/reports\/?/, '').split('/')[0] : '';
  const reportDisplayTitle = reportSlug
    ? reportSlug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : 'Reports';

  const isDashboard = location.pathname.startsWith('/dashboard');

  const stockEntry = useStockEntry();
  const purchaseReceipt = usePurchaseReceipt();
  const deliveryNote = useDeliveryNote();
  const materialRequest = useMaterialRequest();
  const pickList = usePickList();
  const stockReconciliation = useStockReconciliation();
  const landedCostVoucher = useLandedCostVoucher();
  const repostItemValuation = useRepostItemValuation();
  const packingSlip = usePackingSlip();
  const item = useItem();
  const itemGroup = useItemGroup();
  const itemAttribute = useItemAttribute();
  const brand = useBrand();
  const warehouse = useWarehouse();
  const uom = useUOM();
  const uomConversionFactor = useUOMConversionFactor();
  const serialNo = useSerialNo();
  const batch = useBatch();
  const sabb = useSerialAndBatchBundle();
  const inventoryDimension = useInventoryDimension();
  const shippingRule = useShippingRule();
  const itemAlternative = useItemAlternative();
  const deliveryTrip = useDeliveryTrip();
  const qualityInspectionTemplate = useQualityInspectionTemplate();




  const detailId = isStockEntryDetail
    ? location.pathname.replace('/stock-entry/', '')
    : '';
  const currentDetailEntry =
    stockEntry.entries.find((e) => e.id === detailId) || stockEntry.entries[0];

  const currentDetailIndex = currentDetailEntry
    ? stockEntry.entries.findIndex((e) => e.id === currentDetailEntry.id)
    : 0;
  const prevDetailEntry =
    currentDetailIndex > 0 ? stockEntry.entries[currentDetailIndex - 1] : null;
  const nextDetailEntry =
    currentDetailIndex < stockEntry.entries.length - 1
      ? stockEntry.entries[currentDetailIndex + 1]
      : null;

  const prDetailId = isPurchaseReceiptDetail
    ? location.pathname.replace('/purchase-receipt/', '')
    : '';
  const currentPrDetailEntry =
    purchaseReceipt.receipts.find((r) => r.id === prDetailId) || purchaseReceipt.receipts[0];

  const currentPrDetailIndex = currentPrDetailEntry
    ? purchaseReceipt.receipts.findIndex((r) => r.id === currentPrDetailEntry.id)
    : 0;
  const prevPrDetailEntry =
    currentPrDetailIndex > 0 ? purchaseReceipt.receipts[currentPrDetailIndex - 1] : null;
  const nextPrDetailEntry =
    currentPrDetailIndex < purchaseReceipt.receipts.length - 1
      ? purchaseReceipt.receipts[currentPrDetailIndex + 1]
      : null;

  const dnDetailId = isDeliveryNoteDetail
    ? location.pathname.replace('/delivery-note/', '')
    : '';
  const currentDnDetailEntry =
    deliveryNote.notes.find((n) => n.id === dnDetailId) || deliveryNote.notes[0];

  const currentDnDetailIndex = currentDnDetailEntry
    ? deliveryNote.notes.findIndex((n) => n.id === currentDnDetailEntry.id)
    : 0;
  const prevDnDetailEntry =
    currentDnDetailIndex > 0 ? deliveryNote.notes[currentDnDetailIndex - 1] : null;
  const nextDnDetailEntry =
    currentDnDetailIndex < deliveryNote.notes.length - 1
      ? deliveryNote.notes[currentDnDetailIndex + 1]
      : null;

  const mrDetailId = isMaterialRequestDetail
    ? location.pathname.replace('/material-request/', '')
    : '';
  const currentMrDetailEntry =
    materialRequest.requests.find((r) => r.id === mrDetailId) || materialRequest.requests[0];

  const currentMrDetailIndex = currentMrDetailEntry
    ? materialRequest.requests.findIndex((r) => r.id === currentMrDetailEntry.id)
    : 0;
  const prevMrDetailEntry =
    currentMrDetailIndex > 0 ? materialRequest.requests[currentMrDetailIndex - 1] : null;
  const nextMrDetailEntry =
    currentMrDetailIndex < materialRequest.requests.length - 1
      ? materialRequest.requests[currentMrDetailIndex + 1]
      : null;

  const plDetailId = isPickListDetail
    ? location.pathname.replace('/pick-list/', '')
    : '';
  const currentPlDetailEntry =
    pickList.pickLists.find((p) => p.id === plDetailId) || pickList.pickLists[0];

  const currentPlDetailIndex = currentPlDetailEntry
    ? pickList.pickLists.findIndex((p) => p.id === currentPlDetailEntry.id)
    : 0;
  const prevPlDetailEntry =
    currentPlDetailIndex > 0 ? pickList.pickLists[currentPlDetailIndex - 1] : null;
  const nextPlDetailEntry =
    currentPlDetailIndex < pickList.pickLists.length - 1
      ? pickList.pickLists[currentPlDetailIndex + 1]
      : null;

  const srDetailId = isStockReconciliationDetail
    ? location.pathname.replace('/stock-reconciliation/', '')
    : '';
  const currentSrDetailEntry =
    stockReconciliation.reconciliations.find((s) => s.id === srDetailId) ||
    stockReconciliation.reconciliations[0];

  const currentSrDetailIndex = currentSrDetailEntry
    ? stockReconciliation.reconciliations.findIndex(
        (s) => s.id === currentSrDetailEntry.id
      )
    : 0;
  const prevSrDetailEntry =
    currentSrDetailIndex > 0
      ? stockReconciliation.reconciliations[currentSrDetailIndex - 1]
      : null;
  const nextSrDetailEntry =
    currentSrDetailIndex < stockReconciliation.reconciliations.length - 1
      ? stockReconciliation.reconciliations[currentSrDetailIndex + 1]
      : null;

  const lcvDetailId = isLandedCostVoucherDetail
    ? location.pathname.replace('/landed-cost-voucher/', '')
    : '';
  const currentLcvDetailEntry =
    landedCostVoucher.vouchers.find((v) => v.id === lcvDetailId) ||
    landedCostVoucher.vouchers[0];

  const currentLcvDetailIndex = currentLcvDetailEntry
    ? landedCostVoucher.vouchers.findIndex(
        (v) => v.id === currentLcvDetailEntry.id
      )
    : 0;
  const prevLcvDetailEntry =
    currentLcvDetailIndex > 0
      ? landedCostVoucher.vouchers[currentLcvDetailIndex - 1]
      : null;
  const nextLcvDetailEntry =
    currentLcvDetailIndex < landedCostVoucher.vouchers.length - 1
      ? landedCostVoucher.vouchers[currentLcvDetailIndex + 1]
      : null;

  const rivDetailId = isRepostItemValuationDetail
    ? location.pathname.replace('/repost-item-valuation/', '')
    : '';
  const currentRivDetailEntry =
    repostItemValuation.valuations.find((v) => v.id === rivDetailId) ||
    repostItemValuation.valuations[0];

  const currentRivDetailIndex = currentRivDetailEntry
    ? repostItemValuation.valuations.findIndex(
        (v) => v.id === currentRivDetailEntry.id
      )
    : 0;
  const prevRivDetailEntry =
    currentRivDetailIndex > 0
      ? repostItemValuation.valuations[currentRivDetailIndex - 1]
      : null;
  const nextRivDetailEntry =
    currentRivDetailIndex < repostItemValuation.valuations.length - 1
      ? repostItemValuation.valuations[currentRivDetailIndex + 1]
      : null;

  const pacDetailId = isPackingSlipDetail
    ? location.pathname.replace('/packing-slip/', '')
    : '';
  const currentPacDetailEntry =
    packingSlip.slips.find((s) => s.id === pacDetailId) ||
    packingSlip.slips[0];

  const currentPacDetailIndex = currentPacDetailEntry
    ? packingSlip.slips.findIndex(
        (s) => s.id === currentPacDetailEntry.id
      )
    : 0;
  const prevPacDetailEntry =
    currentPacDetailIndex > 0
      ? packingSlip.slips[currentPacDetailIndex - 1]
      : null;
  const nextPacDetailEntry =
    currentPacDetailIndex < packingSlip.slips.length - 1
      ? packingSlip.slips[currentPacDetailIndex + 1]
      : null;

  const itDetailId = isItemDetail
    ? location.pathname.replace(/^\/(?:item|items)\//, '').split('#')[0]
    : '';
  const currentItDetailEntry =
    item.items.find((i) => i.id === itDetailId || i.itemCode === itDetailId) ||
    item.items[0] || {
      id: itDetailId || 'adad',
      itemName: itDetailId || 'adad',
      status: 'Enabled' as const,
    };
  const currentItDetailIndex = currentItDetailEntry
    ? item.items.findIndex((i) => i.id === currentItDetailEntry.id)
    : 0;
  const prevItDetailEntry =
    currentItDetailIndex > 0 ? item.items[currentItDetailIndex - 1] : null;
  const nextItDetailEntry =
    currentItDetailIndex >= 0 && currentItDetailIndex < item.items.length - 1
      ? item.items[currentItDetailIndex + 1]
      : null;

  const igDetailId = isItemGroupDetail
    ? decodeURIComponent(location.pathname.replace(/^\/(?:item-group|item-groups)\//, '').split('#')[0])
    : '';
  const currentIgDetailEntry =
    itemGroup.groups.find(
      (g) =>
        g.id.toLowerCase() === igDetailId.toLowerCase() ||
        g.itemGroupName.toLowerCase() === igDetailId.toLowerCase()
    ) ||
    itemGroup.groups[0] || {
      id: igDetailId || 'Demo Item Group',
      itemGroupName: igDetailId || 'Demo Item Group',
      isGroup: false,
    };
  const currentIgDetailIndex = currentIgDetailEntry
    ? itemGroup.groups.findIndex((g) => g.id === currentIgDetailEntry.id)
    : 0;
  const prevIgDetailEntry =
    currentIgDetailIndex > 0 ? itemGroup.groups[currentIgDetailIndex - 1] : null;
  const nextIgDetailEntry =
    currentIgDetailIndex >= 0 && currentIgDetailIndex < itemGroup.groups.length - 1
      ? itemGroup.groups[currentIgDetailIndex + 1]
      : null;

  const iaDetailId = isItemAttributeDetail
    ? decodeURIComponent(location.pathname.replace(/^\/(?:item-attribute|item-attributes)\//, '').split('#')[0])
    : '';
  const currentIaDetailEntry =
    itemAttribute.attributes.find(
      (a) =>
        a.id.toLowerCase() === iaDetailId.toLowerCase() ||
        a.attributeName.toLowerCase() === iaDetailId.toLowerCase()
    ) ||
    itemAttribute.attributes[0] || {
      id: iaDetailId || 'Colour',
      attributeName: iaDetailId || 'Colour',
      status: 'Enabled' as const,
    };
  const currentIaDetailIndex = currentIaDetailEntry
    ? itemAttribute.attributes.findIndex((a) => a.id === currentIaDetailEntry.id)
    : 0;
  const prevIaDetailEntry =
    currentIaDetailIndex > 0 ? itemAttribute.attributes[currentIaDetailIndex - 1] : null;
  const nextIaDetailEntry =
    currentIaDetailIndex >= 0 && currentIaDetailIndex < itemAttribute.attributes.length - 1
      ? itemAttribute.attributes[currentIaDetailIndex + 1]
      : null;

  const brandDetailId = isBrandDetail
    ? decodeURIComponent(location.pathname.replace(/^\/(?:brand|brands)\//, '').split('#')[0])
    : '';
  const currentBrandDetailEntry =
    brand.brands.find(
      (b) =>
        b.id.toLowerCase() === brandDetailId.toLowerCase() ||
        b.brandName.toLowerCase() === brandDetailId.toLowerCase()
    ) ||
    brand.brands[0] || {
      id: brandDetailId || 'ddd',
      brandName: brandDetailId || 'ddd',
      description: 'vbnm,',
    };
  const currentBrandDetailIndex = currentBrandDetailEntry
    ? brand.brands.findIndex((b) => b.id === currentBrandDetailEntry.id)
    : 0;
  const prevBrandDetailEntry =
    currentBrandDetailIndex > 0 ? brand.brands[currentBrandDetailIndex - 1] : null;
  const nextBrandDetailEntry =
    currentBrandDetailIndex >= 0 && currentBrandDetailIndex < brand.brands.length - 1
      ? brand.brands[currentBrandDetailIndex + 1]
      : null;

  const warehouseDetailId = isWarehouseDetail
    ? decodeURIComponent(location.pathname.replace(/^\/(?:warehouse|warehouses)\//, '').split('#')[0])
    : '';
  const currentWarehouseDetailEntry =
    warehouse.warehouses.find(
      (w) =>
        w.id.toLowerCase() === warehouseDetailId.toLowerCase() ||
        w.warehouseName.toLowerCase() === warehouseDetailId.toLowerCase()
    ) ||
    warehouse.warehouses[0] || {
      id: warehouseDetailId || 'Taşıma Halindeki Ürünler - AD',
      warehouseName: warehouseDetailId || 'Taşıma Halindeki Ürünler',
      status: 'Enabled' as const,
      company: 'Avalon (Demo)',
    };
  const currentWarehouseDetailIndex = currentWarehouseDetailEntry
    ? warehouse.warehouses.findIndex((w) => w.id === currentWarehouseDetailEntry.id)
    : 0;
  const prevWarehouseDetailEntry =
    currentWarehouseDetailIndex > 0 ? warehouse.warehouses[currentWarehouseDetailIndex - 1] : null;
  const nextWarehouseDetailEntry =
    currentWarehouseDetailIndex >= 0 && currentWarehouseDetailIndex < warehouse.warehouses.length - 1
      ? warehouse.warehouses[currentWarehouseDetailIndex + 1]
      : null;

  const uomDetailId = isUomDetail
    ? decodeURIComponent(location.pathname.replace(/^\/(?:uom|uoms)\//, '').split('#')[0])
    : '';
  const currentUomDetailEntry =
    uom.uoms.find(
      (u) =>
        u.id.toLowerCase() === uomDetailId.toLowerCase() ||
        u.uomName.toLowerCase() === uomDetailId.toLowerCase()
    ) ||
    uom.uoms[0] || {
      id: uomDetailId || 'Abampere',
      uomName: uomDetailId || 'Abampere',
      status: 'Enabled' as const,
      category: 'Electric Current',
    };
  const currentUomDetailIndex = currentUomDetailEntry
    ? uom.uoms.findIndex((u) => u.id === currentUomDetailEntry.id)
    : 0;
  const prevUomDetailEntry =
    currentUomDetailIndex > 0 ? uom.uoms[currentUomDetailIndex - 1] : null;
  const nextUomDetailEntry =
    currentUomDetailIndex >= 0 && currentUomDetailIndex < uom.uoms.length - 1
      ? uom.uoms[currentUomDetailIndex + 1]
      : null;

  const uomConversionFactorDetailId = isUomConversionFactorDetail
    ? decodeURIComponent(location.pathname.replace(/^\/(?:uom-conversion-factor|uom-conversion-factors)\//, '').split('#')[0])
    : '';
  const currentUcfDetailEntry =
    uomConversionFactor.factors.find(
      (f) => f.id.toLowerCase() === uomConversionFactorDetailId.toLowerCase()
    ) ||
    uomConversionFactor.factors[0] || {
      id: uomConversionFactorDetailId || 'MAT-UOM-CNV-00235',
      category: 'Mass',
      fromUOM: 'Gram',
      toUOM: 'Ounce',
      value: '0.035274000',
    };
  const currentUcfDetailIndex = currentUcfDetailEntry
    ? uomConversionFactor.factors.findIndex((f) => f.id === currentUcfDetailEntry.id)
    : 0;
  const prevUcfDetailEntry =
    currentUcfDetailIndex > 0 ? uomConversionFactor.factors[currentUcfDetailIndex - 1] : null;
  const nextUcfDetailEntry =
    currentUcfDetailIndex >= 0 && currentUcfDetailIndex < uomConversionFactor.factors.length - 1
      ? uomConversionFactor.factors[currentUcfDetailIndex + 1]
      : null;

  const serialNoDetailId = isSerialNoDetail
    ? decodeURIComponent(location.pathname.replace(/^\/(?:serial-no|serial-nos)\//, '').split('#')[0])
    : '';
  const currentSerialNoDetailEntry =
    serialNo.serialNos.find(
      (s) =>
        s.id.toLowerCase() === serialNoDetailId.toLowerCase() ||
        s.serialNo.toLowerCase() === serialNoDetailId.toLowerCase()
    ) ||
    serialNo.serialNos[0] || {
      id: serialNoDetailId || 'SR-00001',
      serialNo: serialNoDetailId || 'SR-00001',
      status: 'Active' as const,
      itemCode: 'SKU002: Laptop',
      company: 'Avalon (Demo)',
    };
  const currentSerialNoDetailIndex = currentSerialNoDetailEntry
    ? serialNo.serialNos.findIndex((s) => s.id === currentSerialNoDetailEntry.id)
    : 0;
  const prevSerialNoDetailEntry =
    currentSerialNoDetailIndex > 0 ? serialNo.serialNos[currentSerialNoDetailIndex - 1] : null;
  const nextSerialNoDetailEntry =
    currentSerialNoDetailIndex >= 0 && currentSerialNoDetailIndex < serialNo.serialNos.length - 1
      ? serialNo.serialNos[currentSerialNoDetailIndex + 1]
      : null;

  const batchDetailId = isBatchDetail
    ? decodeURIComponent(
        location.pathname
          .replace(/^\/(?:batch-no|batch-nos|batch|batches)\//, '')
          .split('#')[0]
      )
    : '';
  const currentBatchDetailEntry =
    batch.batches.find(
      (b) =>
        b.id.toLowerCase() === batchDetailId.toLowerCase() ||
        b.batchId.toLowerCase() === batchDetailId.toLowerCase()
    ) ||
    batch.batches[0] || {
      id: batchDetailId || 'BATCH-2026-00001',
      batchId: batchDetailId || 'BATCH-2026-00001',
      item: 'SKU002: Laptop',
      status: 'Active' as const,
    };
  const currentBatchDetailIndex = currentBatchDetailEntry
    ? batch.batches.findIndex((b) => b.id === currentBatchDetailEntry.id)
    : 0;
  const prevBatchDetailEntry =
    currentBatchDetailIndex > 0 ? batch.batches[currentBatchDetailIndex - 1] : null;
  const nextBatchDetailEntry =
    currentBatchDetailIndex >= 0 && currentBatchDetailIndex < batch.batches.length - 1
      ? batch.batches[currentBatchDetailIndex + 1]
      : null;

  const sabbDetailId = isSabbDetail
    ? decodeURIComponent(
        location.pathname
          .replace(/^\/(?:serial-and-batch-bundle|serial-and-batch-bundles)\//, '')
          .split('#')[0]
      )
    : '';
  const currentSabbDetailEntry =
    sabb.bundles.find(
      (b) =>
        b.id.toLowerCase() === sabbDetailId.toLowerCase()
    ) ||
    sabb.bundles[0] || {
      id: sabbDetailId || 'SABB-2026-00001',
      namingSeries: 'SABB-.########',
      company: 'Avalon (Demo)',
      itemCode: 'SKU002: Laptop',
      warehouse: 'Bitmiş Ürünler - AD',
      typeOfTransaction: 'Inward' as const,
      status: 'Draft' as const,
      items: [],
    };
  const currentSabbDetailIndex = currentSabbDetailEntry
    ? sabb.bundles.findIndex((b) => b.id === currentSabbDetailEntry.id)
    : 0;
  const prevSabbDetailEntry =
    currentSabbDetailIndex > 0 ? sabb.bundles[currentSabbDetailIndex - 1] : null;
  const nextSabbDetailEntry =
    currentSabbDetailIndex >= 0 && currentSabbDetailIndex < sabb.bundles.length - 1
      ? sabb.bundles[currentSabbDetailIndex + 1]
      : null;

  const inventoryDimensionDetailId = isInventoryDimensionDetail
    ? decodeURIComponent(
        location.pathname
          .replace(/^\/(?:inventory-dimension|inventory-dimensions)\//, '')
          .split('#')[0]
      )
    : '';
  const currentInventoryDimensionDetailEntry =
    inventoryDimension.dimensions.find(
      (d) =>
        d.id.toLowerCase() === inventoryDimensionDetailId.toLowerCase() ||
        d.dimensionName.toLowerCase() === inventoryDimensionDetailId.toLowerCase()
    ) ||
    inventoryDimension.dimensions[0] || {
      id: inventoryDimensionDetailId || 'dsf',
      dimensionName: inventoryDimensionDetailId || 'dsf',
      referenceDocument: 'API Request Log',
    };
  const currentInventoryDimensionDetailIndex = currentInventoryDimensionDetailEntry
    ? inventoryDimension.dimensions.findIndex((d) => d.id === currentInventoryDimensionDetailEntry.id)
    : 0;
  const prevInventoryDimensionDetailEntry =
    currentInventoryDimensionDetailIndex > 0
      ? inventoryDimension.dimensions[currentInventoryDimensionDetailIndex - 1]
      : null;
  const nextInventoryDimensionDetailEntry =
    currentInventoryDimensionDetailIndex >= 0 &&
    currentInventoryDimensionDetailIndex < inventoryDimension.dimensions.length - 1
      ? inventoryDimension.dimensions[currentInventoryDimensionDetailIndex + 1]
      : null;

  const shippingRuleDetailId = isShippingRuleDetail
    ? decodeURIComponent(
        location.pathname
          .replace(/^\/(?:shipping-rule|shipping-rules)\//, '')
          .split('#')[0]
      )
    : '';
  const currentShippingRuleDetailEntry =
    shippingRule.shippingRules.find(
      (s) =>
        s.id.toLowerCase() === shippingRuleDetailId.toLowerCase() ||
        s.shippingRuleLabel.toLowerCase() === shippingRuleDetailId.toLowerCase()
    ) ||
    shippingRule.shippingRules[0] || {
      id: shippingRuleDetailId || 'Standard Shipping - Selling',
      shippingRuleLabel: shippingRuleDetailId || 'Standard Shipping - Selling',
      shippingRuleType: 'Selling' as const,
      disabled: false,
    };
  const currentShippingRuleDetailIndex = currentShippingRuleDetailEntry
    ? shippingRule.shippingRules.findIndex((s) => s.id === currentShippingRuleDetailEntry.id)
    : 0;
  const prevShippingRuleDetailEntry =
    currentShippingRuleDetailIndex > 0
      ? shippingRule.shippingRules[currentShippingRuleDetailIndex - 1]
      : null;
  const nextShippingRuleDetailEntry =
    currentShippingRuleDetailIndex >= 0 &&
    currentShippingRuleDetailIndex < shippingRule.shippingRules.length - 1
      ? shippingRule.shippingRules[currentShippingRuleDetailIndex + 1]
      : null;

  const itemAlternativeDetailId = isItemAlternativeDetail
    ? decodeURIComponent(
        location.pathname
          .replace(/^\/(?:item-alternative|item-alternatives)\//, '')
          .split('#')[0]
      )
    : '';
  const currentItemAlternativeDetailEntry =
    itemAlternative.alternatives.find(
      (a) =>
        a.id.toLowerCase() === itemAlternativeDetailId.toLowerCase() ||
        a.itemCode.toLowerCase() === itemAlternativeDetailId.toLowerCase()
    ) ||
    itemAlternative.alternatives[0] || {
      id: itemAlternativeDetailId || 'ALT-00001',
      itemCode: 'ITEM-001',
      alternativeItemCode: 'ITEM-002',
      twoWay: true,
    };
  const currentItemAlternativeDetailIndex = currentItemAlternativeDetailEntry
    ? itemAlternative.alternatives.findIndex((a) => a.id === currentItemAlternativeDetailEntry.id)
    : 0;
  const prevItemAlternativeDetailEntry =
    currentItemAlternativeDetailIndex > 0
      ? itemAlternative.alternatives[currentItemAlternativeDetailIndex - 1]
      : null;
  const nextItemAlternativeDetailEntry =
    currentItemAlternativeDetailIndex >= 0 &&
    currentItemAlternativeDetailIndex < itemAlternative.alternatives.length - 1
      ? itemAlternative.alternatives[currentItemAlternativeDetailIndex + 1]
      : null;

  const deliveryTripDetailId = isDeliveryTripDetail
    ? decodeURIComponent(
        location.pathname
          .replace(/^\/(?:delivery-trip|delivery-trips)\//, '')
          .split('#')[0]
      )
    : '';
  const currentDeliveryTripDetailEntry =
    deliveryTrip.trips.find(
      (t) =>
        t.id.toLowerCase() === deliveryTripDetailId.toLowerCase() ||
        t.driver.toLowerCase() === deliveryTripDetailId.toLowerCase()
    ) ||
    deliveryTrip.trips[0] || {
      id: deliveryTripDetailId || 'MAT-DT-2026-00001',
      driver: 'Elvin Mammadov',
      vehicle: '99-AA-100',
      company: 'Avalon (Demo)',
      series: 'MAT-DT-.YYYY.-',
      initialEmailNotificationSent: false,
      driverAddress: 'Baku, Azerbaijan',
      departureTime: '2026-11-10 10:00',
      status: 'Draft' as const,
      deliveryStops: [],
    };
  const currentDeliveryTripDetailIndex = currentDeliveryTripDetailEntry
    ? deliveryTrip.trips.findIndex((t) => t.id === currentDeliveryTripDetailEntry.id)
    : 0;
  const prevDeliveryTripDetailEntry =
    currentDeliveryTripDetailIndex > 0
      ? deliveryTrip.trips[currentDeliveryTripDetailIndex - 1]
      : null;
  const nextDeliveryTripDetailEntry =
    currentDeliveryTripDetailIndex >= 0 &&
    currentDeliveryTripDetailIndex < deliveryTrip.trips.length - 1
      ? deliveryTrip.trips[currentDeliveryTripDetailIndex + 1]
      : null;

  const qitDetailId = isQualityInspectionTemplateDetail
    ? decodeURIComponent(
        location.pathname
          .replace(/^\/(?:quality-inspection-template|quality-inspection-templates)\//, '')
          .split('#')[0]
      )
    : '';
  const currentQitDetailEntry =
    qualityInspectionTemplate.templates.find(
      (t) =>
        t.id.toLowerCase() === qitDetailId.toLowerCase() ||
        t.templateName.toLowerCase() === qitDetailId.toLowerCase()
    ) ||
    qualityInspectionTemplate.templates[0] || {
      id: qitDetailId || 'dfghjkl',
      templateName: qitDetailId || 'dfghjkl',
      parameters: [],
    };
  const currentQitDetailIndex = currentQitDetailEntry
    ? qualityInspectionTemplate.templates.findIndex((t) => t.id === currentQitDetailEntry.id)
    : 0;
  const prevQitDetailEntry =
    currentQitDetailIndex > 0
      ? qualityInspectionTemplate.templates[currentQitDetailIndex - 1]
      : null;
  const nextQitDetailEntry =
    currentQitDetailIndex >= 0 &&
    currentQitDetailIndex < qualityInspectionTemplate.templates.length - 1
      ? qualityInspectionTemplate.templates[currentQitDetailIndex + 1]
      : null;











  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pageMenuRef.current && !pageMenuRef.current.contains(e.target as Node)) {
        setIsPageMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
      if (viewMenuRef.current && !viewMenuRef.current.contains(e.target as Node)) {
        setIsViewMenuOpen(false);
      }
      if (savedFiltersRef.current && !savedFiltersRef.current.contains(e.target as Node)) {
        setIsSavedFiltersOpen(false);
      }
      if (stockMoreMenuRef.current && !stockMoreMenuRef.current.contains(e.target as Node)) {
        setIsStockMoreMenuOpen(false);
      }
      if (detailCreateRef.current && !detailCreateRef.current.contains(e.target as Node)) {
        setIsDetailCreateOpen(false);
      }
      if (detailGetItemsRef.current && !detailGetItemsRef.current.contains(e.target as Node)) {
        setIsDetailGetItemsOpen(false);
      }
      if (detailPreviewRef.current && !detailPreviewRef.current.contains(e.target as Node)) {
        setIsDetailPreviewOpen(false);
      }
      if (ledgerActionsRef.current && !ledgerActionsRef.current.contains(e.target as Node)) {
        setIsLedgerActionsOpen(false);
      }
      if (ledgerMoreRef.current && !ledgerMoreRef.current.contains(e.target as Node)) {
        setIsLedgerMoreOpen(false);
      }
      if (balanceActionsRef.current && !balanceActionsRef.current.contains(e.target as Node)) {
        setIsBalanceActionsOpen(false);
      }
      if (balanceMoreRef.current && !balanceMoreRef.current.contains(e.target as Node)) {
        setIsBalanceMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'az', label: 'Azərbaycan', flag: '🇦🇿' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  ];

  const currentFlag = languages.find((l) => l.code === language)?.flag || '🇦🇿';

  const viewOptions: { id: StockViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'list', label: 'List View', icon: <List className="w-3.5 h-3.5" /> },
    { id: 'report', label: 'Report View', icon: <Table className="w-3.5 h-3.5" /> },
    { id: 'dashboard', label: 'Dashboard View', icon: <Gauge className="w-3.5 h-3.5" /> },
    { id: 'kanban', label: 'Kanban View', icon: <Kanban className="w-3.5 h-3.5" /> },
  ];

  const activeViewMode = isPurchaseReceiptList
    ? purchaseReceipt?.viewMode
    : isDeliveryNoteList
    ? deliveryNote?.viewMode
    : isMaterialRequestList
    ? materialRequest?.viewMode
    : isPickListList
    ? pickList?.viewMode
    : isStockReconciliationList
    ? stockReconciliation?.viewMode
    : isLandedCostVoucherList
    ? landedCostVoucher?.viewMode
    : isRepostItemValuationList
    ? repostItemValuation?.viewMode
    : isPackingSlipList
    ? packingSlip?.viewMode
    : isItemList
    ? item?.viewMode
    : isItemGroupList
    ? itemGroup?.viewMode
    : isItemAttributeList
    ? itemAttribute?.viewMode
    : isBrandList
    ? brand?.viewMode
    : isWarehouseList
    ? warehouse?.viewMode
    : isUomList
    ? uom?.viewMode
    : isUomConversionFactorList
    ? uomConversionFactor?.viewMode
    : isSerialNoList
    ? serialNo?.viewMode
    : isBatchList
    ? batch?.viewMode
    : isSabbList
    ? sabb?.viewMode
    : isInventoryDimensionList
    ? inventoryDimension?.viewMode
    : isShippingRuleList
    ? shippingRule?.viewMode
    : isItemAlternativeList
    ? itemAlternative?.viewMode
    : isDeliveryTripList
    ? deliveryTrip?.viewMode
    : isQualityInspectionTemplateList
    ? qualityInspectionTemplate?.viewMode
    : stockEntry?.viewMode;

  const currentViewLabel =
    viewOptions.find((v) => v.id === activeViewMode)?.label || 'List View';

  const stockSavedFilters = [
    'All',
    'Draft',
    'Submitted',
    'Material Receipt',
    'Material Issue',
    'Material Transfer',
    'Manufacture',
    'Repack',
  ];

  const purchaseReceiptSavedFilters = [
    'All',
    'Draft',
    'To Bill',
    'Completed',
    'Cancelled',
  ];

  const deliveryNoteSavedFilters = [
    'All',
    'Draft',
    'To Bill',
    'Completed',
    'Return Issued',
    'Cancelled',
    'Closed',
  ];

  const materialRequestSavedFilters = [
    'All',
    'Draft',
    'Submitted',
    'Pending',
    'Ordered',
    'Issued',
    'Transferred',
    'Cancelled',
  ];

  const pickListSavedFilters = [
    'All',
    'Draft',
    'Open',
    'Completed',
    'Cancelled',
  ];

  const stockReconciliationSavedFilters = [
    'All',
    'Draft',
    'Submitted',
    'Cancelled',
  ];

  const landedCostVoucherSavedFilters = [
    'All',
    'Draft',
    'Submitted',
    'Cancelled',
  ];

  const repostItemValuationSavedFilters = [
    'All',
    'Completed',
    'Queued',
    'In Progress',
    'Failed',
    'Cancelled',
  ];

  const packingSlipSavedFilters = [
    'All',
    'Draft',
    'Submitted',
    'Cancelled',
  ];

  const itemSavedFilters = [
    'All',
    'Enabled',
    'Disabled',
    'Products',
    'Consumable',
    'Demo Item Group',
  ];

  const savedFilterOptions = isPurchaseReceiptList
    ? purchaseReceiptSavedFilters
    : isDeliveryNoteList
    ? deliveryNoteSavedFilters
    : isMaterialRequestList
    ? materialRequestSavedFilters
    : isPickListList
    ? pickListSavedFilters
    : isStockReconciliationList
    ? stockReconciliationSavedFilters
    : isLandedCostVoucherList
    ? landedCostVoucherSavedFilters
    : isRepostItemValuationList
    ? repostItemValuationSavedFilters
    : isPackingSlipList
    ? packingSlipSavedFilters
    : isItemList
    ? itemSavedFilters
    : stockSavedFilters;

  return (
    <header className="sticky top-0 z-30 min-h-[48px] bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#27272A] px-4 sm:px-5 py-1.5 flex flex-wrap items-center justify-between gap-2 transition-colors duration-200">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-[#A1A1AA] select-none">
        <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors" title="Home">
          <Home className="w-3.5 h-3.5 stroke-[1.75]" />
        </Link>
        {isStockEntryDetail ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/stock-entry" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock Entry
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">
              {currentDetailEntry?.title || 'Material Receipt'}
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ml-1 ${
                currentDetailEntry?.status === 'Draft'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-500'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500'
              }`}
            >
              {currentDetailEntry?.status || 'Draft'}
            </span>
          </>
        ) : isNewStockEntry ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/stock-entry" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock Entry
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">New Stock Entry</span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              Not Saved
            </span>
          </>
        ) : isStockEntryList ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Stock Entry</span>
          </>
        ) : isPurchaseReceiptDetail ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/purchase-receipt" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Purchase Receipt
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">
              {currentPrDetailEntry?.supplierName || 'Summit Traders Ltd.'}
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ml-1 ${
                currentPrDetailEntry?.status === 'Draft'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-500'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500'
              }`}
            >
              {currentPrDetailEntry?.status || 'Draft'}
            </span>
          </>
        ) : isNewPurchaseReceipt ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/purchase-receipt" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Purchase Receipt
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">New Purchase Receipt</span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              Not Saved
            </span>
          </>
        ) : isPurchaseReceiptList ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Purchase Receipt</span>
          </>
        ) : isDeliveryNoteDetail ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/delivery-note" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Delivery Note
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">
              {currentDnDetailEntry?.customerName || 'Grant Plastics Ltd.'}
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ml-1 ${
                currentDnDetailEntry?.status === 'Draft'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-500'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500'
              }`}
            >
              {currentDnDetailEntry?.status || 'Draft'}
            </span>
          </>
        ) : isNewDeliveryNote ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/delivery-note" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Delivery Note
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">New Delivery Note</span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              Not Saved
            </span>
          </>
        ) : isDeliveryNoteList ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Delivery Note</span>
          </>
        ) : isMaterialRequestDetail ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/material-request" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Material Request
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">
              {currentMrDetailEntry?.title || 'Material Issue Request for Laptop'}
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ml-1 ${
                currentMrDetailEntry?.status === 'Draft'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-500'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500'
              }`}
            >
              {currentMrDetailEntry?.status || 'Draft'}
            </span>
          </>
        ) : isNewMaterialRequest ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/material-request" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Material Request
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">New Material Request</span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              Not Saved
            </span>
          </>
        ) : isMaterialRequestList ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Material Request</span>
          </>
        ) : isPickListDetail ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/pick-list" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Pick List
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">
              {currentPlDetailEntry?.id || 'STO-PICK-2026-00001'}
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ml-1 ${
                currentPlDetailEntry?.status === 'Draft'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-500'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500'
              }`}
            >
              {currentPlDetailEntry?.status || 'Draft'}
            </span>
          </>
        ) : isNewPickList ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/pick-list" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Pick List
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">New Pick List</span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              Not Saved
            </span>
          </>
        ) : isPickListList ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Pick List</span>
          </>
        ) : isStockReconciliationDetail ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/stock-reconciliation" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock Reconciliation
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">
              {currentSrDetailEntry?.id || 'MAT-RECO-2026-00001'}
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ml-1 ${
                currentSrDetailEntry?.status === 'Draft'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-500'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500'
              }`}
            >
              {currentSrDetailEntry?.status || 'Draft'}
            </span>
          </>
        ) : isNewStockReconciliation ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/stock-reconciliation" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock Reconciliation
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">New Stock Reconciliation</span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              Not Saved
            </span>
          </>
        ) : isStockReconciliationList ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Stock Reconciliation</span>
          </>
        ) : isLandedCostVoucherDetail ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/landed-cost-voucher" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Landed Cost Voucher
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">
              {currentLcvDetailEntry?.id || 'MAT-LCV-2026-00001'}
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ml-1 ${
                currentLcvDetailEntry?.status === 'Draft'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-500'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500'
              }`}
            >
              {currentLcvDetailEntry?.status || 'Draft'}
            </span>
          </>
        ) : isNewLandedCostVoucher ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/landed-cost-voucher" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Landed Cost Voucher
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">New Landed Cost Voucher</span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              Not Saved
            </span>
          </>
        ) : isLandedCostVoucherList ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Landed Cost Voucher</span>
          </>
        ) : isRepostItemValuationDetail ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/repost-item-valuation" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Repost Item Valuation
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">
              {currentRivDetailEntry?.id || 'c3nehrpeg3'}
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ml-1 ${
                currentRivDetailEntry?.status === 'Completed'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : currentRivDetailEntry?.status === 'Queued'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-500'
              }`}
            >
              {currentRivDetailEntry?.status || 'Completed'}
            </span>
          </>
        ) : isNewRepostItemValuation ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/repost-item-valuation" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Repost Item Valuation
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">New Repost Item Valuation</span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              Not Saved
            </span>
          </>
        ) : isRepostItemValuationList ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Repost Item Valuation</span>
          </>
        ) : isPackingSlipDetail ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/packing-slip" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Packing Slip
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">
              {currentPacDetailEntry?.id || 'MAT-PAC-2026-00001'}
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ml-1 ${
                currentPacDetailEntry?.status === 'Draft'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-500'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500'
              }`}
            >
              {currentPacDetailEntry?.status || 'Draft'}
            </span>
          </>
        ) : isNewPackingSlip ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/packing-slip" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Packing Slip
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">New Packing Slip</span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              Not Saved
            </span>
          </>
        ) : isPackingSlipList ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Packing Slip</span>
          </>
        ) : isItemDetail ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/item" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Item
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">
              {currentItDetailEntry?.itemName || currentItDetailEntry?.id || itDetailId || 'adad'}
            </span>
            <span className="bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-[#38BDF8] text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              {currentItDetailEntry?.status || 'Enabled'}
            </span>
          </>
        ) : isNewItem ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/item" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Item
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">New Item</span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              Not Saved
            </span>
          </>
        ) : isBrandDetail ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/brand" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Brand
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">
              {currentBrandDetailEntry?.brandName || currentBrandDetailEntry?.id || brandDetailId || 'ddd'}
            </span>
          </>
        ) : isNewBrand ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/brand" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Brand
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">New Brand</span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              Not Saved
            </span>
          </>
        ) : isBrandList ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Brand</span>
          </>
        ) : isWarehouseDetail ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/warehouse" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Warehouse
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[260px]">
              {currentWarehouseDetailEntry?.id || warehouseDetailId || 'Taşıma Halindeki Ürünler - AD'}
            </span>
            <span className="bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-[#38BDF8] text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              {currentWarehouseDetailEntry?.status || 'Enabled'}
            </span>
          </>
        ) : isNewWarehouse ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/warehouse" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Warehouse
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">New Warehouse</span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              Not Saved
            </span>
          </>
        ) : isWarehouseList ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Warehouse</span>
          </>
        ) : isUomDetail ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/uom" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              UOM
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[260px]">
              {currentUomDetailEntry?.id || uomDetailId || 'Abampere'}
            </span>
            <span className="bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-[#38BDF8] text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              {currentUomDetailEntry?.status || 'Enabled'}
            </span>
          </>
        ) : isNewUom ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/uom" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              UOM
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">New UOM</span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              Not Saved
            </span>
          </>
        ) : isUomList ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">UOM</span>
          </>
        ) : isUomConversionFactorDetail ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/uom-conversion-factor" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              UOM Conversion Factor
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[260px]">
              {currentUcfDetailEntry?.id || uomConversionFactorDetailId || 'MAT-UOM-CNV-00235'}
            </span>
          </>
        ) : isNewUomConversionFactor ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/uom-conversion-factor" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              UOM Conversion Factor
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">New UOM Conversion Factor</span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              Not Saved
            </span>
          </>
        ) : isUomConversionFactorList ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">UOM Conversion Factor</span>
          </>
        ) : isSerialNoDetail ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/serial-no" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Serial No
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[260px]">
              {currentSerialNoDetailEntry?.serialNo || currentSerialNoDetailEntry?.id || serialNoDetailId || 'SR-00001'}
            </span>
            <span className="bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-[#38BDF8] text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              {currentSerialNoDetailEntry?.status || 'Active'}
            </span>
          </>
        ) : isNewSerialNo ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/serial-no" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Serial No
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">New Serial No</span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              Not Saved
            </span>
          </>
        ) : isSerialNoList ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Serial No</span>
          </>
        ) : isBatchDetail ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/batch-no" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Batch
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[260px]">
              {currentBatchDetailEntry?.batchId || currentBatchDetailEntry?.id || batchDetailId || 'BATCH-2026-00001'}
            </span>
            <span className="bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-[#38BDF8] text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              {currentBatchDetailEntry?.status || 'Active'}
            </span>
          </>
        ) : isNewBatch ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/batch-no" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Batch
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">New Batch</span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              Not Saved
            </span>
          </>
        ) : isBatchList ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Batch</span>
          </>
        ) : isSabbDetail ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/serial-and-batch-bundle" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Serial and Batch Bundle
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[260px]">
              {currentSabbDetailEntry?.id || sabbDetailId || 'SABB-2026-00001'}
            </span>
            <span className="bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-[#38BDF8] text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              {currentSabbDetailEntry?.status || 'Draft'}
            </span>
          </>
        ) : isNewSabb ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/serial-and-batch-bundle" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Serial and Batch Bundle
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">New Serial and Batch Bundle</span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              Not Saved
            </span>
          </>
        ) : isSabbList ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Serial and Batch Bundle</span>
          </>
        ) : isInventoryDimensionDetail ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/inventory-dimension" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Inventory Dimension
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[260px]">
              {currentInventoryDimensionDetailEntry?.dimensionName || currentInventoryDimensionDetailEntry?.id || inventoryDimensionDetailId || 'dsf'}
            </span>
          </>
        ) : isNewInventoryDimension ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/inventory-dimension" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Inventory Dimension
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">New Inventory Dimension</span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              Not Saved
            </span>
          </>
        ) : isInventoryDimensionList ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Inventory Dimension</span>
          </>
        ) : isShippingRuleDetail ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/shipping-rule" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Shipping Rule
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[260px]">
              {currentShippingRuleDetailEntry?.shippingRuleLabel || currentShippingRuleDetailEntry?.id || shippingRuleDetailId || 'Standard Shipping - Selling'}
            </span>
          </>
        ) : isNewShippingRule ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/shipping-rule" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Shipping Rule
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">New Shipping Rule</span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              Not Saved
            </span>
          </>
        ) : isShippingRuleList ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Shipping Rule</span>
          </>
        ) : isItemAlternativeDetail ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/item-alternative" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Item Alternative
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[260px]">
              {currentItemAlternativeDetailEntry?.itemCode || currentItemAlternativeDetailEntry?.id || itemAlternativeDetailId || 'ALT-00001'}
            </span>
          </>
        ) : isNewItemAlternative ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/item-alternative" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Item Alternative
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">New Item Alternative</span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              Not Saved
            </span>
          </>
        ) : isItemAlternativeList ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Item Alternative</span>
          </>
        ) : isDeliveryTripDetail ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/delivery-trip" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Delivery Trip
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[260px]">
              {currentDeliveryTripDetailEntry?.id || deliveryTripDetailId || 'Delivery Trip'}
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ml-1 ${
                currentDeliveryTripDetailEntry?.status === 'Completed'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                  : currentDeliveryTripDetailEntry?.status === 'In Transit'
                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                  : currentDeliveryTripDetailEntry?.status === 'Cancelled'
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
              }`}
            >
              {currentDeliveryTripDetailEntry?.status || 'Draft'}
            </span>
          </>
        ) : isNewDeliveryTrip ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/delivery-trip" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Delivery Trip
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">New Delivery Trip</span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              Not Saved
            </span>
          </>
        ) : isDeliveryTripList ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Delivery Trip</span>
          </>
        ) : isQualityInspectionTemplateDetail ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/quality-inspection-template" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Quality Inspection Template
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[260px]">
              {currentQitDetailEntry?.templateName || currentQitDetailEntry?.id || qitDetailId || 'dfghjkl'}
            </span>
          </>
        ) : isNewQualityInspectionTemplate ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/quality-inspection-template" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Quality Inspection Template
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">New Quality Inspection Template</span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              Not Saved
            </span>
          </>
        ) : isQualityInspectionTemplateList ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Quality Inspection Template</span>
          </>
        ) : isItemAttributeDetail ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/item-attribute" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Item Attribute
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">
              {currentIaDetailEntry?.attributeName || currentIaDetailEntry?.id || iaDetailId || 'Colour'}
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ml-1 ${
                currentIaDetailEntry?.status === 'Enabled'
                  ? 'bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-[#38BDF8]'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
              }`}
            >
              {currentIaDetailEntry?.status || 'Enabled'}
            </span>
          </>
        ) : isNewItemAttribute ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/item-attribute" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Item Attribute
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">New Item Attribute</span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              Not Saved
            </span>
          </>
        ) : isItemAttributeList ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Item Attribute</span>
          </>
        ) : isItemGroupDetail ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/item-group" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Item Group
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">
              {currentIgDetailEntry?.itemGroupName || currentIgDetailEntry?.id || igDetailId || 'Demo Item Group'}
            </span>
          </>
        ) : isNewItemGroup ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/item-group" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Item Group
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">New Item Group</span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              Not Saved
            </span>
          </>
        ) : isItemGroupList ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Item Group</span>
          </>
        ) : isItemList ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Item</span>
          </>
        ) : isStockLedger ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Stock Ledger</span>
          </>
        ) : isStockBalance ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Stock Balance</span>
          </>
        ) : isQuickStockBalance ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Quick Stock Balance</span>
          </>
        ) : isStockProjectedQty ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Stock Projected Qty</span>
          </>
        ) : isStockAnalytics ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Stock Analytics</span>
          </>
        ) : isStockAgeing ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Stock Ageing</span>
          </>
        ) : isItemPriceStock ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Item Price Stock</span>
          </>
        ) : isPurchaseReceiptTrends ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Purchase Receipt Trends</span>
          </>
        ) : isDeliveryNoteTrends ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Delivery Note Trends</span>
          </>
        ) : isPurchaseReceiptTrends ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Purchase Receipt Trends</span>
          </>
        ) : isDeliveryNoteTrends ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Delivery Note Trends</span>
          </>
        ) : isReports ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">{reportDisplayTitle}</span>
          </>
        ) : isDashboard ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-500 dark:text-[#71717A]">Build</span>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-500 dark:text-[#71717A]">Dashboard</span>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Stock</span>
          </>
        ) : isQueryReport ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">{queryReportTitle}</span>
          </>
        ) : (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Stock</span>
          </>
        )}
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Stock Ledger Report Toolbar (matching Frappe Desk Query Report header) */}
        {isStockLedger && (
          <>
            {/* View Stock Balance button */}
            <Link
              to="/reports/stock-balance"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs font-normal shadow-xs transition-colors"
            >
              <span>View Stock Balance</span>
            </Link>

            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => {
                const btn = document.getElementById('rebuild-stock-ledger-btn');
                if (btn) btn.click();
                else window.location.reload();
              }}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown matching Image 3 */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Rebuild black pill button */}
            <button
              type="button"
              onClick={() => {
                const btn = document.getElementById('rebuild-stock-ledger-btn');
                if (btn) btn.click();
              }}
              className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3.5 py-1.5 rounded-lg text-xs shadow-sm transition-all cursor-pointer"
            >
              Rebuild
            </button>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends Report Toolbar */}
        {isPurchaseReceiptTrends && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Delivery Note Trends Report Toolbar */}
        {isDeliveryNoteTrends && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Stock Balance Report Toolbar (matching Frappe Desk Query Report header in Image 1) */}
        {isStockBalance && (
          <>
            {/* View Stock Ledger button */}
            <Link
              to="/reports/stock-ledger"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs font-normal shadow-xs transition-colors"
            >
              <span>View Stock Ledger</span>
            </Link>

            {/* Actions ↕ dropdown */}
            <div className="relative" ref={balanceActionsRef}>
              <button
                type="button"
                onClick={() => setIsBalanceActionsOpen(!isBalanceActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isBalanceActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsBalanceActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => {
                const btn = document.getElementById('rebuild-stock-balance-btn');
                if (btn) btn.click();
                else window.location.reload();
              }}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown matching Image 3 */}
            <div className="relative" ref={balanceMoreRef}>
              <button
                type="button"
                onClick={() => setIsBalanceMoreOpen(!isBalanceMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isBalanceMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsBalanceMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Rebuild black pill button */}
            <button
              type="button"
              onClick={() => {
                const btn = document.getElementById('rebuild-stock-balance-btn');
                if (btn) btn.click();
              }}
              className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3.5 py-1.5 rounded-lg text-xs shadow-sm transition-all cursor-pointer"
            >
              Rebuild
            </button>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends Report Toolbar */}
        {isPurchaseReceiptTrends && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Delivery Note Trends Report Toolbar */}
        {isDeliveryNoteTrends && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Stock Projected Qty Report Toolbar (Images 1 & 2) */}
        {isStockProjectedQty && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={balanceActionsRef}>
              <button
                type="button"
                onClick={() => setIsBalanceActionsOpen(!isBalanceActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isBalanceActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsBalanceActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => {
                const btn = document.getElementById('generate-stock-projected-btn');
                if (btn) btn.click();
                else window.location.reload();
              }}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={balanceMoreRef}>
              <button
                type="button"
                onClick={() => setIsBalanceMoreOpen(!isBalanceMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isBalanceMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsBalanceMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Generate New Report button (Images 1 & 2) */}
            <button
              type="button"
              onClick={() => {
                const btn = document.getElementById('generate-stock-projected-btn');
                if (btn) btn.click();
              }}
              className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3.5 py-1.5 rounded-lg text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              Generate New Report
            </button>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends Report Toolbar */}
        {isPurchaseReceiptTrends && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Delivery Note Trends Report Toolbar */}
        {isDeliveryNoteTrends && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Stock Analytics Report Toolbar (Images 3, 4, 5) */}
        {isStockAnalytics && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => {
                const btn = document.getElementById('generate-stock-analytics-btn');
                if (btn) btn.click();
                else window.location.reload();
              }}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Generate New Report button (Images 3, 4, 5) */}
            <button
              type="button"
              onClick={() => {
                const btn = document.getElementById('generate-stock-analytics-btn');
                if (btn) btn.click();
              }}
              className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3.5 py-1.5 rounded-lg text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              Generate New Report
            </button>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends Report Toolbar */}
        {isPurchaseReceiptTrends && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Delivery Note Trends Report Toolbar */}
        {isDeliveryNoteTrends && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Stock Ageing Report Toolbar (Images 1, 2, 3) */}
        {isStockAgeing && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={balanceActionsRef}>
              <button
                type="button"
                onClick={() => setIsBalanceActionsOpen(!isBalanceActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isBalanceActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsBalanceActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => {
                const btn = document.getElementById('generate-stock-ageing-btn');
                if (btn) btn.click();
                else window.location.reload();
              }}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={balanceMoreRef}>
              <button
                type="button"
                onClick={() => setIsBalanceMoreOpen(!isBalanceMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isBalanceMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsBalanceMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Generate New Report button (Images 1, 2, 3) */}
            <button
              type="button"
              onClick={() => {
                const btn = document.getElementById('generate-stock-ageing-btn');
                if (btn) btn.click();
              }}
              className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3.5 py-1.5 rounded-lg text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              Generate New Report
            </button>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends Report Toolbar */}
        {isPurchaseReceiptTrends && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Delivery Note Trends Report Toolbar */}
        {isDeliveryNoteTrends && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Item Price Stock Report Toolbar (Images 4 & 5) */}
        {isItemPriceStock && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends Report Toolbar */}
        {isPurchaseReceiptTrends && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Delivery Note Trends Report Toolbar */}
        {isDeliveryNoteTrends && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* If on Stock Entry List, Purchase Receipt List, Delivery Note List, Material Request List, Pick List List, Stock Reconciliation List, Landed Cost Voucher List, Repost Item Valuation List, Packing Slip List, or Item List */}
        {(isStockEntryList || isPurchaseReceiptList || isDeliveryNoteList || isMaterialRequestList || isPickListList || isStockReconciliationList || isLandedCostVoucherList || isRepostItemValuationList || isPackingSlipList || isItemList || isItemGroupList || isItemAttributeList || isBrandList || isWarehouseList || isUomList || isUomConversionFactorList || isSerialNoList || isBatchList || isSabbList || isInventoryDimensionList || isShippingRuleList || isItemAlternativeList || isDeliveryTripList || isQualityInspectionTemplateList) && (
          <>
            {/* 1. List View ↕ */}
            <div className="relative" ref={viewMenuRef}>
              <button
                onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-sm hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <List className="w-3.5 h-3.5 text-slate-500" />
                <span>{currentViewLabel}</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isViewMenuOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {viewOptions.map((opt) => {
                    const isSelected = isPurchaseReceiptList
                      ? purchaseReceipt.viewMode === opt.id
                      : isDeliveryNoteList
                      ? deliveryNote.viewMode === opt.id
                      : isMaterialRequestList
                      ? materialRequest.viewMode === opt.id
                      : isPickListList
                      ? pickList.viewMode === opt.id
                      : isStockReconciliationList
                      ? stockReconciliation.viewMode === opt.id
                      : isLandedCostVoucherList
                      ? landedCostVoucher.viewMode === opt.id
                      : isRepostItemValuationList
                      ? repostItemValuation.viewMode === opt.id
                      : isPackingSlipList
                      ? packingSlip.viewMode === opt.id
                      : isItemList
                      ? item.viewMode === opt.id
                      : isItemAlternativeList
                      ? itemAlternative.viewMode === opt.id
                      : isDeliveryTripList
                      ? deliveryTrip.viewMode === opt.id
                      : isQualityInspectionTemplateList
                      ? qualityInspectionTemplate.viewMode === opt.id
                      : stockEntry.viewMode === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          if (isPurchaseReceiptList) {
                            purchaseReceipt.setViewMode(opt.id);
                          } else if (isDeliveryNoteList) {
                            deliveryNote.setViewMode(opt.id);
                          } else if (isMaterialRequestList) {
                            materialRequest.setViewMode(opt.id);
                          } else if (isPickListList) {
                            pickList.setViewMode(opt.id);
                          } else if (isStockReconciliationList) {
                            stockReconciliation.setViewMode(opt.id);
                          } else if (isLandedCostVoucherList) {
                            landedCostVoucher.setViewMode(opt.id);
                          } else if (isRepostItemValuationList) {
                            repostItemValuation.setViewMode(opt.id);
                          } else if (isPackingSlipList) {
                            packingSlip.setViewMode(opt.id);
                          } else if (isItemList) {
                            item.setViewMode(opt.id);
                          } else if (isItemAlternativeList) {
                            itemAlternative.setViewMode(opt.id);
                          } else if (isDeliveryTripList) {
                            deliveryTrip.setViewMode(opt.id);
                          } else if (isQualityInspectionTemplateList) {
                            qualityInspectionTemplate.setViewMode(opt.id);
                          } else {
                            stockEntry.setViewMode(opt.id);
                          }
                          setIsViewMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors ${
                          isSelected
                            ? 'bg-slate-100 dark:bg-[#27272A] text-slate-900 dark:text-white font-medium'
                            : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-[#242428] hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {opt.icon}
                          <span>{opt.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-slate-700 dark:text-zinc-300" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Saved Filters ↕ */}
            <div className="relative" ref={savedFiltersRef}>
              <button
                onClick={() => setIsSavedFiltersOpen(!isSavedFiltersOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-sm hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Saved Filters</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isSavedFiltersOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[10px] uppercase font-semibold text-slate-400 dark:text-zinc-500">
                    Preset Filters
                  </div>
                  {savedFilterOptions.map((filter) => {
                    const isSelected = isPurchaseReceiptList
                      ? purchaseReceipt.savedFilter === filter
                      : isDeliveryNoteList
                      ? deliveryNote.savedFilter === filter
                      : isMaterialRequestList
                      ? materialRequest.savedFilter === filter
                      : isPickListList
                      ? pickList.savedFilter === filter
                      : isStockReconciliationList
                      ? stockReconciliation.savedFilter === filter
                      : isLandedCostVoucherList
                      ? landedCostVoucher.savedFilter === filter
                      : isRepostItemValuationList
                      ? repostItemValuation.savedFilter === filter
                      : isPackingSlipList
                      ? packingSlip.savedFilter === filter
                      : stockEntry.savedFilter === filter;
                    return (
                      <button
                        key={filter}
                        onClick={() => {
                          if (isPurchaseReceiptList) {
                            purchaseReceipt.setSavedFilter(filter);
                          } else if (isDeliveryNoteList) {
                            deliveryNote.setSavedFilter(filter);
                          } else if (isMaterialRequestList) {
                            materialRequest.setSavedFilter(filter);
                          } else if (isPickListList) {
                            pickList.setSavedFilter(filter);
                          } else if (isStockReconciliationList) {
                            stockReconciliation.setSavedFilter(filter);
                          } else if (isLandedCostVoucherList) {
                            landedCostVoucher.setSavedFilter(filter);
                          } else if (isRepostItemValuationList) {
                            repostItemValuation.setSavedFilter(filter);
                          } else if (isPackingSlipList) {
                            packingSlip.setSavedFilter(filter);
                          } else if (isItemList) {
                            if (filter === 'All') {
                              item.setQuickFilters((prev) => ({ ...prev, itemGroup: '' }));
                            } else if (filter === 'Enabled' || filter === 'Disabled') {
                              // filter handled in view
                            } else {
                              item.setQuickFilters((prev) => ({ ...prev, itemGroup: filter }));
                            }
                          } else {
                            stockEntry.setSavedFilter(filter);
                          }
                          setIsSavedFiltersOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors ${
                          isSelected
                            ? 'bg-slate-100 dark:bg-[#27272A] text-slate-900 dark:text-white font-medium'
                            : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-[#242428] hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <span>{filter}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-slate-700 dark:text-zinc-300" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Refresh Button ↻ */}
            <button
              onClick={
                isPurchaseReceiptList
                  ? purchaseReceipt.refresh
                  : isDeliveryNoteList
                  ? deliveryNote.refresh
                  : isMaterialRequestList
                  ? materialRequest.refresh
                  : isPickListList
                  ? pickList.refresh
                  : isStockReconciliationList
                  ? stockReconciliation.refresh
                  : isLandedCostVoucherList
                  ? landedCostVoucher.refresh
                  : isRepostItemValuationList
                  ? repostItemValuation.refresh
                  : isPackingSlipList
                  ? packingSlip.refresh
                  : isItemList
                  ? item.refreshItems
                  : isItemAlternativeList
                  ? itemAlternative.refreshAlternatives
                  : isDeliveryTripList
                  ? deliveryTrip.refreshTrips
                  : isQualityInspectionTemplateList
                  ? qualityInspectionTemplate.refreshTemplates
                  : stockEntry.refresh
              }
              disabled={
                isPurchaseReceiptList
                  ? purchaseReceipt.isRefreshing
                  : isDeliveryNoteList
                  ? deliveryNote.isRefreshing
                  : isMaterialRequestList
                  ? materialRequest.isRefreshing
                  : isPickListList
                  ? pickList.isRefreshing
                  : isStockReconciliationList
                  ? stockReconciliation.isRefreshing
                  : isLandedCostVoucherList
                  ? landedCostVoucher.isRefreshing
                  : isRepostItemValuationList
                  ? repostItemValuation.isRefreshing
                  : isPackingSlipList
                  ? packingSlip.isRefreshing
                  : stockEntry.isRefreshing
              }
              className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] shadow-sm hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all disabled:opacity-50"
              title="Refresh List"
            >
              <RotateCw
                className={`w-3.5 h-3.5 ${
                  (
                    isPurchaseReceiptList
                      ? purchaseReceipt.isRefreshing
                      : isDeliveryNoteList
                      ? deliveryNote.isRefreshing
                      : isMaterialRequestList
                      ? materialRequest.isRefreshing
                      : isPickListList
                      ? pickList.isRefreshing
                      : isStockReconciliationList
                      ? stockReconciliation.isRefreshing
                      : isLandedCostVoucherList
                      ? landedCostVoucher.isRefreshing
                      : isRepostItemValuationList
                      ? repostItemValuation.isRefreshing
                      : isPackingSlipList
                      ? packingSlip.isRefreshing
                      : stockEntry.isRefreshing
                  )
                    ? 'animate-spin text-indigo-500'
                    : ''
                }`}
              />
            </button>

            {/* 4. Three dots menu ... */}
            <div className="relative" ref={stockMoreMenuRef}>
              <button
                onClick={() => setIsStockMoreMenuOpen(!isStockMoreMenuOpen)}
                className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] shadow-sm hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {isStockMoreMenuOpen && (
                <div className="absolute right-0 top-9 z-50 w-52 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100 dark:divide-[#27272A]">
                  <div className="py-1">
                    <button
                      onClick={() => setIsStockMoreMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                      <span>Import</span>
                    </button>
                    <button
                      onClick={() => setIsStockMoreMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                      <span>User Permissions</span>
                    </button>
                    <button
                      onClick={() => setIsStockMoreMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                      <span>Role Permissions Manager</span>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => setIsStockMoreMenuOpen(false)}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Sliders className="w-3.5 h-3.5 text-slate-400" />
                        <span>Customize</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Ctrl+Y</span>
                    </button>
                    <button
                      onClick={() => setIsStockMoreMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5 text-slate-400" />
                      <span>Customize Quick Filters</span>
                    </button>
                    <button
                      onClick={() => setIsStockMoreMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>List Settings</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Add Button */}
            {isPurchaseReceiptList ? (
              <Link
                to="/purchase-receipt/new"
                className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Purchase Receipt</span>
              </Link>
            ) : isDeliveryNoteList ? (
              <Link
                to="/delivery-note/new"
                className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Delivery Note</span>
              </Link>
            ) : isMaterialRequestList ? (
              <Link
                to="/material-request/new"
                className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Material Request</span>
              </Link>
            ) : isPickListList ? (
              <Link
                to="/pick-list/new"
                className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Pick List</span>
              </Link>
            ) : isStockReconciliationList ? (
              <Link
                to="/stock-reconciliation/new"
                className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Stock Reconciliation</span>
              </Link>
            ) : isLandedCostVoucherList ? (
              <Link
                to="/landed-cost-voucher/new"
                className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Landed Cost Voucher</span>
              </Link>
            ) : isRepostItemValuationList ? (
              <Link
                to="/repost-item-valuation/new"
                className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Repost Item Valuation</span>
              </Link>
            ) : isPackingSlipList ? (
              <Link
                to="/packing-slip/new"
                className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Packing Slip</span>
              </Link>
            ) : isItemGroupList ? (
              <Link
                to="/item-group/new"
                className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Item Group</span>
              </Link>
            ) : isItemAttributeList ? (
              <Link
                to="/item-attribute/new"
                className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Item Attribute</span>
              </Link>
            ) : isBrandList ? (
              <Link
                to="/brand/new"
                className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Brand</span>
              </Link>
            ) : isWarehouseList ? (
              <Link
                to="/warehouse/new"
                className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Warehouse</span>
              </Link>
            ) : isUomList ? (
              <Link
                to="/uom/new"
                className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add UOM</span>
              </Link>
            ) : isUomConversionFactorList ? (
              <Link
                to="/uom-conversion-factor/new"
                className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add UOM Conversion Factor</span>
              </Link>
            ) : isSerialNoList ? (
              <Link
                to="/serial-no/new"
                className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Serial No</span>
              </Link>
            ) : isBatchList ? (
              <Link
                to="/batch-no/new"
                className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Batch</span>
              </Link>
            ) : isSabbList ? (
              <Link
                to="/serial-and-batch-bundle/new"
                className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Serial and Batch Bundle</span>
              </Link>
            ) : isInventoryDimensionList ? (
              <Link
                to="/inventory-dimension/new"
                className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Inventory Dimension</span>
              </Link>
            ) : isShippingRuleList ? (
              <Link
                to="/shipping-rule/new"
                className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Shipping Rule</span>
              </Link>
            ) : isItemAlternativeList ? (
              <Link
                to="/item-alternative/new"
                className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Item Alternative</span>
              </Link>
            ) : isDeliveryTripList ? (
              <Link
                to="/delivery-trip/new"
                className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Delivery Trip</span>
              </Link>
            ) : isQualityInspectionTemplateList ? (
              <Link
                to="/quality-inspection-template/new"
                className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Quality Inspection Template</span>
              </Link>



            ) : isItemList ? (
              <button
                type="button"
                onClick={() => item.setIsNewItemModalOpen(true)}
                className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Item</span>
              </button>
            ) : (
              <Link
                to="/stock-entry/new"
                className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Stock Entry</span>
              </Link>
            )}

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends Report Toolbar */}
        {isPurchaseReceiptTrends && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Delivery Note Trends Report Toolbar */}
        {isDeliveryNoteTrends && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* If on New Purchase Receipt, New Stock Entry, New Delivery Note, New Material Request, New Pick List, New Stock Reconciliation, New Landed Cost Voucher, New Repost Item Valuation, New Packing Slip, New Item, New Item Group, New Item Attribute, or New Brand */}
        {(isNewPurchaseReceipt || isNewStockEntry || isNewDeliveryNote || isNewMaterialRequest || isNewPickList || isNewStockReconciliation || isNewLandedCostVoucher || isNewRepostItemValuation || isNewPackingSlip || isNewItem || isNewItemGroup || isNewItemAttribute || isNewBrand || isNewWarehouse || isNewUom || isNewUomConversionFactor || isNewSerialNo || isNewBatch || isNewSabb || isNewInventoryDimension || isNewShippingRule || isNewItemAlternative || isNewDeliveryTrip || isNewQualityInspectionTemplate) && (
          <>
            {isNewSerialNo ? (
              <button
                type="button"
                onClick={() => alert('View Ledgers')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs transition-colors"
              >
                <span>View Ledgers</span>
              </button>
            ) : isNewItemGroup ? (
              <button
                type="button"
                onClick={() => navigate('/item-group')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs transition-colors"
              >
                <span>Item Group Tree</span>
              </button>
            ) : isNewStockReconciliation ? (
              <button
                type="button"
                onClick={() => {
                  const btns = Array.from(document.querySelectorAll('button'));
                  const fetchBtn = btns.find((b) =>
                    b.textContent?.trim().includes('Fetch Items from Warehouse')
                  );
                  if (fetchBtn) fetchBtn.click();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs transition-colors"
              >
                <span>Fetch Items from Warehouse</span>
              </button>
            ) : !isNewPickList && !isNewLandedCostVoucher && !isNewRepostItemValuation && !isNewPackingSlip && !isNewItem && !isNewItemGroup && !isNewItemAttribute && !isNewBrand && !isNewWarehouse && !isNewUom && !isNewUomConversionFactor && !isNewSerialNo && !isNewBatch && !isNewSabb && !isNewInventoryDimension && !isNewShippingRule && !isNewItemAlternative && !isNewDeliveryTrip && !isNewQualityInspectionTemplate ? (
              <div className="relative" ref={detailGetItemsRef}>
                <button
                  type="button"
                  onClick={() => setIsDetailGetItemsOpen(!isDetailGetItemsOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs transition-colors"
                >
                  <span>Get Items From</span>
                  <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
                {isDetailGetItemsOpen && (
                  <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                    {(isNewDeliveryNote
                      ? ['Sales Order', 'Pick List', 'Packing Slip', 'Delivery Trip']
                      : isNewMaterialRequest
                      ? ['Bill of Materials', 'Sales Order', 'Product Bundle']
                      : ['Purchase Order', 'Material Request', 'Supplier Quotation']
                    ).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setIsDetailGetItemsOpen(false)}
                        className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A]"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => {
                const saveButtons = Array.from(document.querySelectorAll('button'));
                const saveBtn = saveButtons.find(b => b.textContent?.trim() === 'Save');
                if (saveBtn) saveBtn.click();
              }}
              className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all"
            >
              Save
            </button>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends Report Toolbar */}
        {isPurchaseReceiptTrends && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Delivery Note Trends Report Toolbar */}
        {isDeliveryNoteTrends && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* If on Stock Entry Detail, Purchase Receipt Detail, Delivery Note Detail, Material Request Detail, Pick List Detail, Stock Reconciliation Detail, Landed Cost Voucher Detail, Repost Item Valuation Detail, Packing Slip Detail, Item Detail Page, Item Group Detail, Item Attribute Detail, or Brand Detail */}
        {((isStockEntryDetail && currentDetailEntry) ||
          (isPurchaseReceiptDetail && currentPrDetailEntry) ||
          (isDeliveryNoteDetail && currentDnDetailEntry) ||
          (isMaterialRequestDetail && currentMrDetailEntry) ||
          (isPickListDetail && currentPlDetailEntry) ||
          (isStockReconciliationDetail && currentSrDetailEntry) ||
          (isLandedCostVoucherDetail && currentLcvDetailEntry) ||
          (isRepostItemValuationDetail && currentRivDetailEntry) ||
          (isPackingSlipDetail && currentPacDetailEntry) ||
          (isItemDetail && currentItDetailEntry) ||
          (isItemGroupDetail && currentIgDetailEntry) ||
          (isItemAttributeDetail && currentIaDetailEntry) ||
          (isBrandDetail && currentBrandDetailEntry) ||
          (isWarehouseDetail && currentWarehouseDetailEntry) ||
          (isUomDetail && currentUomDetailEntry) ||
          (isUomConversionFactorDetail && currentUcfDetailEntry) ||
          (isSerialNoDetail && currentSerialNoDetailEntry) ||
          (isBatchDetail && currentBatchDetailEntry) ||
          (isSabbDetail && currentSabbDetailEntry) ||
          (isInventoryDimensionDetail && currentInventoryDimensionDetailEntry) ||
          (isShippingRuleDetail && currentShippingRuleDetailEntry) ||
          (isItemAlternativeDetail && currentItemAlternativeDetailEntry) ||
          (isDeliveryTripDetail && currentDeliveryTripDetailEntry) ||
          (isQualityInspectionTemplateDetail && currentQitDetailEntry)) && (
          <>
            {isInventoryDimensionDetail && (
              <button
                type="button"
                onClick={() => {
                  const deleteBtn = document.getElementById('delete-inventory-dimension-btn');
                  if (deleteBtn) deleteBtn.click();
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs transition-colors"
              >
                Delete Dimension
              </button>
            )}
            {isSerialNoDetail && (
              <button
                type="button"
                onClick={() => alert('View Ledgers')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs transition-colors"
              >
                <span>View Ledgers</span>
              </button>
            )}

            {isWarehouseDetail && (
              <>
                <button
                  type="button"
                  onClick={() => warehouse.disableWarehouse(currentWarehouseDetailEntry.id)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs font-normal transition-colors"
                >
                  {currentWarehouseDetailEntry.status === 'Disabled' ? 'Enable' : 'Disable'}
                </button>
                <button
                  type="button"
                  onClick={() => warehouse.convertToGroup(currentWarehouseDetailEntry.id)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs font-normal transition-colors"
                >
                  Convert to Group
                </button>
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs transition-colors"
                  >
                    <span>View</span>
                    <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </>
            )}

            {isItemGroupDetail && (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/item-group')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs transition-colors"
                >
                  <span>Item Group Tree</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/item')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs transition-colors"
                >
                  <span>Items</span>
                </button>
              </>
            )}

            {isItemDetail && (
              <>
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs transition-colors"
                  >
                    <span>View</span>
                    <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/item/new')}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs font-medium transition-colors"
                >
                  Duplicate
                </button>
              </>
            )}

            {/* Create ↕ (hidden on Draft Material Request, Pick List, Stock Reconciliation, Landed Cost Voucher, Repost Item Valuation, Packing Slip, Item Detail, Item Group Detail, Item Attribute Detail, Brand Detail, Serial and Batch Bundle Detail, Inventory Dimension Detail, Shipping Rule Detail) */}
            {!isMaterialRequestDetail && !isPickListDetail && !isStockReconciliationDetail && !isLandedCostVoucherDetail && !isRepostItemValuationDetail && !isPackingSlipDetail && !isItemDetail && !isItemGroupDetail && !isItemAttributeDetail && !isBrandDetail && !isWarehouseDetail && !isUomDetail && !isUomConversionFactorDetail && !isSerialNoDetail && !isBatchDetail && !isSabbDetail && !isInventoryDimensionDetail && !isShippingRuleDetail && !isItemAlternativeDetail && !isDeliveryTripDetail && !isQualityInspectionTemplateDetail && (
              <div className="relative" ref={detailCreateRef}>
                <button
                  type="button"
                  onClick={() => setIsDetailCreateOpen(!isDetailCreateOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs transition-colors"
                >
                  <span>Create</span>
                  <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
                {isDetailCreateOpen && (
                  <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                    {isPurchaseReceiptDetail
                      ? ['Purchase Invoice', 'Stock Entry', 'Landed Cost Voucher'].map((t) => (
                          <button
                            key={t}
                            onClick={() => {
                              setIsDetailCreateOpen(false);
                            }}
                            className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A]"
                          >
                            {t}
                          </button>
                        ))
                      : isDeliveryNoteDetail
                      ? ['Sales Invoice', 'Delivery Trip', 'Installation Note', 'Sales Return', 'Packing Slip'].map((t) => (
                          <button
                            key={t}
                            onClick={() => {
                              setIsDetailCreateOpen(false);
                            }}
                            className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A]"
                          >
                            {t}
                          </button>
                        ))
                      : ['Material Receipt', 'Material Issue', 'Material Transfer'].map((t) => (
                          <button
                            key={t}
                            onClick={() => {
                              navigate('/stock-entry/new');
                              setIsDetailCreateOpen(false);
                            }}
                            className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A]"
                          >
                            {t}
                          </button>
                        ))}
                  </div>
                )}
              </div>
            )}

            {/* Get Items / Fetch Items */}
            {isStockReconciliationDetail ? (
              <button
                type="button"
                onClick={() => {
                  const btns = Array.from(document.querySelectorAll('button'));
                  const fetchBtn = btns.find((b) =>
                    b.textContent?.trim().includes('Fetch Items from Warehouse')
                  );
                  if (fetchBtn) fetchBtn.click();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs transition-colors"
              >
                <span>Fetch Items from Warehouse</span>
              </button>
            ) : isPickListDetail ? (
              <button
                type="button"
                onClick={() => alert('Get Items from Sales Order / Work Order')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs transition-colors"
              >
                <span>Get Items</span>
              </button>
            ) : (
              <div className="relative" ref={detailGetItemsRef}>
                <button
                  type="button"
                  onClick={() => setIsDetailGetItemsOpen(!isDetailGetItemsOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs transition-colors"
                >
                  <span>Get Items From</span>
                  <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
                {isDetailGetItemsOpen && (
                  <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                    {(isDeliveryNoteDetail
                      ? ['Sales Order', 'Pick List', 'Packing Slip']
                      : isMaterialRequestDetail
                      ? ['Bill of Materials', 'Sales Order', 'Product Bundle']
                      : ['Purchase Order', 'Material Request', 'Supplier Quotation']
                    ).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setIsDetailGetItemsOpen(false)}
                        className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A]"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Preview ↕ (hidden on Material Request, Pick List, and Stock Reconciliation Detail) */}
            {!isMaterialRequestDetail && !isPickListDetail && !isStockReconciliationDetail && !isSerialNoDetail && !isBatchDetail && !isSabbDetail && !isInventoryDimensionDetail && !isShippingRuleDetail && !isItemAlternativeDetail && !isDeliveryTripDetail && !isQualityInspectionTemplateDetail && (
              <div className="relative" ref={detailPreviewRef}>
                <button
                  type="button"
                  onClick={() => setIsDetailPreviewOpen(!isDetailPreviewOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs transition-colors"
                >
                  <span>Preview</span>
                  <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
                {isDetailPreviewOpen && (
                  <div className="absolute right-0 top-9 z-50 w-40 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={() => {
                        window.print();
                        setIsDetailPreviewOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A]"
                    >
                      Print Format
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Previous < and Next > buttons */}
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-[#2E2E33] overflow-hidden bg-white dark:bg-[#1E1E22]">
              <button
                type="button"
                disabled={
                  isPurchaseReceiptDetail
                    ? !prevPrDetailEntry
                    : isDeliveryNoteDetail
                    ? !prevDnDetailEntry
                    : isMaterialRequestDetail
                    ? !prevMrDetailEntry
                    : isPickListDetail
                    ? !prevPlDetailEntry
                    : isStockReconciliationDetail
                    ? !prevSrDetailEntry
                    : !prevDetailEntry
                }
                onClick={() => {
                  if (isPurchaseReceiptDetail && prevPrDetailEntry) {
                    navigate(`/purchase-receipt/${prevPrDetailEntry.id}`);
                  } else if (isDeliveryNoteDetail && prevDnDetailEntry) {
                    navigate(`/delivery-note/${prevDnDetailEntry.id}`);
                  } else if (isMaterialRequestDetail && prevMrDetailEntry) {
                    navigate(`/material-request/${prevMrDetailEntry.id}`);
                  } else if (isPickListDetail && prevPlDetailEntry) {
                    navigate(`/pick-list/${prevPlDetailEntry.id}`);
                  } else if (isStockReconciliationDetail && prevSrDetailEntry) {
                    navigate(`/stock-reconciliation/${prevSrDetailEntry.id}`);
                  } else if (prevDetailEntry) {
                    navigate(`/stock-entry/${prevDetailEntry.id}`);
                  }
                }}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#27272A] disabled:opacity-40 text-slate-600 dark:text-zinc-400 transition-colors"
                title="Previous Document"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-3.5 bg-slate-200 dark:bg-[#2E2E33]" />
              <button
                type="button"
                disabled={
                  isPurchaseReceiptDetail
                    ? !nextPrDetailEntry
                    : isDeliveryNoteDetail
                    ? !nextDnDetailEntry
                    : isMaterialRequestDetail
                    ? !nextMrDetailEntry
                    : isPickListDetail
                    ? !nextPlDetailEntry
                    : isStockReconciliationDetail
                    ? !nextSrDetailEntry
                    : !nextDetailEntry
                }
                onClick={() => {
                  if (isPurchaseReceiptDetail && nextPrDetailEntry) {
                    navigate(`/purchase-receipt/${nextPrDetailEntry.id}`);
                  } else if (isDeliveryNoteDetail && nextDnDetailEntry) {
                    navigate(`/delivery-note/${nextDnDetailEntry.id}`);
                  } else if (isMaterialRequestDetail && nextMrDetailEntry) {
                    navigate(`/material-request/${nextMrDetailEntry.id}`);
                  } else if (isPickListDetail && nextPlDetailEntry) {
                    navigate(`/pick-list/${nextPlDetailEntry.id}`);
                  } else if (isStockReconciliationDetail && nextSrDetailEntry) {
                    navigate(`/stock-reconciliation/${nextSrDetailEntry.id}`);
                  } else if (nextDetailEntry) {
                    navigate(`/stock-entry/${nextDetailEntry.id}`);
                  }
                }}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#27272A] disabled:opacity-40 text-slate-600 dark:text-zinc-400 transition-colors"
                title="Next Document"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* ... More button */}
            <button
              type="button"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
              title="More"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {/* Submit Button (Image 1: Solid Black Pill) */}
            {isPurchaseReceiptDetail ? (
              currentPrDetailEntry.status === 'Draft' ? (
                <button
                  type="button"
                  onClick={() => purchaseReceipt.updateStatus(currentPrDetailEntry.id, 'Completed')}
                  className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all"
                >
                  Submit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => purchaseReceipt.updateStatus(currentPrDetailEntry.id, 'Cancelled')}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all"
                >
                  Cancel
                </button>
              )
            ) : isDeliveryNoteDetail ? (
              currentDnDetailEntry.status === 'Draft' ? (
                <button
                  type="button"
                  onClick={() => deliveryNote.updateStatus(currentDnDetailEntry.id, 'Completed')}
                  className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all"
                >
                  Submit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => deliveryNote.updateStatus(currentDnDetailEntry.id, 'Cancelled')}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all"
                >
                  Cancel
                </button>
              )
            ) : isMaterialRequestDetail ? (
              currentMrDetailEntry.status === 'Draft' ? (
                <button
                  type="button"
                  onClick={() => materialRequest.updateStatus(currentMrDetailEntry.id, 'Pending')}
                  className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all"
                >
                  Submit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => materialRequest.updateStatus(currentMrDetailEntry.id, 'Cancelled')}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all"
                >
                  Cancel
                </button>
              )
            ) : isPickListDetail ? (
              currentPlDetailEntry.status === 'Draft' ? (
                <button
                  type="button"
                  onClick={() => pickList.updateStatus(currentPlDetailEntry.id, 'Completed')}
                  className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all"
                >
                  Submit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => pickList.updateStatus(currentPlDetailEntry.id, 'Cancelled')}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all"
                >
                  Cancel
                </button>
              )
            ) : isStockReconciliationDetail ? (
              currentSrDetailEntry.status === 'Draft' ? (
                <button
                  type="button"
                  onClick={() => stockReconciliation.updateStatus(currentSrDetailEntry.id, 'Submitted')}
                  className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all"
                >
                  Submit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => stockReconciliation.updateStatus(currentSrDetailEntry.id, 'Cancelled')}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all"
                >
                  Cancel
                </button>
              )
            ) : isStockReconciliationDetail ? (
              currentSrDetailEntry.status === 'Draft' ? (
                <button
                  type="button"
                  onClick={() => stockReconciliation.updateStatus(currentSrDetailEntry.id, 'Submitted')}
                  className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all"
                >
                  Submit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => stockReconciliation.updateStatus(currentSrDetailEntry.id, 'Cancelled')}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all"
                >
                  Cancel
                </button>
              )
            ) : isLandedCostVoucherDetail ? (
              currentLcvDetailEntry.status === 'Draft' ? (
                <button
                  type="button"
                  onClick={() => landedCostVoucher.updateStatus(currentLcvDetailEntry.id, 'Submitted')}
                  className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all"
                >
                  Submit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => landedCostVoucher.updateStatus(currentLcvDetailEntry.id, 'Cancelled')}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all"
                >
                  Cancel
                </button>
              )
            ) : isRepostItemValuationDetail ? (
              currentRivDetailEntry.status === 'Cancelled' ? (
                <button
                  type="button"
                  disabled
                  className="border border-slate-200 dark:border-[#2E2E33] bg-slate-100 dark:bg-[#202024] text-slate-400 dark:text-zinc-500 font-medium px-4 py-1.5 rounded-lg text-xs cursor-not-allowed transition-all"
                >
                  Cancelled
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => repostItemValuation.updateStatus(currentRivDetailEntry.id, 'Cancelled')}
                  className="border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 font-medium px-4 py-1.5 rounded-lg text-xs shadow-xs transition-all"
                >
                  Cancel
                </button>
              )
            ) : isItemDetail || isItemGroupDetail || isItemAttributeDetail || isBrandDetail || isWarehouseDetail || isUomDetail || isUomConversionFactorDetail || isSerialNoDetail || isBatchDetail || isSabbDetail || isInventoryDimensionDetail || isShippingRuleDetail || isItemAlternativeDetail || isDeliveryTripDetail || isQualityInspectionTemplateDetail ? (
              <button
                type="button"
                onClick={() => {
                  const saveButtons = Array.from(document.querySelectorAll('button'));
                  const saveBtn = saveButtons.find(b => b.textContent?.trim() === 'Save');
                  if (saveBtn) saveBtn.click();
                }}
                className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all"
              >
                Save
              </button>
            ) : isPackingSlipDetail ? (
              currentPacDetailEntry.status === 'Draft' ? (
                <button
                  type="button"
                  onClick={() => packingSlip.updateStatus(currentPacDetailEntry.id, 'Submitted')}
                  className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all"
                >
                  Submit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => packingSlip.updateStatus(currentPacDetailEntry.id, 'Cancelled')}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all"
                >
                  Cancel
                </button>
              )
            ) : (
              currentDetailEntry.status === 'Draft' ? (
                <button
                  type="button"
                  onClick={() => stockEntry.updateStatus(currentDetailEntry.id, 'Submitted')}
                  className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all"
                >
                  Submit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => stockEntry.updateStatus(currentDetailEntry.id, 'Cancelled')}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all"
                >
                  Cancel
                </button>
              )
            )}

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends Report Toolbar */}
        {isPurchaseReceiptTrends && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Delivery Note Trends Report Toolbar */}
        {isDeliveryNoteTrends && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Purchase Receipt Trends & Delivery Note Trends Toolbar */}
        {(isPurchaseReceiptTrends || isDeliveryNoteTrends) && (
          <>
            {/* Actions ↕ dropdown */}
            <div className="relative" ref={ledgerActionsRef}>
              <button
                type="button"
                onClick={() => setIsLedgerActionsOpen(!isLedgerActionsOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
              >
                <span>Actions</span>
                <ChevronsUpDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLedgerActionsOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Set Chart', 'Export', 'Setup Auto Email'].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setIsLedgerActionsOpen(false);
                        alert(`${action} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Three Dots (...) Dropdown */}
            <div className="relative" ref={ledgerMoreRef}>
              <button
                type="button"
                onClick={() => setIsLedgerMoreOpen(!isLedgerMoreOpen)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] shadow-xs transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              {isLedgerMoreOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Edit', 'Print', 'PDF', 'Export', 'Setup Auto Email', 'Add Column', 'User Permissions', 'Save'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setIsLedgerMoreOpen(false);
                        alert(`${item} clicked`);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Language Switcher */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-xs font-normal text-slate-600 dark:text-[#A1A1AA] hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors"
          >
            <span>{currentFlag}</span>
            <span className="uppercase text-[11px] font-medium">{language}</span>
          </button>

          {isLangMenuOpen && (
            <div className="absolute right-0 top-8 w-36 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#2C2C2E] rounded-xl shadow-xl py-1 z-50 text-xs animate-in fade-in duration-100">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code as any);
                    setIsLangMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors ${
                    language === l.code
                      ? 'bg-slate-100 dark:bg-[#27272A] text-slate-900 dark:text-white font-medium'
                      : 'text-slate-600 dark:text-[#A1A1AA] hover:bg-slate-50 dark:hover:bg-[#27272A]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </span>
                  {language === l.code && <Check className="w-3 h-3 text-slate-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Global Page Options Three Dots Button (hidden when specific dropdowns exist) */}
        {!isStockEntry && !isPurchaseReceipt && !isDeliveryNote && !isMaterialRequest && !isPickList && !isStockLedger && !isStockBalance && !isStockProjectedQty && !isStockAnalytics && !isStockAgeing && !isItemPriceStock && (
          <div className="relative" ref={pageMenuRef}>
            <button
              onClick={() => setIsPageMenuOpen(!isPageMenuOpen)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors"
              title="Options"
            >
              <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {isPageMenuOpen && (
              <div className="absolute right-0 top-8 w-36 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#2C2C2E] rounded-xl shadow-xl py-1 z-50 text-xs text-slate-700 dark:text-[#D4D4D8] animate-in fade-in duration-100">
                <button
                  onClick={() => {
                    setIsPageMenuOpen(false);
                    window.location.reload();
                  }}
                  className="w-full px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-[#27272A] text-left"
                >
                  Reload
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

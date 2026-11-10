// App Routes configuration
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../layout';
import { HomePage } from '../pages/HomePage';
import { DashboardPage } from '../pages/DashboardPage';
import { StockEntryPage } from '../pages/StockEntryPage';
import { NewStockEntryPage } from '../pages/NewStockEntryPage';
import { StockEntryDetailPage } from '../pages/StockEntryDetailPage';
import { PurchaseReceiptPage } from '../pages/PurchaseReceiptPage';
import { NewPurchaseReceiptPage } from '../pages/NewPurchaseReceiptPage';
import { PurchaseReceiptDetailPage } from '../pages/PurchaseReceiptDetailPage';
import { DeliveryNotePage } from '../pages/DeliveryNotePage';
import { NewDeliveryNotePage } from '../pages/NewDeliveryNotePage';
import { DeliveryNoteDetailPage } from '../pages/DeliveryNoteDetailPage';
import { MaterialRequestPage } from '../pages/MaterialRequestPage';
import { NewMaterialRequestPage } from '../pages/NewMaterialRequestPage';
import { MaterialRequestDetailPage } from '../pages/MaterialRequestDetailPage';
import { PickListPage } from '../pages/PickListPage';
import { NewPickListPage } from '../pages/NewPickListPage';
import { PickListDetailPage } from '../pages/PickListDetailPage';
import { StockReconciliationPage } from '../pages/StockReconciliationPage';
import { NewStockReconciliationPage } from '../pages/NewStockReconciliationPage';
import { StockReconciliationDetailPage } from '../pages/StockReconciliationDetailPage';
import { LandedCostVoucherPage } from '../pages/LandedCostVoucherPage';
import { NewLandedCostVoucherPage } from '../pages/NewLandedCostVoucherPage';
import { LandedCostVoucherDetailPage } from '../pages/LandedCostVoucherDetailPage';
import { RepostItemValuationPage } from '../pages/RepostItemValuationPage';
import { NewRepostItemValuationPage } from '../pages/NewRepostItemValuationPage';
import { RepostItemValuationDetailPage } from '../pages/RepostItemValuationDetailPage';
import { PackingSlipPage } from '../pages/PackingSlipPage';
import { NewPackingSlipPage } from '../pages/NewPackingSlipPage';
import { PackingSlipDetailPage } from '../pages/PackingSlipDetailPage';
import { ItemPage } from '../pages/ItemPage';
import { NewItemPage } from '../pages/NewItemPage';
import { ItemDetailPage } from '../pages/ItemDetailPage';
import { ItemGroupPage } from '../pages/ItemGroupPage';
import { NewItemGroupPage } from '../pages/NewItemGroupPage';
import { ItemGroupDetailPage } from '../pages/ItemGroupDetailPage';
import { ItemAttributePage } from '../pages/ItemAttributePage';
import { NewItemAttributePage } from '../pages/NewItemAttributePage';
import { ItemAttributeDetailPage } from '../pages/ItemAttributeDetailPage';
import { BrandPage } from '../pages/BrandPage';
import { NewBrandPage } from '../pages/NewBrandPage';
import { BrandDetailPage } from '../pages/BrandDetailPage';
import { WarehousePage } from '../pages/WarehousePage';
import { NewWarehousePage } from '../pages/NewWarehousePage';
import { WarehouseDetailPage } from '../pages/WarehouseDetailPage';
import { UOMPage } from '../pages/UOMPage';
import { NewUOMPage } from '../pages/NewUOMPage';
import { UOMDetailPage } from '../pages/UOMDetailPage';
import { UOMConversionFactorPage } from '../pages/UOMConversionFactorPage';
import { NewUOMConversionFactorPage } from '../pages/NewUOMConversionFactorPage';
import { UOMConversionFactorDetailPage } from '../pages/UOMConversionFactorDetailPage';
import { SerialNoPage } from '../pages/SerialNoPage';
import { NewSerialNoPage } from '../pages/NewSerialNoPage';
import { SerialNoDetailPage } from '../pages/SerialNoDetailPage';
import { BatchPage } from '../pages/BatchPage';
import { NewBatchPage } from '../pages/NewBatchPage';
import { BatchDetailPage } from '../pages/BatchDetailPage';
import { SerialAndBatchBundlePage } from '../pages/SerialAndBatchBundlePage';
import { NewSerialAndBatchBundlePage } from '../pages/NewSerialAndBatchBundlePage';
import { SerialAndBatchBundleDetailPage } from '../pages/SerialAndBatchBundleDetailPage';
import { InventoryDimensionPage } from '../pages/InventoryDimensionPage';
import { NewInventoryDimensionPage } from '../pages/NewInventoryDimensionPage';
import { InventoryDimensionDetailPage } from '../pages/InventoryDimensionDetailPage';
import { ShippingRulePage } from '../pages/ShippingRulePage';
import { NewShippingRulePage } from '../pages/NewShippingRulePage';
import { ShippingRuleDetailPage } from '../pages/ShippingRuleDetailPage';
import { ItemAlternativePage } from '../pages/ItemAlternativePage';
import { NewItemAlternativePage } from '../pages/NewItemAlternativePage';
import { ItemAlternativeDetailPage } from '../pages/ItemAlternativeDetailPage';
import { DeliveryTripPage } from '../pages/DeliveryTripPage';
import { NewDeliveryTripPage } from '../pages/NewDeliveryTripPage';
import { DeliveryTripDetailPage } from '../pages/DeliveryTripDetailPage';
import { QualityInspectionTemplatePage } from '../pages/QualityInspectionTemplatePage';
import { NewQualityInspectionTemplatePage } from '../pages/NewQualityInspectionTemplatePage';
import { QualityInspectionTemplateDetailPage } from '../pages/QualityInspectionTemplateDetailPage';
import { StockReportPage } from '../pages/StockReportPage';
import { StockLedgerReportPage } from '../pages/StockLedgerReportPage';
import { StockBalanceReportPage } from '../pages/StockBalanceReportPage';
import { QuickStockBalancePage } from '../pages/QuickStockBalancePage';
import { StockProjectedQtyReportPage } from '../pages/StockProjectedQtyReportPage';
import { StockAnalyticsReportPage } from '../pages/StockAnalyticsReportPage';
import { StockAgeingReportPage } from '../pages/StockAgeingReportPage';
import { ItemPriceStockReportPage } from '../pages/ItemPriceStockReportPage';
import { PurchaseReceiptTrendsPage } from '../pages/PurchaseReceiptTrendsPage';
import { DeliveryNoteTrendsPage } from '../pages/DeliveryNoteTrendsPage';









import { WarehousesPage } from '../pages/WarehousesPage';
import { ProductsPage } from '../pages/ProductsPage';
import { StockMovementsPage } from '../pages/StockMovementsPage';
import { SuppliersPage } from '../pages/SuppliersPage';
import { SettingsPage } from '../pages/SettingsPage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Stock System Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Home Page (Images 2, 3, 4, 5) */}
          <Route index element={<HomePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="warehouses" element={<WarehousePage />} />
          <Route path="warehouses/new" element={<NewWarehousePage />} />
          <Route path="warehouses/:id" element={<WarehouseDetailPage />} />
          <Route path="warehouse" element={<WarehousePage />} />
          <Route path="warehouse/new" element={<NewWarehousePage />} />
          <Route path="warehouse/:id" element={<WarehouseDetailPage />} />
          <Route path="products" element={<ItemPage />} />
          <Route path="items" element={<ItemPage />} />
          <Route path="items/new" element={<NewItemPage />} />
          <Route path="items/:id" element={<ItemDetailPage />} />
          <Route path="item" element={<ItemPage />} />
          <Route path="item/new" element={<NewItemPage />} />
          <Route path="item/:id" element={<ItemDetailPage />} />
          <Route path="item-group" element={<ItemGroupPage />} />
          <Route path="item-group/new" element={<NewItemGroupPage />} />
          <Route path="item-group/:id" element={<ItemGroupDetailPage />} />
          <Route path="item-groups" element={<ItemGroupPage />} />
          <Route path="item-groups/new" element={<NewItemGroupPage />} />
          <Route path="item-groups/:id" element={<ItemGroupDetailPage />} />
          <Route path="item-attribute" element={<ItemAttributePage />} />
          <Route path="item-attribute/new" element={<NewItemAttributePage />} />
          <Route path="item-attribute/:id" element={<ItemAttributeDetailPage />} />
          <Route path="item-attributes" element={<ItemAttributePage />} />
          <Route path="item-attributes/new" element={<NewItemAttributePage />} />
          <Route path="item-attributes/:id" element={<ItemAttributeDetailPage />} />
          <Route path="brand" element={<BrandPage />} />
          <Route path="brand/new" element={<NewBrandPage />} />
          <Route path="brand/:id" element={<BrandDetailPage />} />
          <Route path="brands" element={<BrandPage />} />
          <Route path="brands/new" element={<NewBrandPage />} />
          <Route path="brands/:id" element={<BrandDetailPage />} />
          <Route path="uom" element={<UOMPage />} />
          <Route path="uom/new" element={<NewUOMPage />} />
          <Route path="uom/:id" element={<UOMDetailPage />} />
          <Route path="uoms" element={<UOMPage />} />
          <Route path="uoms/new" element={<NewUOMPage />} />
          <Route path="uoms/:id" element={<UOMDetailPage />} />
          <Route path="uom-conversion-factor" element={<UOMConversionFactorPage />} />
          <Route path="uom-conversion-factor/new" element={<NewUOMConversionFactorPage />} />
          <Route path="uom-conversion-factor/:id" element={<UOMConversionFactorDetailPage />} />
          <Route path="uom-conversion-factors" element={<UOMConversionFactorPage />} />
          <Route path="uom-conversion-factors/new" element={<NewUOMConversionFactorPage />} />
          <Route path="uom-conversion-factors/:id" element={<UOMConversionFactorDetailPage />} />
          <Route path="serial-no" element={<SerialNoPage />} />
          <Route path="serial-no/new" element={<NewSerialNoPage />} />
          <Route path="serial-no/:id" element={<SerialNoDetailPage />} />
          <Route path="serial-nos" element={<SerialNoPage />} />
          <Route path="serial-nos/new" element={<NewSerialNoPage />} />
          <Route path="serial-nos/:id" element={<SerialNoDetailPage />} />
          <Route path="batch-no" element={<BatchPage />} />
          <Route path="batch-no/new" element={<NewBatchPage />} />
          <Route path="batch-no/:id" element={<BatchDetailPage />} />
          <Route path="batch-nos" element={<BatchPage />} />
          <Route path="batch-nos/new" element={<NewBatchPage />} />
          <Route path="batch-nos/:id" element={<BatchDetailPage />} />
          <Route path="batch" element={<BatchPage />} />
          <Route path="batch/new" element={<NewBatchPage />} />
          <Route path="batch/:id" element={<BatchDetailPage />} />
          <Route path="batches" element={<BatchPage />} />
          <Route path="batches/new" element={<NewBatchPage />} />
          <Route path="batches/:id" element={<BatchDetailPage />} />
          <Route path="serial-and-batch-bundle" element={<SerialAndBatchBundlePage />} />
          <Route path="serial-and-batch-bundle/new" element={<NewSerialAndBatchBundlePage />} />
          <Route path="serial-and-batch-bundle/:id" element={<SerialAndBatchBundleDetailPage />} />
          <Route path="serial-and-batch-bundles" element={<SerialAndBatchBundlePage />} />
          <Route path="serial-and-batch-bundles/new" element={<NewSerialAndBatchBundlePage />} />
          <Route path="serial-and-batch-bundles/:id" element={<SerialAndBatchBundleDetailPage />} />
          <Route path="inventory-dimension" element={<InventoryDimensionPage />} />
          <Route path="inventory-dimension/new" element={<NewInventoryDimensionPage />} />
          <Route path="inventory-dimension/:id" element={<InventoryDimensionDetailPage />} />
          <Route path="inventory-dimensions" element={<InventoryDimensionPage />} />
          <Route path="inventory-dimensions/new" element={<NewInventoryDimensionPage />} />
          <Route path="inventory-dimensions/:id" element={<InventoryDimensionDetailPage />} />
          <Route path="shipping-rule" element={<ShippingRulePage />} />
          <Route path="shipping-rule/new" element={<NewShippingRulePage />} />
          <Route path="shipping-rule/:id" element={<ShippingRuleDetailPage />} />
          <Route path="shipping-rules" element={<ShippingRulePage />} />
          <Route path="shipping-rules/new" element={<NewShippingRulePage />} />
          <Route path="shipping-rules/:id" element={<ShippingRuleDetailPage />} />
          
          <Route path="item-alternative" element={<ItemAlternativePage />} />
          <Route path="item-alternative/new" element={<NewItemAlternativePage />} />
          <Route path="item-alternative/:id" element={<ItemAlternativeDetailPage />} />
          <Route path="item-alternatives" element={<ItemAlternativePage />} />
          <Route path="item-alternatives/new" element={<NewItemAlternativePage />} />
          <Route path="item-alternatives/:id" element={<ItemAlternativeDetailPage />} />

          <Route path="delivery-trip" element={<DeliveryTripPage />} />
          <Route path="delivery-trip/new" element={<NewDeliveryTripPage />} />
          <Route path="delivery-trip/:id" element={<DeliveryTripDetailPage />} />
          <Route path="delivery-trips" element={<DeliveryTripPage />} />
          <Route path="delivery-trips/new" element={<NewDeliveryTripPage />} />
          <Route path="delivery-trips/:id" element={<DeliveryTripDetailPage />} />

          <Route path="quality-inspection-template" element={<QualityInspectionTemplatePage />} />
          <Route path="quality-inspection-template/new" element={<NewQualityInspectionTemplatePage />} />
          <Route path="quality-inspection-template/:id" element={<QualityInspectionTemplateDetailPage />} />
          <Route path="quality-inspection-templates" element={<QualityInspectionTemplatePage />} />
          <Route path="quality-inspection-templates/new" element={<NewQualityInspectionTemplatePage />} />
          <Route path="quality-inspection-templates/:id" element={<QualityInspectionTemplateDetailPage />} />

          {/* Stock Transactions */}
          <Route path="stock-entry" element={<StockEntryPage />} />
          <Route path="stock-entry/new" element={<NewStockEntryPage />} />
          <Route path="stock-entry/new-stock-entry" element={<NewStockEntryPage />} />
          <Route path="stock-entry/:id" element={<StockEntryDetailPage />} />
          <Route path="purchase-receipt" element={<PurchaseReceiptPage />} />
          <Route path="purchase-receipt/new" element={<NewPurchaseReceiptPage />} />
          <Route path="purchase-receipt/:id" element={<PurchaseReceiptDetailPage />} />
          <Route path="delivery-note" element={<DeliveryNotePage />} />
          <Route path="delivery-note/new" element={<NewDeliveryNotePage />} />
          <Route path="delivery-note/:id" element={<DeliveryNoteDetailPage />} />
          <Route path="material-request" element={<MaterialRequestPage />} />
          <Route path="material-request/new" element={<NewMaterialRequestPage />} />
          <Route path="material-request/:id" element={<MaterialRequestDetailPage />} />
          <Route path="pick-list" element={<PickListPage />} />
          <Route path="pick-list/new" element={<NewPickListPage />} />
          <Route path="pick-list/:id" element={<PickListDetailPage />} />
          <Route path="stock-reconciliation" element={<StockReconciliationPage />} />
          <Route path="stock-reconciliation/new" element={<NewStockReconciliationPage />} />
          <Route path="stock-reconciliation/:id" element={<StockReconciliationDetailPage />} />
          <Route path="tools/reconciliation" element={<StockReconciliationPage />} />
          <Route path="landed-cost-voucher" element={<LandedCostVoucherPage />} />
          <Route path="landed-cost-voucher/new" element={<NewLandedCostVoucherPage />} />
          <Route path="landed-cost-voucher/:id" element={<LandedCostVoucherDetailPage />} />
          <Route path="tools/landed-cost" element={<LandedCostVoucherPage />} />
          <Route path="repost-item-valuation" element={<RepostItemValuationPage />} />
          <Route path="repost-item-valuation/new" element={<NewRepostItemValuationPage />} />
          <Route path="repost-item-valuation/:id" element={<RepostItemValuationDetailPage />} />
          <Route path="tools/repost-valuation" element={<RepostItemValuationPage />} />
          <Route path="packing-slip" element={<PackingSlipPage />} />
          <Route path="packing-slip/new" element={<NewPackingSlipPage />} />
          <Route path="packing-slip/:id" element={<PackingSlipDetailPage />} />
          <Route path="tools/packing-slip" element={<PackingSlipPage />} />
          <Route path="movements" element={<StockMovementsPage />} />

          {/* Suppliers, Tools & Reports */}
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="tools/*" element={<ProductsPage />} />
          <Route path="reports/stock-ledger" element={<StockLedgerReportPage />} />
          <Route path="reports/ledger" element={<StockLedgerReportPage />} />
          <Route path="query-report/Stock%20Ledger" element={<StockLedgerReportPage />} />
          <Route path="reports/stock-balance" element={<StockBalanceReportPage />} />
          <Route path="reports/balance" element={<StockBalanceReportPage />} />
          <Route path="query-report/Stock%20Balance" element={<StockBalanceReportPage />} />
          <Route path="reports/quick-stock-balance" element={<QuickStockBalancePage />} />
          <Route path="quick-stock-balance" element={<QuickStockBalancePage />} />
          <Route path="quick-stock-balance/*" element={<QuickStockBalancePage />} />
          <Route path="reports/stock-projected-qty" element={<StockProjectedQtyReportPage />} />
          <Route path="query-report/Stock%20Projected%20Qty" element={<StockProjectedQtyReportPage />} />
          <Route path="reports/stock-analytics" element={<StockAnalyticsReportPage />} />
          <Route path="query-report/Stock%20Analytics" element={<StockAnalyticsReportPage />} />
          <Route path="reports/stock-ageing" element={<StockAgeingReportPage />} />
          <Route path="query-report/Stock%20Ageing" element={<StockAgeingReportPage />} />
          <Route path="reports/item-price-stock" element={<ItemPriceStockReportPage />} />
          <Route path="query-report/Item%20Price%20Stock" element={<ItemPriceStockReportPage />} />
          <Route path="reports/purchase-receipt-trends" element={<PurchaseReceiptTrendsPage />} />
          <Route path="query-report/Purchase%20Receipt%20Trends" element={<PurchaseReceiptTrendsPage />} />
          <Route path="reports/delivery-note-trends" element={<DeliveryNoteTrendsPage />} />
          <Route path="query-report/Delivery%20Note%20Trends" element={<DeliveryNoteTrendsPage />} />
          <Route path="reports/:reportSlug" element={<StockReportPage />} />
          <Route path="reports/*" element={<StockReportPage />} />
          <Route path="setup/*" element={<WarehousesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

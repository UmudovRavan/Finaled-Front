# Frontend Important Fixes (`Stock-Frontend`)

*(Qeyd: Burada yalnız gələcəkdə edilməli olan frontend işləri saxlanılır; artıq düzəldilmişlər siyahıdan çıxarılıb.)*

---

## 1. UOM (`Unit of Measure`) Səhifəsi
1. **Delete UI:** `Header.tsx` içindəki `...` (More) menyusuna `Delete` əməliyyatı və `UOMPage.tsx` siyahısında seçilmiş sətirlər (`selectedIds`) üçün toplu silmə (`Actions -> Delete`) düyməsi əlavə edilməlidir *(backend-də `DELETE` endpoint-i hazır olduqdan sonra)*.
2. **Siyahı səhifəsi (`UOMPage.tsx`):**
   - Cədvəlin sağ üst küncündəki `{filteredUOMs.length} of 239` sabit sayı real `{uoms.length}` ilə əvəz edilməlidir.
   - `Sort` dropdown-u (`Created On`, `ID`, `Category`, `UOM Name`) real sıralama etməlidir.
   - `Created On` sütunundakı sabit `'3 M'` əvəzinə real tarix göstərilməli, `Load More` backend pagination-a bağlanmalıdır.
3. **Detail səhifəsi (`UOMDetailPage.tsx` & `UOMDetailSidebar.tsx`):**
   - Səhifə refresh edildikdə `loading` bitməmiş `"UOM not found."` göstərməməlidir.
   - `Comments`, `Activity`, `Assign`, `Attachments`, `Tags`, `Share` bölmələri `/api/v1/stock/documents/Uom/{docId}/...` API-lərinə bağlanmalıdır.

---

## 2. UOM Conversion Factor Səhifəsi
1. **Delete UI:** Backend-də `DELETE` endpoint-i əlavə edildikdən sonra `Header.tsx` `...` menyusuna və `UOMConversionFactorPage.tsx` siyahısına `Delete` düyməsi bağlanmalıdır.
2. **Siyahı səhifəsi (`UOMConversionFactorPage.tsx`):**
   - Cədvəldə `ID` sütununda raw UUID əvəzinə oxunaqlı ad (`From → To`) və sağ üst küncdəki sabit `of 235` əvəzinə real say göstərilməlidir.

---

## 3. Item Group Səhifəsi
1. **Defaults & Item Tax cədvəlləri:** Backend `ItemGroupDto`-ya `Defaults` və `Item Tax` cədvəlləri əlavə olunduqda `NewItemGroupPage.tsx` və `ItemGroupDetailPage.tsx` daxilində bu cədvəllər API ilə sinxronlaşdırılmalıdır.
2. **`Parent Item Group` axtarış siyahısında təkrarlanan adlar (`NewItemGroupPage.tsx`):**
   - Dropdown/datalist içində eyni `itemGroupName` dəyərləri təkrar görünməməsi üçün `groups` siyahısı unikal edilməlidir.
3. **Siyahı səhifəsində (`ItemGroupPage.tsx`) toplu Delete:**
   - Seçilmiş qruplar üçün `Actions -> Delete` düyməsi əlavə olunmalıdır.

---

## 4. Brand Səhifəsi
1. **Brand Defaults cədvəlinin DB-də saxlanması:** Backend `BrandDto`-ya `defaults` əlavə olunduqda `stockService.createBrand` / `updateBrand` içində payload-a `defaults` daxil edilməlidir.
2. **Siyahı səhifəsində (`BrandPage.tsx`) toplu Delete:** Seçilmiş brendlər üçün `Actions -> Delete` düyməsi əlavə olunmalıdır.

---

## 5. Item Attribute Səhifəsi
1. **`Numeric Values` aralıq sahələri:** Backend `ItemAttributeDto`-da `numericValues: true` olduqda `fromRange`, `toRange`, `increment` sahələri var — gələcəkdə `Numeric Values` seçildikdə bu 3 input da formada göstərilməlidir.
2. **Siyahı səhifəsində (`ItemAttributePage.tsx`) toplu Delete:** Seçilmiş atributlar üçün `Actions -> Delete` düyməsi əlavə olunmalıdır.


## 6. Warehouse Səhifəsi
1. **Detail səhifəsində (`WarehouseDetailPage.tsx`) `Address and Contact` (`New Address`, `New Contact`), `Comments` və `New Email`:** Hal-hazırda yalnız statik UI-dır, backend endpoint-ləri ilə bağlanmalıdır.
2. **Header-də (`Header.tsx`) `View` menyusu:** `Warehouse` detail səhifəsində `View` düyməsi klikləndikdə dropdown açılmır (Stock Balance / Tree keçidləri əlavə olunmalıdır).
3. **Siyahı səhifəsində (`WarehousePage.tsx`) toplu Delete:** Seçilmiş anbarlar üçün `Actions -> Delete` düyməsi əlavə olunmalıdır.


## 7. Inventory Dimension Səhifəsi
1. **Delete inteqrasiyası (`InventoryDimensionContext.tsx` / `stockService.ts`):** Backend-də `DELETE /api/v1/stock/setup/inventory-dimensions/{id}` endpoint-i əlavə edildikdən sonra `deleteInventoryDimension` API çağırışı qoşulmalıdır.
2. **`fetchValueFrom` və `Mandatory Depends On (Backend)` expression mapping (`backendAdapters.ts` / `stockService.ts`):** Backend DTO-ya bu sahələr əlavə olunduqda `create` / `update` / `mapInventoryDimensionDtoToRecord` hissələrinə bağlanmalıdır.
3. **Siyahı səhifəsində (`InventoryDimensionPage.tsx`) toplu Delete:** Seçilmiş qeydlər üçün `Actions -> Delete` əlavə olunmalıdır.
4. **Detail səhifəsində (`InventoryDimensionDetailPage.tsx`) `Comments` və `New Email`:** Statik UI-dan backend API-yə keçirilməlidir.


## 8. Shipping Rule Səhifəsi
1. **Delete UI və API inteqrasiyası (`ShippingRuleDetailPage.tsx` / `ShippingRuleContext.tsx` / `ShippingRulePage.tsx`):** Backend-də `DELETE /api/v1/stock/setup/shipping-rules/{id}` endpoint-i əlavə edildikdən sonra Detail səhifəsinə `Delete` düyməsi və siyahı səhifəsinə toplu `Actions -> Delete` qoşulmalıdır.
2. **Detail səhifəsində (`ShippingRuleDetailPage.tsx`) `Comments` və `New Email`:** Statik UI-dan backend API-yə keçirilməlidir.


## 9. Quality Inspection Template Səhifəsi
1. **Delete UI və API inteqrasiyası (`QualityInspectionTemplateDetailPage.tsx` / `QualityInspectionTemplateContext.tsx` / `QualityInspectionTemplatePage.tsx`):** Backend-də `DELETE /api/v1/stock/setup/quality-inspection-templates/{id}` endpoint-i əlavə edildikdən sonra Detail səhifəsinə `Delete` düyməsi və siyahı səhifəsinə toplu `Actions -> Delete` qoşulmalıdır.
2. **Detail səhifəsində (`QualityInspectionTemplateDetailPage.tsx`) `Quality Inspection +` düyməsi, `Comments` və `New Email`:** `Quality Inspection +` keçidi və `Comments` / `New Email` backend API ilə bağlanmalıdır.


## 10. Item Səhifəsi
1. **Pricing və Connections tabları (`ItemDetailPage.tsx`):** `Pricing` tabındakı `Item Prices` siyahısı və `Connections` tabındakı əlaqəli sənəd sayğacları real backend məlumatı ilə bağlanmalıdır.
2. **Siyahı səhifəsində (`ItemPage.tsx`) toplu Delete:** Seçilmiş məhsullar üçün `Actions -> Delete` əlavə olunmalıdır.
3. **Detail səhifəsində (`ItemDetailPage.tsx`) `Comments` və `New Email`:** Statik UI-dan backend API-yə keçirilməlidir.


---

## 11. Serial No
1. **`SerialNoDetailPage.tsx`:** Backend `DELETE /api/v1/stock/setup/serial-numbers/{id}` endpointi əlavə edildikdən sonra silmə funksiyası bağlanmalıdır. `Item` və `Warehouse` sahələri üçün dinamik dropdown/search picker əlavə edilməlidir.

---

## 12. Batch
1. **`BatchDetailPage.tsx`:** Backend `DELETE /api/v1/stock/setup/batches/{id}` endpointi əlavə edildikdən sonra silmə funksiyası bağlanmalıdır. `Split Batch` (`POST .../split`) UI düyməsi əlavə edilə bilər.

---

## 13. Serial and Batch Bundle
1. **`SerialAndBatchBundleContext.tsx` / `SerialAndBatchBundleDetailPage.tsx`:** Backend `PUT` və `DELETE` endpointləri əlavə edildikdən sonra redaktə və silmə funksiyaları bağlanmalıdır. `Auto Pick` (`POST .../auto-pick`) UI funksionallığı inteqrasiya edilməlidir.

---

## 14. Item Alternative
1. **`ItemAlternativeContext.tsx` / `ItemAlternativeDetailPage.tsx`:** Backend `PUT /api/v1/stock/setup/item-alternatives/{id}` və `GET /{id}` endpointləri əlavə edildikdən sonra redaktə (`updateAlternative`) funksiyası API-yə bağlanmalıdır.

---

## 15. Delivery Trip
1. **`DeliveryTripContext.tsx` / `DeliveryTripDetailPage.tsx`:** Backend `DELETE` endpointi əlavə edildikdən sonra silmə funksiyası API-yə bağlanmalıdır. `Dispatch` (`POST .../dispatch`) və `Mark Visited` (`POST .../stops/{stopId}/visited`) düymələri API-yə bağlanmalıdır.


---

## 16. Stock Reconciliation
1. **`StockReconciliationContext.tsx` / `StockReconciliationDetailPage.tsx`:** Draft statusunda redaktə (`PUT /api/v1/stock/tools/reconciliations/{id}` — `stockService.updateStockReconciliation` artıq əlavə edilib) və `Fetch Warehouse Items` (`GET .../fetch-warehouse-items/{warehouseId}`) düyməsi UI-a bağlanmalıdır.

---

## 17. Landed Cost Voucher
1. **`LandedCostVoucherDetailPage.tsx`:** `Allocate` (`POST /api/v1/stock/tools/landed-cost-vouchers/{id}/allocate`) düyməsi API-yə bağlanmalıdır. Backend `PUT`/`DELETE` əlavə edildikdən sonra Draft redaktə və silmə bağlanmalıdır.

---

## 18. Repost Item Valuation
1. **`RepostItemValuationDetailPage.tsx`:** `Execute` (`POST /api/v1/stock/tools/repost-item-valuations/{id}/execute`) düyməsi API-yə bağlanmalıdır.

---

## 19. Packing Slip
1. **`PackingSlipDetailPage.tsx`:** Backend `PUT` və `DELETE` endpointləri əlavə edildikdən sonra Draft redaktə və silmə bağlanmalıdır.

---

## 20. Quality Inspection (Tools)
1. **`QualityInspectionPage` / `NewQualityInspectionPage` / `QualityInspectionDetailPage`:** Hazırda frontenddə yalnız `Quality Inspection Template` səhifələri var. Tools altındakı `/api/v1/stock/tools/quality-inspections` (`GET`, `POST`, `PUT`, `submit`, `cancel`) üçün tam CRUD səhifələri və `stockService.ts` metodları yaradılmalıdır.

---

## 21. Stock Entry
1. **`StockEntryContext.tsx` / `StockEntryDetailPage.tsx`:** Draft statusunda redaktə (`PUT /api/v1/stock/stock-entries/{id}`), `Create from Material Request` (`POST .../from-material-request/{materialRequestId}`) və `End Transit` (`POST .../end-transit/{finalTargetWarehouseId}`) düymələri API-yə bağlanmalıdır.

---

## 22. Purchase Receipt
1. **`PurchaseReceiptContext.tsx` / `PurchaseReceiptDetailPage.tsx`:** Draft statusunda redaktə (`PUT /api/v1/stock/purchase-receipts/{id}`), `Amend` (`POST .../amend`) və `Make Return` (`POST .../make-return`) əməliyyatları API-yə bağlanmalıdır.

---

## 23. Delivery Note
1. **`DeliveryNoteContext.tsx` / `DeliveryNoteDetailPage.tsx`:** Draft statusunda redaktə (`PUT /api/v1/stock/delivery-notes/{id}`), `Amend` (`POST .../amend`) və `Make Return` (`POST .../make-return`) əməliyyatları API-yə bağlanmalıdır.

---

## 24. Material Request
1. **`MaterialRequestContext.tsx` / `MaterialRequestDetailPage.tsx`:** Draft statusunda redaktə (`PUT /api/v1/stock/material-requests/{id}`) və `Generate Low Stock` (`POST .../generate-low-stock`) düyməsi API-yə bağlanmalıdır.

---

## 25. Pick List
1. **`PickListContext.tsx` / `PickListDetailPage.tsx`:** Draft statusunda redaktə (`PUT /api/v1/stock/pick-lists/{id}`), `Auto Allocate` (`POST .../auto-allocate`) və `Make Delivery Note` (`POST .../make-delivery-note`) düymələri API-yə bağlanmalıdır.

---

## 26. Stock Settings & Digər Settings Səhifələri
1. **`ItemVariantSettingsPage.tsx`, `StockRepostingSettingsPage.tsx`, `DeliverySettingsPage.tsx`:** Backend-də müvafiq endpointlər əlavə edildikdən sonra API-yə bağlanmalıdır (`SettingsPage.tsx` artıq `getStockSettings`/`updateStockSettings` ilə işləyir).


---

## 27. Canlı Brauzer Testlərindən Əlavə Frontend Tapıntıları (UI / UX)
1. **Dropdown / Autocomplete çatışmazlıqları:** `Serial No`, `Batch`, `Serial and Batch Bundle`, `Item Alternative`, `Delivery Trip`, `Stock Reconciliation`, `Landed Cost Voucher`, `Repost Item Valuation`, `Packing Slip` səhifələrində `Item`, `Warehouse`, `UOM`, `Customer`, `Delivery Note` sahələri düz mətn (`input`) əvəzinə dinamik dropdown/datalist olmalıdır.
2. **Türkçə böyük `İ` yazı xətaları:** `SerialNoDetailPage`, `BatchDetailPage`, `SerialAndBatchBundleDetailPage` başlıqlarında `DETAİLS`, `İNFORMATİON`, `DESCRİPTİON`, `SERİAL` kimi `İ` hərfi xətaları düzəldilməlidir.
3. **Purchase Receipt (`PurchaseReceiptDetailPage`):** API cavabı gələnə qədər müvəqqəti olaraq köhnə statik mock data (`Avalon (Demo)`, `Summit Traders Ltd.`, `SKU001`) görünür; header valyutası (`USD`) ilə sətir simvolu (`₼`) uyğunlaşdırılmalıdır.
4. **Delivery Note (`DeliveryNoteDetailPage`):** `Grand Total > 0` olduqda belə `In Words` sahəsi `"USD Zero only."` göstərir.
5. **Landed Cost Voucher (`NewLandedCostVoucherForm`):** `Get Items` düyməsi statik mock sətirlər (`SKU001`, `SKU002`) əvəzinə seçilmiş Purchase Receipt-dən real sətirləri gətirməlidir.
6. **Packing Slip (`NewPackingSlipForm`):** `Package Weight Details`-də `Net Weight` sətirlərdəki çəkilərdən avtomatik hesablanmalıdır.
7. **Pick List (`NewPickListPage` / `PickListDetailPage`):** Create formunda `Customer` sahəsi yoxdur, lakin Detail səhifəsində sabit `Palmer Productions Ltd.` görünür.
8. **Stock Settings (`SettingsPage.tsx`):** `Update existing Price List Rate` sahəsi `PUT` payload-a əlavə edilməlidir.


---

## 28. Yekun Əlavə Yoxlamalar (Köməkçi Səhifələr & List/Detail Əməliyyatları)
1. **List Səhifələri (`Bulk Delete`):** `/brand`, `/uom` və digər list səhifələrində sətir checkbox-ları seçildikdə `Actions -> Delete` menyusu açılmır (hazırda yalnız Detail səhifəsindən tək-tək `Delete` işləyir).
2. **Detail Səhifələri (`More -> Duplicate`):** `BrandDetailPage`, `UOMDetailPage` kimi səhifələrdə `More` (`...`) düyməsi menyu açmır.
3. **Köməkçi Səhifələr:** `/suppliers` səhifəsi backend supplier API-sinə bağlanmayıb (boş görünür); `/stock-movements` marşrutu mövcud deyil (`404`). (`/` Home, `/dashboard` Dashboard və `/products` Products canlı API ilə `200 OK` işləyir.)

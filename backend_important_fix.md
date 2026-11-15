# Backend Important Fixes (`Altensor-Backend` — Stock Modulu)

---

## 1. UOM (`Unit of Measure`) Səhifəsi
**Endpoint-lər:** `/api/v1/stock/setup/uoms`, `/api/v1/stock/setup/uoms/{id}`

1. **`UomDto` və Entity-də çatışmayan sahələr (`POST` və `PUT`):**
   - Hazırda backend-də `UomDto` yalnız 4 sahəni saxlayır:
     - `id` (`uuid`)
     - `uomName` (`string`)
     - `enabled` (`boolean`)
     - `mustBeWholeNumber` (`boolean`)
   - Frontend-dəki **New UOM** və **UOM Detail** formalarında olan aşağıdakı 4 sahə `UomDto`-da və databaza cədvəlində **yoxdur** (buna görə Save etdikdən sonra detail səhifəsində və siyahıda boş qalır):
     - `symbol` (`string?`)
     - `commonCode` (`string?`)
     - `description` (`string?`)
     - `category` (`string?`)
2. **`DELETE` endpoint-i yoxdur:**
   - `/api/v1/stock/setup/uoms/{id}` üzrə yalnız `PUT` metodu var.
   - UOM silmək üçün **`DELETE /api/v1/stock/setup/uoms/{id}`** endpoint-i əlavə olunmalıdır (həmçinin `/api/v1/stock/documents/Uom/bulk-action` ilə toplu silmə dəstəklənməlidir).
3. **Tək UOM oxuma (`GET by ID`) endpoint-i yoxdur:**
   - Detail səhifəsinə birbaşa linklə (`/uom/{id}`) daxil olduqda tək qeydi çəkmək üçün **`GET /api/v1/stock/setup/uoms/{id}`** endpoint-i əlavə olunmalıdır.
4. **Tarixçə / Audit sahələri (`createdAt`, `updatedAt`, `createdBy`):**
   - `UomDto` cavabında `createdAt` və `updatedAt` (və ya `createdBy`) qaytarılmalıdır ki, siyahıda `Created On` və detail səhifəsində `Created By / Last Edited` real vaxtı göstərsin.

---

## 2. UOM Conversion Factor Səhifəsi
**Endpoint-lər:** `/api/v1/stock/setup/uom-conversion-factors`, `/api/v1/stock/setup/uom-conversion-factors/{id}`

1. **`POST` və `PUT` cavabında `fromUomName` və `toUomName` sahələrinin `null` qayıtması:**
   - Backend-də yeni UOM Conversion Factor yaradıldıqda (`POST`) və ya yeniləndikdə (`PUT`), cavabda `fromUomId` və `toUomId` UUID olaraq qayıdır, lakin `fromUomName` və `toUomName` `null` qalır (navigation property load olunmur).
   - Backend `POST`/`PUT` cavabında da `fromUomName` və `toUomName` dolu qaytarılmalıdır.
2. **`DELETE` endpoint-i yoxdur:**
   - `/api/v1/stock/setup/uom-conversion-factors/{id}` üzrə yalnız `PUT` metodu mövcuddur.
   - Silmə əməliyyatı üçün **`DELETE /api/v1/stock/setup/uom-conversion-factors/{id}`** və tək qeyd oxumaq üçün **`GET /api/v1/stock/setup/uom-conversion-factors/{id}`** əlavə olunmalıdır.

---

## 3. Item Group Səhifəsi
**Endpoint-lər:** `/api/v1/stock/setup/item-groups/tree`, `/api/v1/stock/setup/item-groups`, `/api/v1/stock/setup/item-groups/{id}`

1. **`ItemGroupDto`-da Defaults və Item Tax cədvəllərinin olmaması (`POST`, `PUT`, `GET /tree`, `GET /{id}`):**
   - Frontend-də **New Item Group** və **Item Group Detail** formalarında `Item Group Defaults` (`Company`, `Default Warehouse`, `Default Price List`) və `Item Tax` (`Item Tax Template`, `Tax Category`, `Valid From`, `Min Net Rate`, `Max Net Rate`) cədvəlləri var.
   - Hazırda backend-də `ItemGroupDto` (`additionalProperties: false`) yalnız `defaultExpenseAccount`, `defaultIncomeAccount`, `defaultCostCenter` sahələrini saxlayır; buna görə bu 2 cədvəl **backend-ə göndərilə bilmir, bazaya yazılmır və detail/tree cavabında gəlmir**.
   - **Tələb:** `ItemGroupDto` və entity-yə `defaults` və `taxes` child kolleksiyaları əlavə olunmalı, həm `POST`/`PUT` zamanı yadda saxlanmalı, həm də `GET` cavablarında qaytarılmalıdır.
2. **Tək qeyd oxuma (`GET by ID`) və düz siyahı (`GET /item-groups`) endpoint-i yoxdur:**
   - Hazırda yalnız `/api/v1/stock/setup/item-groups/tree` var. Detail səhifəsi üçün `GET /api/v1/stock/setup/item-groups/{id}` və düz siyahı üçün `GET /api/v1/stock/setup/item-groups` əlavə olunmalıdır.
3. **`POST` və `PUT` cavabında `parentGroupName` sahəsinin dolu qaytarılması:**
   - Parent qrup seçildikdə cavabda `parentGroupName` də qaytarılmalıdır ki, detail səhifəsində dərhal adı görünsün.

---

## 4. Brand Səhifəsi
**Endpoint-lər:** `/api/v1/stock/setup/brands`, `/api/v1/stock/setup/brands/{id}`

1. **`BrandDto`-da `Brand Defaults` cədvəlinin olmaması (`POST`, `PUT`, `GET`):**
   - Frontend-də **New Brand** və **Brand Detail** formalarında `Brand Defaults` (`Company`, `Default Warehouse`, `Default Price List`) cədvəli var.
   - Hazırda backend-də `BrandDto` (`additionalProperties: false`) yalnız `id`, `brandName`, `description`, `imageUrl` sahələrini saxlayır; buna görə `defaults` kolleksiyası **backend-ə göndərilə bilmir, bazaya yazılmır və detail cavabında gəlmir**.
   - **Tələb:** `BrandDto` və entity-yə `defaults` kolleksiyası əlavə olunmalı, `POST`/`PUT` zamanı yadda saxlanmalı və `GET` cavablarında qaytarılmalıdır.
2. **Tək qeyd oxuma (`GET /api/v1/stock/setup/brands/{id}`) endpoint-i yoxdur.**

---

## 5. Item Attribute Səhifəsi
**Endpoint-lər:** `/api/v1/stock/setup/item-attributes`, `/api/v1/stock/setup/item-attributes/{id}`

1. **`ItemAttributeDto`-da `disabled` sahəsinin olmaması:**
   - Frontend-də `Disabled` checkbox-u var, lakin `ItemAttributeDto`-da `disabled` (`boolean`) sahəsi yoxdur (bazaya yazılmır).
2. **Tək qeyd oxuma (`GET /api/v1/stock/setup/item-attributes/{id}`) endpoint-i yoxdur.**


## 6. Warehouse Səhifəsi
1. **`WarehouseDto`-da `company` sahəsi yoxdur:** İstifadəçi Create zamanı `Avalon (Demo)` daxil etsə də `WarehouseDto`-da `company` (və ya `companyId`) sahəsi olmadığı üçün backend bunu saxlamır, Detail səhifəsində adapter sabit `'Altensor'` göstərir.
2. **`WarehouseDto`-da `customer` sahəsi yoxdur:** `Subcontracting Inward` üçün `Customer` sahəsi `WarehouseDto`-da mövcud deyil və saxlanmır.
3. **`WarehouseDto`-da audit/tarix sahələri (`createdAt`, `updatedAt`, `createdBy`) yoxdur:** Detail səhifəsində `Activity` bölməsi real backend tarixçəsini göstərə bilmir.
4. **`defaultInTransitWarehouseId` və `parentWarehouseId` yalnız UUID qəbul edir:** Mövcud olmayan anbar adı daxil edildikdə backend-də saxlanmır; yalnız sistemdə mövcud anbar seçildikdə UUID ilə bağlanır.


## 7. Inventory Dimension Səhifəsi
1. **Silmə (`DELETE /api/v1/stock/setup/inventory-dimensions/{id}`) endpoint-i yoxdur:** UI-da `Delete Dimension` düyməsi var, lakin backend-də DELETE endpoint-i olmadığı üçün qeyd yalnız lokal state-dən silinir (refresh-dən sonra geri qayıdır).
2. **Tək qeyd oxuma (`GET /api/v1/stock/setup/inventory-dimensions/{id}`) endpoint-i yoxdur.**
3. **`InventoryDimensionDto`-da `fetchValueFrom` sahəsi yoxdur:** Create zamanı `Fetch Value From` (`parent_warehouse` və s.) seçilsə də backend bu sahəni qəbul etmir və Detail səhifəsində boş gəlir.
4. **`Mandatory Depends On (Backend)` expression sahəsi yoxdur:** `InventoryDimensionDto`-da `mandatoryDependsOn` tipi `boolean`-dır (UI-dakı `Mandatory` checkbox-u üçün istifadə olunur), lakin textarea-dakı Python/filter expression (`string`) üçün ayrı sahə (`mandatoryDependsOnExpression` və s.) yoxdur.
5. **`InventoryDimensionDto`-da `createdAt` / `updatedAt` / `createdBy` sahələri yoxdur.**


## 8. Shipping Rule Səhifəsi
1. **Silmə (`DELETE /api/v1/stock/setup/shipping-rules/{id}`) endpoint-i yoxdur:** Shipping Rule qeydlərini backend-dən silmək üçün DELETE endpoint-i əlavə olunmalıdır.
2. **Tək qeyd oxuma (`GET /api/v1/stock/setup/shipping-rules/{id}`) endpoint-i yoxdur.**
3. **`ShippingRuleDto`-da `company` sahəsi yoxdur:** Create zamanı istifadəçi `Avalon (Demo)` daxil etsə də backend saxlamır, Detail səhifəsində adapter sabit `'Altensor'` göstərir.
4. **`ShippingRuleDto`-da `createdAt` / `updatedAt` / `createdBy` sahələri yoxdur.**


## 9. Quality Inspection Template Səhifəsi
1. **Silmə (`DELETE /api/v1/stock/setup/quality-inspection-templates/{id}`) endpoint-i yoxdur:** Şablonları backend-dən silmək üçün DELETE endpoint-i əlavə olunmalıdır.
2. **Tək qeyd oxuma (`GET /api/v1/stock/setup/quality-inspection-templates/{id}`) endpoint-i yoxdur.**
3. **`QualityInspectionTemplateDto`-da `createdAt` / `updatedAt` / `createdBy` sahələri yoxdur.**


## 10. Item Səhifəsi
1. **`ItemDto`-da olmayan UI sahələri:**
   - **Accounting (`Deferred Accounting`):** `enableDeferredExpense` və `enableDeferredRevenue` sahələri `ItemDto`-da yoxdur. Həmçinin `ItemDefaultConfigDto`-da `company` sahəsi yoxdur.
   - **Tax (`Withholding Category`):** `purchaseTaxWithholdingCategory` və `salesTaxWithholdingCategory` sahələri `ItemDto`-da yoxdur.
   - **Purchasing (`Drop Ship` & `Foreign Trade`):** `deliveredBySupplier`, `countryOfOrigin`, `customsTariffNumber` sahələri `ItemDto`-da yoxdur.
   - **Manufacturing:** `productionCapacity` sahəsi `ItemDto`-da yoxdur.
   - **Supplier / Customer lookup-ları:** `ItemSupplierDto.supplierId` və `ItemCustomerDetailDto.customerId` UUID tələb edir, lakin Stock modulunda Supplier/Customer siyahısı endpoint-i olmadığı üçün ad ilə göndərilə bilmir.
2. **`ItemDto`-da audit/tarix sahələri (`createdAt`, `updatedAt`, `createdBy`) yoxdur.**


---

## 11. Serial No (`/serial-no`, `/serial-no/new`, `/serial-no/:id`)

### Backend-də çatışmayan / yarımçıq olan hissələr:
1. **`DELETE /api/v1/stock/setup/serial-numbers/{id}` endpointi yoxdur.** Serial No silmək mümkün deyil.
2. **`SerialNumberDto`-da `description`, `serialNoDetails`, `companyId`, `location` və audit/tarix sahələri (`createdAt`, `updatedAt`, `createdBy`) yoxdur.**

---

## 12. Batch (`/batch-no`, `/batch-no/new`, `/batch-no/:id`)

### Backend-də çatışmayan / yarımçıq olan hissələr:
1. **`DELETE /api/v1/stock/setup/batches/{id}` endpointi yoxdur.** Batch silmək mümkün deyil.
2. **`BatchDto`-da `allowNegativeStock` ("Allow Negative Stock for Batch" checkboxu), `companyId`, `parentBatchId`, və audit/tarix sahələri (`createdAt`, `updatedAt`, `createdBy`) yoxdur.**

---

## 13. Serial and Batch Bundle (`/serial-and-batch-bundle`, `/serial-and-batch-bundle/new`, `/serial-and-batch-bundle/:id`)

### Backend-də çatışmayan / yarımçıq olan hissələr:
1. **`PUT /api/v1/stock/setup/serial-batch-bundles/{id}` və `DELETE /api/v1/stock/setup/serial-batch-bundles/{id}` endpointləri yoxdur.** Bundle yaradıldıqdan sonra redaktə və ya silmək mümkün deyil.
2. **`SerialAndBatchBundleDto`-da `companyId` və audit/tarix sahələri (`createdAt`, `updatedAt`, `createdBy`) yoxdur.**

---

## 14. Item Alternative (`/item-alternative`, `/item-alternative/new`, `/item-alternative/:id`)

### Backend-də çatışmayan / yarımçıq olan hissələr:
1. **`GET /api/v1/stock/setup/item-alternatives/{id}` və `PUT /api/v1/stock/setup/item-alternatives/{id}` endpointləri yoxdur.** Mövcud Item Alternative qeydini ID ilə gətirmək və redaktə (`update`) etmək mümkün deyil.
2. **`ItemAlternativeDto`-da audit/tarix sahələri (`createdAt`, `updatedAt`, `createdBy`) yoxdur.**

---

## 15. Delivery Trip (`/delivery-trip`, `/delivery-trip/new`, `/delivery-trip/:id`)

### Backend-də çatışmayan / yarımçıq olan hissələr:
1. **`DELETE /api/v1/stock/setup/delivery-trips/{id}` endpointi yoxdur.** Delivery Trip silmək mümkün deyil.
2. **`DeliveryTripDto`-da `companyId`, `driverEmail`, `employeeId`, `emailNotificationSent` və audit/tarix sahələri (`createdAt`, `updatedAt`, `createdBy`) yoxdur.**


---

## 16. Stock Reconciliation (`/stock-reconciliation`, `/stock-reconciliation/new`, `/stock-reconciliation/:id`)

### Backend-də çatışmayan / yarımçıq olan hissələr:
1. **`DELETE /api/v1/stock/tools/reconciliations/{id}` endpointi yoxdur.**
2. **`StockReconciliationDto`-da `companyId` və audit/tarix sahələri (`createdAt`, `updatedAt`, `createdBy`) yoxdur.**

---

## 17. Landed Cost Voucher (`/landed-cost-voucher`, `/landed-cost-voucher/new`, `/landed-cost-voucher/:id`)

### Backend-də çatışmayan / yarımçıq olan hissələr:
1. **`PUT /api/v1/stock/tools/landed-cost-vouchers/{id}` və `DELETE /api/v1/stock/tools/landed-cost-vouchers/{id}` endpointləri yoxdur.**
2. **`LandedCostVoucherDto`-da `companyId` və audit/tarix sahələri (`createdAt`, `updatedAt`, `createdBy`) yoxdur.**

---

## 18. Repost Item Valuation (`/repost-item-valuation`, `/repost-item-valuation/new`, `/repost-item-valuation/:id`)

### Backend-də çatışmayan / yarımçıq olan hissələr:
1. **`GET /api/v1/stock/tools/repost-item-valuations/{id}`, `PUT`, `DELETE` və `cancel` endpointləri yoxdur.**
2. **`RepostItemValuationDto`-da `companyId` və audit/tarix sahələri (`createdAt`, `updatedAt`, `createdBy`) yoxdur.**

---

## 19. Packing Slip (`/packing-slip`, `/packing-slip/new`, `/packing-slip/:id`)

### Backend-də çatışmayan / yarımçıq olan hissələr:
1. **`PUT /api/v1/stock/tools/packing-slips/{id}` və `DELETE /api/v1/stock/tools/packing-slips/{id}` endpointləri yoxdur.**
2. **`PackingSlipDto`-da `companyId`, `letterHead` və audit/tarix sahələri (`createdAt`, `updatedAt`, `createdBy`) yoxdur.**

---

## 20. Quality Inspection (Tools) (`/api/v1/stock/tools/quality-inspections`)

### Backend-də çatışmayan / yarımçıq olan hissələr:
1. **`DELETE /api/v1/stock/tools/quality-inspections/{id}` endpointi yoxdur.**
2. **`QualityInspectionDto`-da `companyId` və audit/tarix sahələri (`createdAt`, `updatedAt`, `createdBy`) yoxdur.**

---

## 21. Stock Entry (`/stock-entry`, `/stock-entry/new`, `/stock-entry/:id`)

### Backend-də çatışmayan / yarımçıq olan hissələr:
1. **`DELETE /api/v1/stock/stock-entries/{id}` endpointi yoxdur.**
2. **`StockEntryDto`-da `companyId` və audit/tarix sahələri (`createdAt`, `updatedAt`, `createdBy`) yoxdur.**

---

## 22. Purchase Receipt (`/purchase-receipt`, `/purchase-receipt/new`, `/purchase-receipt/:id`)

### Backend-də çatışmayan / yarımçıq olan hissələr:
1. **`DELETE /api/v1/stock/purchase-receipts/{id}` endpointi yoxdur.**
2. **`PurchaseReceiptDto`-da `companyId` və audit/tarix sahələri (`createdAt`, `updatedAt`, `createdBy`) yoxdur.**

---

## 23. Delivery Note (`/delivery-note`, `/delivery-note/new`, `/delivery-note/:id`)

### Backend-də çatışmayan / yarımçıq olan hissələr:
1. **`DELETE /api/v1/stock/delivery-notes/{id}` endpointi yoxdur.**
2. **`DeliveryNoteDto`-da `companyId` və audit/tarix sahələri (`createdAt`, `updatedAt`, `createdBy`) yoxdur.**

---

## 24. Material Request (`/material-request`, `/material-request/new`, `/material-request/:id`)

### Backend-də çatışmayan / yarımçıq olan hissələr:
1. **`DELETE /api/v1/stock/material-requests/{id}` endpointi yoxdur.**
2. **`MaterialRequestDto`-da `companyId` və audit/tarix sahələri (`createdAt`, `updatedAt`, `createdBy`) yoxdur.**

---

## 25. Pick List (`/pick-list`, `/pick-list/new`, `/pick-list/:id`)

### Backend-də çatışmayan / yarımçıq olan hissələr:
1. **`DELETE /api/v1/stock/pick-lists/{id}` endpointi yoxdur.**
2. **`PickListDto`-da `companyId` və audit/tarix sahələri (`createdAt`, `updatedAt`, `createdBy`) yoxdur.**

---

## 26. Stock Settings (`/settings`)

### Backend-də çatışmayan / yarımçıq olan hissələr:
1. **`StockSettingsDto`-da `companyId` və audit/tarix sahələri (`createdAt`, `updatedAt`, `createdBy`) yoxdur.**
2. **Digər settings səhifələri (`ItemVariantSettings`, `StockRepostingSettings`, `DeliverySettings`) üçün ayrıca backend endpointləri mövcud deyil.**


---

## 27. Canlı Brauzer Testlərindən Əlavə Backend Tapıntıları (Live QA)
1. **Serial No (`SerialNumberDto`):** UI-da mövcud olan `workOrder` və `companyId` sahələri backend DTO-da yoxdur.
2. **Delivery Trip (`POST /api/v1/stock/setup/delivery-trips`):** `stops[].customerId` `00000000-0000-0000-0000-000000000000` göndərildikdə `500 Internal Server Error` qaytarır (nullable olmalı və ya `400` validation qaytarmalıdır); `initialEmailNotificationSent` və `driverAddress` sahələri `DeliveryTripDto`-da yoxdur.
3. **Packing Slip (`POST /api/v1/stock/tools/packing-slips`):** `deliveryNoteId` və ya `itemId` `EMPTY_GUID` olduqda `500 Internal Server Error` əvəzinə aydın `400` validation xətası qaytarılmalıdır.
4. **Transactions Naming Series (`StockEntry`, `MaterialRequest`):** Backend `MAT-STE-.YYYY.-` və `MAT-MR-.YYYY.-` naming series şablonunu genişləndirmədən (expand etmədən) literal şəkildə qaytarır; `MaterialRequest` qty-də float32 dəqiqlik problemi (`1.000499963760376`) müşahidə olundu.
5. **Stock Settings (`GET/PUT /api/v1/stock/settings`):** Hər `GET` sorğusunda fərqli `id` UUID qayıdır və `PUT` ilə dəyişdirilən checkbox-lar (məs. `showBarcodeFieldInStockTransactions: false`) səhifə yeniləndikdə DB-də saxlanmır (əvvəlki halına qayıdır).

# Backend Review & Post-Fix Texniki Hesabatı (Backend_After_Fix_Review)
**Fayl:** `Backend_After_Fix_Review.md`  
**Layihə:** Altensor Accounting ERP (`Finaled-Back` & `Accounting-Front`)  
**Tarix:** 2026-10-11  
**Status:** KRİTİK (Production DB Schema Desynchronization - Blocker)  
**Müəllif:** Senior Full-Stack / Database Architecture Review  

---

## 1. Diaqnostika Xülasəsi (Executive Summary)

Frontend tərəfindən **Hesablar Planı (`/accounts`)** səhifəsi açılarkən və yeni hesab yaradılarkən backend tərəfindən ardıcıl olaraq **HTTP 400 Bad Request** xətaları qaytarılır:

1. **Səhifəyə daxil olarkən (`GET /api/Accounts`):**
   ```json
   {
     "title": "Verilənlər Bazası Xətası",
     "status": 400,
     "detail": "Verilənlər bazası əməliyyatında xəta baş verdi. Zəhmət olmasa administratora müraciət edin.",
     "instance": "/api/Accounts",
     "code": "PG_42703"
   }
   ```
2. **Yeni hesab yaradarkən (`POST /api/Accounts`):**
   ```json
   {
     "title": "Məlumat Bazası Xətası",
     "status": 400,
     "detail": "42703: \"Subcategory\" kolonu \"Accounts\" tablosunda mevcut değil\r\n\r\nPOSITION: 158",
     "instance": "/api/Accounts",
     "code": "DB_UPDATE_ERROR"
   }
   ```

### 📌 Problem Haradadır?
- **Frontend tərəfi:** **TAM DÜZGÜNDÜR.** Frontend DTO standartına tam uyğun olaraq dəyərləri (`category: 4, subcategory: 8, code: "601", name: "...", currency: "AZN"`) ötürür və cavab gözləyir.
- **Backend tərəfi:** **PROBLEM 100% BACKEND VƏ VERİLƏNLƏR BAZASININ SXEMİNDƏDİR (PostgreSQL Schema Out of Sync).**

---

## 2. Problem 1: `PostgreSQL Error 42703 (undefined_column)` - `Accounts` Cədvəlində `Subcategory` Sütununun Olmaması

### 2.1. Problemin Mahiyyəti və Təzahürü
PostgreSQL xəta kodu **`42703` (`undefined_column`)** o deməkdir ki, SQL sorğusunda adı çəkilən sütun fiziki olaraq cədvəldə mövcud deyil.

- **`GET /api/Accounts` zamanı:**  
  EF Core arxa planda bütün hesabları oxumaq üçün bu SQL sorğusunu generasiya edir:
  ```sql
  SELECT a."Id", a."Code", a."Name", a."Category", a."Subcategory", a."Type", a."ParentAccountId", ...
  FROM "Accounts" AS a
  WHERE a."TenantId" = @tenantId AND a."IsDeleted" = FALSE;
  ```
  PostgreSQL cədvəldə `"Subcategory"` sütununu tapmadığı üçün sorğunu icra etməkdən imtina edir (`PG_42703`). Nəticədə səhifə açılarkən heç bir hesab yüklənmir, cədvəl boş qalır.

- **`POST /api/Accounts` zamanı:**  
  Yeni hesab bazaya yazılarkən EF Core bu SQL sorğusunu göndərir:
  ```sql
  INSERT INTO "Accounts" ("Id", "Code", "Name", "Category", "Subcategory", "Type", ...)
  VALUES (@id, '601', 'Məhsul satışından gəlir', 4, 8, 0, ...);
  ```
  PostgreSQL `42703: "Subcategory" kolonu "Accounts" tablosunda mevcut değil` xətası ilə tranzaksiyanı ləğv edir (`DB_UPDATE_ERROR`).

---

### 2.2. Problemin Yaranma Səbəbi (Root Cause Analysis)

1. **Entity və Miqrasiya Kod Səviyyəsində Var:**  
   Backend repository-sində (`Finaled-Back\AltensorAccounting`):
   - `Account.cs` faylında `public AccountSubcategory? Subcategory { get; set; }` xassəsi əlavə olunub.
   - `CreateAccountDto` və `AccountDto` içərisində `Subcategory` mövcuddur.
   - Hətta `20261009221116_UpdateAccountingFeedback.cs` adlı EF Core miqrasiya faylı da yaradılıb.
2. **Lakin Canlı PostgreSQL Bazasına Tətbiq Edilməyib:**  
   Production serveri (`https://api-accounting.altensor.com`) qoşulduğu canlı PostgreSQL bazasında bu miqrasiya **icra edilməyib**.
3. **Startup-da `MigrateAsync()` Niyə İşləməyib?**  
   `Program.cs` daxilində (sətir 99-115) aşağıdakı kod var:
   ```csharp
   using (var scope = app.Services.CreateScope())
   {
       try
       {
           var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
           if (db.Database.CanConnect())
           {
               await db.Database.MigrateAsync();
           }
       }
       catch (Exception ex)
       {
           Log.Error(ex, "Error while applying migrations or ensuring company default accounts on startup");
       }
   }
   ```
   Canlı mühitdə (Docker / IIS / Linux service) tətbiq ayağa qalxarkən `await db.Database.MigrateAsync()` işə düşərkən xəta baş verib (məsələn: baza istifadəçisinin DDL `ALTER TABLE` hüququ məhdud olub, yaxud `__EFMigrationsHistory` münaqişəsi yaranıb, yaxud server `timeout` alıb). Kod `catch (Exception ex)` blokuna düşüb və loglayıb, lakin tətbiqin işini dayandırmayıb. Nəticədə API yeni DLL ilə (yəni `Subcategory` tələb edən kodla), lakin köhnə baza sxemi ilə işləməyə davam edib.

---

### 2.3. Zəncirvari Təsir (Risk Altında Olan Digər Cədvəllər)
`20261009221116_UpdateAccountingFeedback.cs` miqrasiyası yalnız `Subcategory` ilə məhdudlaşmır! Həmin miqrasiyada aşağıdakılar da var:
1. **`Accounts`**: `Subcategory` (integer, nullable).
2. **`CustomerInvoices`**: `DeliveryNoteId` (uuid, nullable), `SalesOrderId` (uuid, nullable).
3. **`Companies`**: `TaxRegime`, `VatRate`, `IsVatPayer`, `LegalForm`, `FiscalYearStartMonth`, `FiscalYearEndMonth`, `DirectorName`, `ChiefAccountantName`, `BankName`, `BankCode`, `BankAccountNumber`, `Iban`, `SwiftBic`, `CorrespondentAccount`, `StatisticalCode`, `AsanLoginId`, `LogoUrl`.
4. **Yeni Cədvəllər**: `SalesOrders`, `SalesOrderLines`, `DeliveryNotes`, `DeliveryNoteLines`, `InitialBalanceAuditLogs`.

Əgər bu miqrasiya tətbiq olunmayıbsa, şirkət rekvizitləri saxlanılarkən, satış sifarişi (`Sales Orders`) və ya təhvil aktı (`Delivery Notes`) yaradılarkən də eyni **42703** və ya **42P01 (relation does not exist)** xətaları çıxacaq.

---

## 3. Problemin Aradan Qaldırılma Yolları (How to Fix)

Backend / DevOps / Baza Administratoru bu problemi 3 müxtəlif yolla dərhal aradan qaldıra bilər:

### Yol 1: Təcili və Zəmanətli Həll — Birbaşa PostgreSQL DDL Skripti (MƏSLƏHƏT GÖRÜLƏN)
Bu həll canlı sistemi dayandırmadan dərhal 1 saniyə ərzində problemi aradan qaldırır:
PostgreSQL bazasına (`psql`, pgAdmin və ya DBeaver ilə) qoşularaq aşağıdakı SQL skriptini icra edin:

```sql
-- ============================================================================
-- 1. ACCOUNTS CƏDVƏLİNİN DÜZƏLDİLMƏSİ (Kritik - Hesablar Planı üçün)
-- ============================================================================
ALTER TABLE "Accounts" 
ADD COLUMN IF NOT EXISTS "Subcategory" integer NULL;

-- ============================================================================
-- 2. CUSTOMER INVOICES CƏDVƏLİNİN DÜZƏLDİLMƏSİ
-- ============================================================================
ALTER TABLE "CustomerInvoices" 
ADD COLUMN IF NOT EXISTS "DeliveryNoteId" uuid NULL;

ALTER TABLE "CustomerInvoices" 
ADD COLUMN IF NOT EXISTS "SalesOrderId" uuid NULL;

-- ============================================================================
-- 3. COMPANIES CƏDVƏLİNİN DÜZƏLDİLMƏSİ (Şirkət Məlumatları və Vergi Parametrləri)
-- ============================================================================
ALTER TABLE "Companies" ADD COLUMN IF NOT EXISTS "TaxRegime" text NOT NULL DEFAULT '';
ALTER TABLE "Companies" ADD COLUMN IF NOT EXISTS "VatRate" numeric NOT NULL DEFAULT 0;
ALTER TABLE "Companies" ADD COLUMN IF NOT EXISTS "IsVatPayer" boolean NOT NULL DEFAULT false;
ALTER TABLE "Companies" ADD COLUMN IF NOT EXISTS "LegalForm" text NOT NULL DEFAULT '';
ALTER TABLE "Companies" ADD COLUMN IF NOT EXISTS "FiscalYearStartMonth" integer NOT NULL DEFAULT 1;
ALTER TABLE "Companies" ADD COLUMN IF NOT EXISTS "FiscalYearEndMonth" integer NOT NULL DEFAULT 12;
ALTER TABLE "Companies" ADD COLUMN IF NOT EXISTS "DirectorName" text NULL;
ALTER TABLE "Companies" ADD COLUMN IF NOT EXISTS "ChiefAccountantName" text NULL;
ALTER TABLE "Companies" ADD COLUMN IF NOT EXISTS "BankName" text NULL;
ALTER TABLE "Companies" ADD COLUMN IF NOT EXISTS "BankCode" text NULL;
ALTER TABLE "Companies" ADD COLUMN IF NOT EXISTS "BankAccountNumber" text NULL;
ALTER TABLE "Companies" ADD COLUMN IF NOT EXISTS "Iban" text NULL;
ALTER TABLE "Companies" ADD COLUMN IF NOT EXISTS "SwiftBic" text NULL;
ALTER TABLE "Companies" ADD COLUMN IF NOT EXISTS "CorrespondentAccount" text NULL;
ALTER TABLE "Companies" ADD COLUMN IF NOT EXISTS "StatisticalCode" text NULL;
ALTER TABLE "Companies" ADD COLUMN IF NOT EXISTS "AsanLoginId" text NULL;
ALTER TABLE "Companies" ADD COLUMN IF NOT EXISTS "LogoUrl" text NULL;

-- ============================================================================
-- 4. EF MIGRATION TARİXÇƏSİNƏ QEYD EDİLMƏSİ (Dublikat xətalarının qarşısını almaq üçün)
-- ============================================================================
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
SELECT '20261009221116_UpdateAccountingFeedback', '8.0.2'
WHERE NOT EXISTS (
    SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261009221116_UpdateAccountingFeedback'
);
```

---

### Yol 2: Standard EF Core CLI ilə Miqrasiyanın Tətbiqi
Əgər backend mühitində CLI vasitəsilə icra etmək istəyirsinizsə:

```bash
# Backend qovluğunda canlı bazanın ConnectionString-i ilə:
dotnet ef database update --project AltensorAccounting.Persistence --startup-project AltensorAccounting.Api --connection "Host=CANLI_IP;Database=AltensorAccounting;Username=...;Password=..."
```

---

### Yol 3: `Program.cs` Daxilində Miqrasiyanın Səbəbini Yoxlamaq və Təhlükəsizləşdirmək
Canlı serverin Serilog / Docker loglarını yoxlayın:
```bash
grep -i "Error while applying migrations" app.log
```
Əgər bazaya qoşulan PostgreSQL istifadəçisinin `ALTER TABLE` hüququ yoxdursa, PostgreSQL-də istifadəçiyə hüquq verin:
```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "db_user";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "db_user";
```

---

## 4. Frontend Tərəfinin Vəziyyəti (Frontend Status)

Frontend tərəfində **heç bir çatışmazlıq və ya sintaksis xətası yoxdur**:
1. `src/types/accounting.ts` daxilində `AccountCategory` (0..4) və `AccountSubcategory` (0..16) enum-ları və string ad xəritələri tam quraşdırılıb.
2. `AccountsPage.tsx` daxilində Subcategory açılan siyahısı kateqoriyaya görə dinamik filtrlənir.
3. Form təsdiqlənərkən backend DTO spesifikasiyasına uyğun JSON body ötürülür:
   ```json
   {
     "code": "601",
     "name": "Məhsul satışından gəlir",
     "category": 4,
     "subcategory": 8,
     "type": 0,
     "currency": "AZN",
     "isControlAccount": false,
     "parentAccountId": null
   }
   ```
4. Frontend `npm run build` və `tsc --noEmit` yoxlamalarından 100% uğurla keçir.

---

## 5. Xülasə və Növbəti Addım

Backend administratoru tərəfindən **Yol 1**-dəki SQL skripti (xüsusilə `ALTER TABLE "Accounts" ADD COLUMN IF NOT EXISTS "Subcategory" integer NULL;`) bazada icra edildiyi andan etibarən:
- `GET /api/Accounts` dərhal 200 OK qaytaracaq və bütün hesablar ekranda görünəcək.
- `POST /api/Accounts` dərhal 200/201 OK qaytaracaq və yeni hesab (601) bazada yaranacaq.

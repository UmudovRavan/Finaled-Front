# Altensor Accounting – Frontend Review

> Tarix: 2026-10-07 · Scope: `Accounting-Front`
> Backend problemləri ayrıca [REVIEW.md](REVIEW.md) faylındadır. Bu fayl yalnız frontend-ə aiddir.
> Bu fayl da problemlər gəldikcə genişlənəcək.

---

## 1. Ümumi nəticə

Satış qaiməsi, mal qəbulu, alış qaiməsi və stok hərəkəti **post** xətalarının (`Hesablanmış ƏDV...`, `GRNI...`, `AP...`, `COGS...`) **heç biri frontend səhvi deyil.** Sorğular backend-ə düzgün çatır, backend `400 BUSINESS_RULE_ERROR` qaytarır, frontend də mesajı göstərir.

| Yoxlanan | Nəticə |
|----------|--------|
| `POST /customer-invoices/{id}/post` | ✅ düzgün endpoint |
| `POST /Procurement/goods-receipts/{id}/post` | ✅ |
| `POST /Procurement/supplier-invoices/{id}/post` | ✅ |
| `POST /Inventory/stock-transactions/{id}/post` | ✅ |
| `Authorization: Bearer` + `X-Tenant-Id` header (`httpClient.ts`) | ✅ |
| 401 üçün refresh queue | ✅ |
| FormData üçün `Content-Type` boundary | ✅ |
| Backend `detail` mesajının UI-da göstərilməsi | ✅ |

Lakin backend problemini **gizlətməyə çalışan və təhlükəsizlik riski yaradan** workaround-lar var (aşağıda).

---

## 2. F1 – Gizli açar brauzer kodunda + `/internal/*` çağırışı (🔴 təcili)

> ✅ **Status (2026-10-07): frontend-dən silinib.** `ensureTenantAccountingSeeded`, onun çağırış yeri və açar `customersService.ts`-dən çıxarılıb. Satış qaiməsi post-u indi yalnız fiskal recovery edir.
> ⚠️ **Qalan iş:** açar eyni zamanda backend `appsettings.json` fayllarında və `WEBHOOK_INTEGRATION_SPEC.md`-də açıq mətn kimi durur (və git tarixçəsindədir). Açar **rotate edilməlidir** (REVIEW.md, B5).

**Yer:** `src/api/customersService.ts:125-156` (`ensureTenantAccountingSeeded`) və `:516-536` (çağırıldığı yer).

```ts
await axios.post(`${rootUrl}/internal/webhooks/user-created`, {...}, {
  headers: {
    'X-Internal-Api-Key': '<REDACTED>',
    'X-Webhook-Secret':   '<REDACTED>',
  },
});
```

### Risklər

| Risk | Təsir |
|------|-------|
| 🔴 Server-to-server gizli açar JS bundle-ında | İstənilən istifadəçi DevTools-dan açarı görür. Açarla istənilən tenant üçün `user-created` göndərib saxta istifadəçi yarada və seed-i tetikləyə bilər. Eyni açar bütün modullarda ortaqdırsa, digər servislərin internal endpoint-ləri də təhlükədədir. |
| 🟠 İşləmir | Backend-də webhook `PK_Users` xətası ilə yıxılır (bax REVIEW.md, Bölmə 3.3). DevTools-dakı ikinci `user-created 400` məhz budur. |
| 🟠 Yalnız satış qaiməsi üçün var | Mal qəbulu, alış qaiməsi və stok hərəkətində belə recovery yoxdur. |
| 🟡 Xəta mətninə bağlıdır | `errDetail.includes('default hesab')`, `'Debitor borclar'`, `'Hesablanmış ƏDV'` kimi mətn yoxlamaları var. Backend mesajı dəyişsə, recovery sakitcə söndürülür. |

### Həll

1. `ensureTenantAccountingSeeded` funksiyasını və hardcoded açarı **sil**.
2. Açarı dərhal **rotate et** (artıq bundle-da, brauzer cache-ində və Network loglarında açıqdır). Backend tərəfi: REVIEW.md, B5.
3. Brauzer heç vaxt `/internal/*` endpoint-ə sorğu göndərməməlidir.
4. Recovery əvəzinə backend-də yaradılacaq JWT ilə qorunan `POST /api/accounts/seed-template` endpoint-ini çağır (REVIEW.md, B4). Yalnız Admin/Accountant rolu üçün göstər.
5. Xəta mətni əvəzinə backend-in xəta **kodunu** yoxla (məs. `MISSING_DEFAULT_ACCOUNT`; backend tərəfi: REVIEW.md, B4).

**Gözlənilən nəticə:** açar bundle-dan çıxır, saxta istifadəçi yaratma riski bağlanır, seed yalnız səlahiyyətli istifadəçinin sorğusu ilə, JWT ilə işləyir.

---

## 3. F2 – Post xətalarında istifadəçi yönləndirilmir

Hazırda 4 ekranda da xəta qırmızı banner kimi göstərilir (məs. *"GRNI / Accrued Purchases hesabı təyin edilməyib."*). Adi istifadəçi bunun nə demək olduğunu və nə edəcəyini bilmir.

### Həll

- Backend `MISSING_DEFAULT_ACCOUNT` kodu qaytardıqdan sonra (REVIEW.md, B4), 4 ekranda ortaq komponent göstər:
  *"Hesab planı və ya default hesablar qurulmayıb."* + düymə **"Parametrlərə keç"** (`SettingsPage`).
- Admin üçün **"Standart hesab planını yarat"** düyməsi (F1-də qeyd olunan endpoint).
- Hesablar qurulanda ekran avtomatik yenilənsin və post yenidən cəhd olunsun.

Backend düzələnə qədər müvəqqəti mətn: *"Hesab planı qurulmayıb. Administrator ilə əlaqə saxlayın."*

---

## 4. F3 – Backend xətalarını gizlədən fallback-lar

Bu kod parçaları problemi görünməz edir və real datanı yanlış göstərə bilər.

| # | Yer | Problem | Tövsiyə |
|---|-----|---------|---------|
| F3.1 | `accountsService.seedTemplate` (`accountsService.ts:216-224`) | `/Accounts/seed-template` çağırır. **Backend-də belə endpoint yoxdur** (404). `catch` isə saxta uğur qaytarır: `{ message: 'Şablon qeydiyyatı' }`. İstifadəçi şablonun yarandığını düşünür. | Saxta uğuru sil, xətanı göstər. Endpoint backend-də yaradılandan sonra (REVIEW.md, B4) işləyəcək. |
| F3.2 | `getJournalEntries` / `createJournalEntry` / `getJournalEntry` / `postJournalEntry` / `reverseJournalEntry` (`accountsService.ts`) | Jurnallar `localStorage`-da (`altensor_manual_journals`) saxlanılır və backend cavabı boşdursa və ya xəta verərsə **lokal data göstərilir**. Real backend vəziyyəti ilə uyğunsuzluq yaranır, başqa cihazda/brauzerdə fərqli data görünür. | `localStorage` fallback-ını sil. Backend xətasını göstər. Mənbə həmişə backend olsun. |
| F3.3 | `setInitialBalance` (`accountsService.ts:88-214`) | Bütün hesabları çəkir, əks hesabı (equity) özü seçir ("category 3 və ya kod 3000/3010/3100", tapılmasa **istənilən başqa hesab**) və yoxdursa `3100` hesabını özü yaradır. Yanlış hesaba qarşı yazılış ola bilər. Hesab planını yarımçıq yaradan hallardan biri də budur (REVIEW.md, Bölmə 3.1). | Əks hesab seçimini backend-ə köçür (`Company.DefaultRetainedEarningsAccountId`). Frontend yalnız `POST /initial-balances` kimi bir çağırış etsin. |
| F3.4 | `postJournalEntry` və `customersService` post metodu | Fiskal dövr xətasını mətn ilə (`'maliyyə dövrü'`, `'fiscal'`, `'Posting tarixi'`) tanıyıb gizli şəkildə `/fiscal-periods/years` çağırır və yenidən post edir. İstifadəçinin xəbəri olmadan maliyyə ili yaradılır. | Backend posting zamanı fiskal ili özü yaratsın və ya UI-da açıq təsdiq soruşulsun (REVIEW.md, Bölmə 8). |
| F3.5 | `getAccount` (`accountsService.ts:18-28`) | `/Accounts/{id}` istənilən xətada (401, 500, şəbəkə) susur və siyahıdan axtarır. Real xəta gizlənir. | Yalnız `404` üçün fallback et, digər xətaları göstər. |
| F3.6 | `createAccount` (`accountsService.ts:30-77`) | `categoryMap[data.category] \|\| 1` — naməlum kateqoriya sakitcə `Asset` (1) olur. Kateqoriya səhv göndərilsə, hesab səhv kateqoriyada yaranır və posting axtarışına (kod/tip) təsir edir. | Naməlum dəyəri xəta kimi at. Enum xəritələri bir yerdə (`dto`) saxlanılsın. |
| F3.7 | `createJournalEntry` | `exchangeRate: 1.0` sabitdir və `currency` qeyd olunsa belə kurs göndərilmir. Xarici valyutalı jurnal səhv hesablanar. | Kursu formadan və ya backend-dən götür. |

**Gözlənilən nəticə:** backend problemi olanda UI-da görünür, istifadəçi yanlış data görmür, "işləyir kimi görünür" vəziyyəti aradan qalxır.

---

## 5. Tətbiq sırası

| Addım | İş | Risk |
|-------|----|------|
| 1 | F1: gizli açarı və `ensureTenantAccountingSeeded`-i sil, açarı rotate et | Aşağı |
| 2 | F3.1, F3.2, F3.5: saxta uğur və `localStorage` fallback-larını sil | Aşağı |
| 3 | F2: post xətası üçün ortaq komponent (backend kodu hazır olandan sonra) | Aşağı |
| 4 | F3.3, F3.4, F3.6, F3.7: logikanı backend-ə köçür | Orta |

> Qeyd: F1-i silmək üçün əvvəlcə REVIEW.md-dəki backend düzəlişləri (B1, B2, B4) deploy olunmalıdır, əks halda satış qaiməsi üçün müvəqqəti recovery itəcək.

# AltensorStock Backend Review — Detail Sidebar (Attachments, Tags, Share)

Bu sənəd `Stock-Frontend` detail səhifələrinin sağ/yan panelinə (`DocumentSidebarMeta`, `UploadAttachmentModal`, `ShareDocumentModal`) əlavə edilən **Attachments**, **Tags** və **Share** funksionallıqlarının `Altensor-Backend\AltensorStock` kod bazasında mövcud vəziyyətini və əlavə edilməli olan backend dəyişikliklərini əhatə edir.

---

## 1. Mövcud Vəziyyət (Backend Kod Təhlili)

### A. Tags — Mövcuddur (Kiçik təkmilləşdirmə tələb oluna bilər)
- **Entity:** `AltensorStock.Domain/Entities/UserAndMetadata.cs` → `DocumentTag : BaseEntity` (`DocumentType`, `DocumentId`, `TagName`, `ColorHex`).
- **DTO:** `AltensorStock.Contract/Common/FilterAndPaginationDtos.cs` → `DocumentTagDto`, `CreateDocumentTagDto`.
- **Controller:** `AltensorStock.Api/Controllers/ReportsAndMetadataController.cs` (`DocumentMetadataController`, `[Route("api/v1/stock/documents")]`):
  - `GET {docType}/{docId:guid}/tags`
  - `POST {docType}/{docId:guid}/tags`
  - `DELETE {docType}/{docId:guid}/tags/{tagName}`
- **Status:** Frontend ilə uyğundur. Eyni sənədə eyni `TagName` təkrar əlavə edildikdə dublikat yaranmaması üçün `DocumentMetadataService.AddTagAsync` daxilində case-insensitive yoxlama olması tövsiyə olunur.

---

### B. Attachments — Qismən Mövcuddur (Real Fayl Saxlama, Download, Public Link və Link Tipi Əskikdir)
- **Entity:** `AltensorStock.Domain/Entities/UserAndMetadata.cs` → `DocumentAttachment : BaseEntity`
  - Mövcud sahələr: `DocumentType`, `DocumentId`, `FileName`, `ContentType`, `FileSizeBytes`, `StoragePath`, `IsPrivate` (default `true`), `UploadedByUserId`.
- **DTO:** `CreateDocumentAttachmentDto` (`FileName`, `ContentType`, `FileSizeBytes`, `Base64Content`, `IsPrivate`), `DocumentAttachmentDto`.
- **Problem (`DocumentMetadataService.cs`, sətir 125–139):**
  ```csharp
  attachment.StoragePath = $"/uploads/{_tenantService.TenantId}/{docType}/{docId}/{Guid.NewGuid():N}_{dto.FileName}";
  ```
  1. `dto.Base64Content` **heç yerə yazılmır** (nə diskə/object storage-a, nə də bazaya). Yalnız virtual `StoragePath` string-i yaradılır.
  2. **Fayl yükləmə / önizləmə (Download) endpoint-i yoxdur** (`GET api/v1/stock/documents/attachments/{attachmentId:guid}/download` və ya public fayllar üçün `[AllowAnonymous]` endpoint).
  3. **Xarici Link (`Link` tabı) və `Optimize` dəstəyi yoxdur:** `DocumentAttachment` entity-sində və DTO-larda `ExternalUrl` (və ya `SourceType`: `Device` / `Link` / `Library` / `Camera`) saxlanılmır.
  4. **`IsPrivate` statusunun sonradan dəyişdirilməsi (`PATCH` endpoint-i) yoxdur:** İstifadəçi faylı `Private`/`Public` arasında dəyişmək istəsə, ayrıca endpoint lazımdır.

#### Backend-də edilməli olanlar (Attachments):
1. **`DocumentAttachment` Entity & DTO yenilənməsi:**
   - `ExternalUrl` (`string?`) əlavə etmək (Link ilə əlavə olunan fayllar üçün).
   - `Base64Content` məzmununu real storage-a (məs. lokal `wwwroot/uploads` və ya S3/MinIO) yazmaq və `StoragePath`-i real əlçatan URL/yol kimi qaytarmaq.
   - `CreateDocumentAttachmentDto`-ya `ExternalUrl` (`string?`) və `Optimize` (`bool`) əlavə etmək (`Optimize == true` olduqda şəkilləri sıxmaq/resize etmək).
2. **Yeni Endpoint-lər (`DocumentMetadataController`):**
   - `GET api/v1/stock/documents/attachments/{attachmentId:guid}/download` — auth yoxlaması ilə faylı stream/file kimi qaytarmaq (`IsPrivate == false` olduqda `[AllowAnonymous]` və ya public token ilə girişə icazə vermək).
   - `PATCH api/v1/stock/documents/attachments/{attachmentId:guid}/visibility` — `{ "isPrivate": true/false }` yeniləmək.
   - `GET api/v1/stock/documents/attachments/library` — tenant üzrə əvvəl yüklənmiş faylların siyahısını (`Library` seçimi üçün) qaytarmaq.

---

### C. Share — Backend-də Ümumiyyətlə Yoxdur (Tam Sıfırdan Əlavə Edilməlidir)
`AltensorStock` kod bazasında (`Domain`, `Contract`, `Application`, `Persistence`, `Api`) sənəd paylaşımı (`DocumentShare`) ilə bağlı **heç bir entity, DbSet, DTO, service metodu və ya controller endpoint-i yoxdur**.
*(Qeyd: Frontend hazırda `GET/POST /api/v1/stock/documents/{docType}/{docId}/shares` və `DELETE /api/v1/stock/documents/shares/{shareId}` endpoint-lərini çağırır, backend 404 qaytardıqda müvəqqəti `localStorage` fallback-ı ilə işləyir.)*

#### Backend-də əlavə edilməli olanlar (Share):

1. **Domain Entity (`AltensorStock.Domain/Entities/UserAndMetadata.cs`):**
   ```csharp
   public class DocumentShare : BaseEntity
   {
       public string DocumentType { get; set; } = string.Empty;
       public Guid DocumentId { get; set; }
       public Guid? SharedWithUserId { get; set; }
       public string SharedWithUserName { get; set; } = string.Empty; // "Everyone" və ya istifadəçi adı/email
       public bool IsEveryone { get; set; }
       public bool CanRead { get; set; }
       public bool CanWrite { get; set; }
       public bool CanSubmit { get; set; }
       public bool CanShare { get; set; }
       public Guid? SharedByUserId { get; set; }
   }
   ```

2. **`AppDbContext.cs` (`AltensorStock.Persistence/Data/AppDbContext.cs`):**
   - `public DbSet<DocumentShare> DocumentShares => Set<DocumentShare>();` əlavə etmək.
   - `TenantId` query filter-i (digər `BaseEntity` / `ITenantEntity` cədvəllərindəki kimi) və `(TenantId, DocumentType, DocumentId, SharedWithUserName)` üzrə indeks/konfiqurasiya + yeni EF Core migration yaratmaq.

3. **Contract DTO-lar (`AltensorStock.Contract/Common/FilterAndPaginationDtos.cs`):**
   ```csharp
   public class DocumentShareDto
   {
       public Guid Id { get; set; }
       public string DocumentType { get; set; } = string.Empty;
       public Guid DocumentId { get; set; }
       public Guid? UserId { get; set; }
       public string UserName { get; set; } = string.Empty;
       public bool IsEveryone { get; set; }
       public bool CanRead { get; set; }
       public bool CanWrite { get; set; }
       public bool CanSubmit { get; set; }
       public bool CanShare { get; set; }
   }

   public class UpsertDocumentShareDto
   {
       public Guid? Id { get; set; }
       public Guid? UserId { get; set; }
       public string UserName { get; set; } = string.Empty;
       public bool IsEveryone { get; set; }
       public bool CanRead { get; set; }
       public bool CanWrite { get; set; }
       public bool CanSubmit { get; set; }
       public bool CanShare { get; set; }
   }
   ```

4. **Service (`IDocumentMetadataService` & `DocumentMetadataService`):**
   - `Task<List<DocumentShareDto>> GetSharesAsync(string docType, Guid docId, CancellationToken ct = default);`
   - `Task<DocumentShareDto> UpsertShareAsync(string docType, Guid docId, UpsertDocumentShareDto dto, CancellationToken ct = default);`
     - `IsEveryone == true` və ya eyni `UserId`/`UserName` mövcuddursa yeniləmək (upsert), yoxdursa yeni sətir əlavə etmək + `LogActivityAsync(docType, docId, "Shared", ...)` yazmaq.
   - `Task DeleteShareAsync(Guid shareId, CancellationToken ct = default);`

5. **Controller (`DocumentMetadataController` in `ReportsAndMetadataController.cs`):**
   - `GET api/v1/stock/documents/{docType}/{docId:guid}/shares`
   - `POST api/v1/stock/documents/{docType}/{docId:guid}/shares`
   - `DELETE api/v1/stock/documents/shares/{shareId:guid}`
   - *(Opsional, Share modalında autocomplete üçün)*: `GET api/v1/stock/documents/users?search=...` (`AppDbContext.Users` cədvəlindən aktiv istifadəçiləri qaytarmaq).

6. **Assign Hissəsi:**
   - UI tələbinə əsasən bütün detail səhifələrinin yan panelindən **Assign** hissəsi çıxarılıb. Backend-dəki `DocumentAssignments` endpoint-ləri mövcud olaraq qala bilər və ya istifadə olunmursa gələcəkdə təmizlənə bilər.
-
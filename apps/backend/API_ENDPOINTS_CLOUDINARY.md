# Cloudinary API Endpoints

## Research Endpoints

### 1. Upload Research PDF
رفع ملف PDF الرئيسي للبحث

**Endpoint:** `POST /api/research/:id/upload-pdf`

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

**Body:**
```
file: PDF file (multipart/form-data)
```

**Response:**
```json
{
  "id": "uuid",
  "research_number": "RES-2024-001",
  "title": "عنوان البحث",
  "file_url": "https://res.cloudinary.com/dxcgmdbbs/raw/upload/v1234567890/research/pdfs/RES-2024-001/research-paper.pdf",
  "cloudinary_public_id": "research/pdfs/RES-2024-001/research-paper",
  "cloudinary_secure_url": "https://res.cloudinary.com/dxcgmdbbs/raw/upload/v1234567890/research/pdfs/RES-2024-001/research-paper.pdf"
}
```

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', pdfFile);

const response = await fetch('/api/research/123/upload-pdf', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': 'Bearer your-token'
  }
});

const research = await response.json();
```

---

### 2. Upload Supplementary File
رفع ملف إضافي للبحث (Excel, Word, ZIP, etc.)

**Endpoint:** `POST /api/research/:id/upload-supplementary`

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

**Body:**
```
file: Any file (multipart/form-data)
category: "supplementary" | "revision"
```

**Response:**
```json
{
  "id": "uuid",
  "research_id": "uuid",
  "file_name": "data.xlsx",
  "file_url": "https://res.cloudinary.com/dxcgmdbbs/raw/upload/...",
  "file_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "file_size": 1024000,
  "file_category": "supplementary",
  "cloudinary_public_id": "research/supplementary/RES-2024-001/data",
  "cloudinary_secure_url": "https://res.cloudinary.com/...",
  "cloudinary_format": "xlsx",
  "cloudinary_resource_type": "raw",
  "uploaded_at": "2024-10-23T14:00:00.000Z"
}
```

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', excelFile);
formData.append('category', 'supplementary');

const response = await fetch('/api/research/123/upload-supplementary', {
  method: 'POST',
  body: formData,
});

const file = await response.json();
```

---

### 3. Get File Download URL
الحصول على رابط تحميل مباشر للملف

**Endpoint:** `GET /api/research/files/:file_id/download-url`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "download_url": "https://res.cloudinary.com/dxcgmdbbs/raw/upload/fl_attachment:data.xlsx/..."
}
```

**Example (JavaScript):**
```javascript
const response = await fetch('/api/research/files/file-uuid/download-url');
const { download_url } = await response.json();

// فتح رابط التحميل
window.open(download_url, '_blank');
```

---

### 4. Get PDF Thumbnail
الحصول على صورة مصغرة لصفحة من PDF

**Endpoint:** `GET /api/research/:id/pdf-thumbnail?page=1`

**Query Parameters:**
- `page` (optional): رقم الصفحة (default: 1)

**Response:**
```json
{
  "thumbnail_url": "https://res.cloudinary.com/dxcgmdbbs/image/upload/pg_1,w_300,c_scale,q_auto/research/pdfs/RES-2024-001/research-paper.jpg"
}
```

**Example (JavaScript):**
```javascript
// الصفحة الأولى
const response = await fetch('/api/research/123/pdf-thumbnail?page=1');
const { thumbnail_url } = await response.json();

// عرض الصورة
document.getElementById('thumbnail').src = thumbnail_url;
```

---

---

## Research Revisions Endpoints

### 8. Upload Revision File
رفع ملف التعديل المطلوب للبحث

**Endpoint:** `POST /api/research-revisions/:id/upload-file`

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

**Body:**
```
file: PDF file (multipart/form-data)
```

**Response:**
```json
{
  "id": "uuid",
  "research_id": "uuid",
  "revision_number": 1,
  "revision_notes": "ملاحظات التعديل",
  "file_url": "https://res.cloudinary.com/dxcgmdbbs/raw/upload/.../research/revisions/RES-2024-001/revision-1/revised-paper.pdf",
  "cloudinary_public_id": "research/revisions/RES-2024-001/revision-1/revised-paper",
  "cloudinary_secure_url": "https://res.cloudinary.com/...",
  "status": "submitted",
  "submitted_at": "2024-10-23T14:00:00.000Z"
}
```

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', revisedPdfFile);

const response = await fetch('/api/research-revisions/revision-uuid/upload-file', {
  method: 'POST',
  body: formData,
});

const revision = await response.json();
```

---

### 9. Get Revision Download URL
الحصول على رابط تحميل ملف التعديل

**Endpoint:** `GET /api/research-revisions/:id/download-url`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "download_url": "https://res.cloudinary.com/dxcgmdbbs/raw/upload/fl_attachment:revision-1.pdf/..."
}
```

**Example (JavaScript):**
```javascript
const response = await fetch('/api/research-revisions/revision-uuid/download-url');
const { download_url } = await response.json();

// فتح رابط التحميل
window.open(download_url, '_blank');
```

---

## User Endpoints

### 5. Upload User Avatar
رفع صورة شخصية للمستخدم

**Endpoint:** `POST /api/users/:id/upload-avatar`

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

**Body:**
```
file: Image file (multipart/form-data)
```

**Response:**
```json
{
  "id": "uuid",
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "avatar_url": "https://res.cloudinary.com/dxcgmdbbs/image/upload/...",
  "avatar_cloudinary_public_id": "users/avatars/avatar_user-uuid",
  "avatar_cloudinary_secure_url": "https://res.cloudinary.com/..."
}
```

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('/api/users/user-uuid/upload-avatar', {
  method: 'POST',
  body: formData,
});

const user = await response.json();
console.log('Avatar URL:', user.avatar_cloudinary_secure_url);
```

---

### 6. Delete User Avatar
حذف الصورة الشخصية للمستخدم

**Endpoint:** `DELETE /api/users/:id/avatar`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "avatar_url": null,
  "avatar_cloudinary_public_id": null,
  "avatar_cloudinary_secure_url": null
}
```

**Example (JavaScript):**
```javascript
const response = await fetch('/api/users/user-uuid/avatar', {
  method: 'DELETE',
});

const user = await response.json();
```

---

### 7. Get Optimized Avatar URL
الحصول على رابط محسن للصورة الشخصية

**Endpoint:** `GET /api/users/:id/avatar-url?width=400&height=400`

**Query Parameters:**
- `width` (optional): عرض الصورة
- `height` (optional): ارتفاع الصورة

**Response:**
```json
{
  "avatar_url": "https://res.cloudinary.com/dxcgmdbbs/image/upload/w_400,h_400,c_limit,q_auto,f_auto/users/avatars/avatar_user-uuid.jpg"
}
```

**Example (JavaScript):**
```javascript
// صورة بحجم 400x400
const response = await fetch('/api/users/user-uuid/avatar-url?width=400&height=400');
const { avatar_url } = await response.json();

// عرض الصورة
document.getElementById('avatar').src = avatar_url;
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Failed to upload file: Invalid file format",
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "البحث غير موجود",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## File Types Support

### Research PDF
- ✅ PDF files only
- Max size: 100 MB (free plan)

### Supplementary Files
- ✅ PDF
- ✅ Microsoft Office (Word, Excel, PowerPoint)
- ✅ ZIP, RAR
- ✅ Images (JPG, PNG, GIF)
- ✅ Text files
- Max size: 100 MB (free plan)

### User Avatar
- ✅ JPG, JPEG
- ✅ PNG
- ✅ GIF
- ✅ WebP
- Max size: 10 MB
- Automatically resized to 400x400

---

## Frontend Integration Examples

### React Component - Upload PDF

```jsx
import { useState } from 'react';

function UploadPDF({ researchId }) {
  const [uploading, setUploading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/research/${researchId}/upload-pdf`, {
        method: 'POST',
        body: formData,
      });

      const research = await response.json();
      setPdfUrl(research.cloudinary_secure_url);
      alert('تم رفع الملف بنجاح!');
    } catch (error) {
      alert('فشل رفع الملف');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept=".pdf" 
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>جاري الرفع...</p>}
      {pdfUrl && <a href={pdfUrl} target="_blank">عرض الملف</a>}
    </div>
  );
}
```

### React Component - Upload Avatar

```jsx
import { useState } from 'react';

function UploadAvatar({ userId }) {
  const [avatarUrl, setAvatarUrl] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/users/${userId}/upload-avatar`, {
        method: 'POST',
        body: formData,
      });

      const user = await response.json();
      setAvatarUrl(user.avatar_cloudinary_secure_url);
    } catch (error) {
      alert('فشل رفع الصورة');
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleUpload}
      />
      {avatarUrl && (
        <img 
          src={avatarUrl} 
          alt="Avatar" 
          style={{ width: 200, height: 200, borderRadius: '50%' }}
        />
      )}
    </div>
  );
}
```

---

## Testing with cURL

### Upload PDF
```bash
curl -X POST http://localhost:3000/api/research/123/upload-pdf \
  -H "Authorization: Bearer your-token" \
  -F "file=@/path/to/research.pdf"
```

### Upload Avatar
```bash
curl -X POST http://localhost:3000/api/users/user-uuid/upload-avatar \
  -F "file=@/path/to/avatar.jpg"
```

### Get Download URL
```bash
curl http://localhost:3000/api/research/files/file-uuid/download-url
```

---

## Notes

1. **Authentication**: معظم endpoints تحتاج إلى token للمصادقة
2. **File Size**: تحقق من حجم الملف قبل الرفع
3. **File Type**: تحقق من نوع الملف المدعوم
4. **Error Handling**: تعامل مع الأخطاء بشكل صحيح في Frontend
5. **Progress**: يمكن إضافة progress bar لرفع الملفات الكبيرة

# دليل ربط الصفحات مع الباك اند

## ✅ الصفحات الجاهزة

جميع صفحات الباحث جاهزة للربط مع الباك اند. تحتاج فقط إلى استبدال البيانات التجريبية بـ API calls.

---

## 📝 أمثلة التكامل

### 1. ResearcherDashboard.tsx

**قبل:**
```typescript
const stats = [
  { title: 'الأبحاث المرسلة', value: 10, ... },
  // ... بيانات ثابتة
];
```

**بعد:**
```typescript
import { useState, useEffect } from 'react';
import { getResearcherStats, getMyResearches } from '../../services/researchService';

const [stats, setStats] = useState(null);
const [researches, setResearches] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      const statsData = await getResearcherStats();
      const researchesData = await getMyResearches();
      
      setStats([
        { title: 'الأبحاث المرسلة', value: statsData.totalSubmitted, ... },
        { title: 'تحت المراجعة', value: statsData.underReview, ... },
        { title: 'الأبحاث المقبولة', value: statsData.accepted, ... },
        { title: 'الأبحاث المرفوضة', value: statsData.rejected, ... },
      ]);
      
      setResearches(researchesData.slice(0, 3)); // آخر 3 أبحاث
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);
```

---

### 2. SubmitResearchPage.tsx

**قبل:**
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  console.log('Submitting research:', formData);
  alert('تم إرسال البحث بنجاح!');
};
```

**بعد:**
```typescript
import { submitResearch } from '../../services/researchService';

const [loading, setLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validation
  if (!formData.title.trim()) {
    alert('يرجى إدخال عنوان البحث');
    return;
  }
  // ... باقي الـ validation
  
  setLoading(true);
  try {
    await submitResearch({
      title: formData.title,
      specialization: formData.specialization,
      abstract: formData.abstract,
      keywords: formData.keywords,
      file: formData.file!,
    });
    
    alert('تم إرسال البحث بنجاح! سيتم مراجعته قريباً.');
    navigate('/dashboard/my-research');
  } catch (error: any) {
    alert(error.response?.data?.message || 'حدث خطأ أثناء إرسال البحث');
  } finally {
    setLoading(false);
  }
};
```

---

### 3. MyResearchPage.tsx

**قبل:**
```typescript
const researches: Research[] = [
  { id: '1', title: '...', ... },
  // ... بيانات ثابتة
];
```

**بعد:**
```typescript
import { getMyResearches } from '../../services/researchService';

const [researches, setResearches] = useState<Research[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchResearches();
}, [filter]);

const fetchResearches = async () => {
  setLoading(true);
  try {
    const data = await getMyResearches(filter === 'all' ? undefined : filter);
    setResearches(data);
  } catch (error) {
    console.error('Error fetching researches:', error);
  } finally {
    setLoading(false);
  }
};
```

---

### 4. ViewResearchPage.tsx

**قبل:**
```typescript
const researchData = {
  id: id || '1',
  title: '...',
  // ... بيانات ثابتة
};
```

**بعد:**
```typescript
import { getResearchById, downloadResearchFile } from '../../services/researchService';

const [research, setResearch] = useState<Research | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchResearch = async () => {
    if (!id) return;
    
    try {
      const data = await getResearchById(id);
      setResearch(data);
    } catch (error) {
      console.error('Error fetching research:', error);
      alert('حدث خطأ أثناء تحميل البحث');
    } finally {
      setLoading(false);
    }
  };
  
  fetchResearch();
}, [id]);

const handleDownload = async () => {
  if (!research) return;
  
  try {
    const blob = await downloadResearchFile(research.id);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = research.fileName || 'research.pdf';
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    alert('حدث خطأ أثناء تحميل الملف');
  }
};
```

---

### 5. ReviseResearchPage.tsx

**قبل:**
```typescript
const researchData = {
  title: '...',
  reviewerComment: '...',
  // ... بيانات ثابتة
};
```

**بعد:**
```typescript
import { getResearchById, getReviewComments, submitRevisedResearch } from '../../services/researchService';

const [research, setResearch] = useState<Research | null>(null);
const [comments, setComments] = useState<ReviewComment[]>([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchData = async () => {
    if (!id) return;
    
    try {
      const [researchData, commentsData] = await Promise.all([
        getResearchById(id),
        getReviewComments(id),
      ]);
      
      setResearch(researchData);
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  fetchData();
}, [id]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.notes.trim() || !formData.file) {
    alert('يرجى ملء جميع الحقول');
    return;
  }
  
  setLoading(true);
  try {
    await submitRevisedResearch(id!, {
      notes: formData.notes,
      file: formData.file,
    });
    
    alert('تم إرسال النسخة المعدلة بنجاح!');
    navigate('/dashboard/my-research');
  } catch (error: any) {
    alert(error.response?.data?.message || 'حدث خطأ أثناء إرسال التعديلات');
  } finally {
    setLoading(false);
  }
};
```

---

## 🔐 المصادقة (Authentication)

تم إضافة interceptor في `api.ts` يضيف الـ token تلقائياً لكل request:

```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 🎨 Loading States

يُنصح بإضافة loading states لتحسين UX:

```typescript
{loading ? (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D3B66]"></div>
  </div>
) : (
  // المحتوى الفعلي
)}
```

---

## ⚠️ Error Handling

تأكد من معالجة الأخطاء بشكل صحيح:

```typescript
try {
  // API call
} catch (error: any) {
  if (error.response) {
    // Server responded with error
    alert(error.response.data.message);
  } else if (error.request) {
    // No response from server
    alert('لا يمكن الاتصال بالخادم');
  } else {
    // Other errors
    alert('حدث خطأ غير متوقع');
  }
}
```

---

## 📋 Endpoints المطلوبة من الباك اند

### Researcher Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/researcher/stats` | إحصائيات الباحث |
| GET | `/api/researcher/researches` | جميع أبحاث الباحث |
| GET | `/api/researches/:id` | تفاصيل بحث معين |
| POST | `/api/researches` | تقديم بحث جديد |
| POST | `/api/researches/:id/revise` | تعديل بحث |
| GET | `/api/researches/:id/reviews` | ملاحظات المحكمين |
| GET | `/api/researches/:id/download` | تحميل ملف البحث |

### Response Examples

**GET /api/researcher/stats**
```json
{
  "totalSubmitted": 10,
  "underReview": 2,
  "accepted": 7,
  "rejected": 1
}
```

**GET /api/researcher/researches**
```json
[
  {
    "id": "1",
    "title": "عنوان البحث",
    "status": "under-review",
    "submissionDate": "2024-01-15",
    "lastUpdate": "2024-01-20",
    "specialization": "التعليم",
    "abstract": "ملخص البحث...",
    "keywords": ["كلمة1", "كلمة2"],
    "fileName": "research.pdf",
    "fileUrl": "/uploads/research.pdf"
  }
]
```

---

## ✅ Checklist للتكامل

- [ ] إنشاء `.env` file وإضافة `REACT_APP_API_URL`
- [ ] تحديث `api.ts` بـ base URL الصحيح
- [ ] استبدال البيانات التجريبية بـ API calls
- [ ] إضافة loading states
- [ ] إضافة error handling
- [ ] اختبار جميع الصفحات
- [ ] التأكد من المصادقة تعمل بشكل صحيح

---

## 🚀 الخطوات التالية

1. أنشئ ملف `.env` في root المشروع:
```
REACT_APP_API_URL=http://localhost:3000/api
```

2. استبدل البيانات التجريبية في كل صفحة بـ API calls

3. اختبر التكامل مع الباك اند

4. أضف معالجة للأخطاء وloading states

---

**جميع الصفحات جاهزة ومنظمة! فقط تحتاج إلى ربطها بالـ endpoints** 🎉

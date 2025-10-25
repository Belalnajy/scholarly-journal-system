# 📄 Static Content & Configuration Tables

## 🎯 نظرة عامة

هذه الجداول تدير المحتوى الثابت والإعدادات العامة للموقع، مما يسمح بتعديلها من لوحة التحكم دون الحاجة لتعديل الكود.

---

## 📋 الجداول (5 جداول)

### **1. site_settings** - إعدادات الموقع
### **2. publication_fields** - مجالات النشر
### **3. newsletter_subscriptions** - الاشتراكات البريدية
### **4. contact_submissions** - رسائل التواصل
### **5. static_pages** - الصفحات الثابتة

---

## 🌐 1. Site Settings

### **الغرض:**
تخزين إعدادات الموقع العامة (اسم المجلة، الرسالة، الرؤية، معلومات الاتصال)

### **الاستخدام في الصفحات:**
- ✅ AboutPage - الرسالة، الرؤية، الأهداف
- ✅ ContactPage - معلومات الاتصال
- ✅ Footer - روابط السوشيال ميديا
- ✅ Header - اسم المجلة، اللوجو

### **Schema:**
```sql
CREATE TABLE site_settings (
    id UUID PRIMARY KEY,
    
    -- Basic Info
    site_name VARCHAR(255) DEFAULT 'مجلة الدراسات والبحوث',
    site_name_en VARCHAR(255),
    logo_url TEXT,
    favicon_url TEXT,
    
    -- About Content
    about_intro TEXT, -- مقدمة عن المجلة
    mission TEXT,     -- الرسالة
    vision TEXT,      -- الرؤية
    goals JSON,       -- الأهداف ["هدف 1", "هدف 2", ...]
    
    -- Contact Info
    contact_info JSON, -- {"email": "...", "phone": [...], "address": "..."}
    social_links JSON, -- {"facebook": "...", "twitter": "...", ...}
    
    -- Maintenance
    is_maintenance_mode BOOLEAN DEFAULT FALSE,
    maintenance_message TEXT,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Example Data:**
```json
{
  "site_name": "مجلة الدراسات والبحوث",
  "site_name_en": "Journal of Studies and Research",
  "mission": "تقديم منصة علمية رائدة...",
  "vision": "أن نكون المرجع الأول...",
  "goals": [
    "نشر الأبحاث العلمية المحكمة",
    "دعم الباحثين والأكاديميين",
    "تعزيز التعاون البحثي"
  ],
  "contact_info": {
    "email": "info@journal.com",
    "phone": ["+966 50 123 4567", "+966 50 765 4321"],
    "address": "الرياض، المملكة العربية السعودية",
    "working_hours": "الأحد - الخميس: 9:00 ص - 5:00 م"
  },
  "social_links": {
    "facebook": "https://facebook.com/journal",
    "twitter": "https://twitter.com/journal",
    "linkedin": "https://linkedin.com/company/journal"
  }
}
```

### **API Endpoints:**
```typescript
GET  /api/settings              // Get site settings
PUT  /api/settings              // Update settings (Admin only)
GET  /api/settings/public       // Public settings only
```

---

## 📚 2. Publication Fields

### **الغرض:**
تخزين مجالات النشر التي تقبلها المجلة

### **الاستخدام في الصفحات:**
- ✅ AboutPage - قسم "مجالات النشر"
- ✅ SubmitResearchPage - اختيار التخصص

### **Schema:**
```sql
CREATE TABLE publication_fields (
    id UUID PRIMARY KEY,
    
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    description_ar TEXT,
    description_en TEXT,
    
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Example Data:**
```sql
INSERT INTO publication_fields (name_ar, name_en, display_order) VALUES
('تكنولوجيا التعليم', 'Educational Technology', 1),
('المناهج وطرق التدريس', 'Curriculum and Teaching Methods', 2),
('علم النفس التربوي', 'Educational Psychology', 3),
('الإدارة التربوية', 'Educational Administration', 4),
('التربية الخاصة', 'Special Education', 5),
('أصول التربية', 'Foundations of Education', 6),
('القياس والتقويم', 'Measurement and Evaluation', 7),
('تقنيات التعليم', 'Educational Technologies', 8);
```

### **API Endpoints:**
```typescript
GET    /api/publication-fields           // Get all active fields
GET    /api/publication-fields/:id       // Get specific field
POST   /api/publication-fields           // Create new field (Admin)
PUT    /api/publication-fields/:id       // Update field (Admin)
DELETE /api/publication-fields/:id       // Delete field (Admin)
```

---

## 📧 3. Newsletter Subscriptions

### **الغرض:**
تخزين الاشتراكات في النشرة البريدية

### **الاستخدام في الصفحات:**
- ✅ NewsletterSection (في جميع الصفحات)
- ✅ Footer

### **Schema:**
```sql
CREATE TABLE newsletter_subscriptions (
    id UUID PRIMARY KEY,
    
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    
    status VARCHAR(50) DEFAULT 'active' 
        CHECK (status IN ('active', 'unsubscribed')),
    
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP
);
```

### **Features:**
- ✅ Email validation
- ✅ Duplicate prevention (UNIQUE constraint)
- ✅ Unsubscribe functionality
- ✅ Export to CSV for email campaigns

### **API Endpoints:**
```typescript
POST   /api/newsletter/subscribe        // Subscribe to newsletter
POST   /api/newsletter/unsubscribe      // Unsubscribe
GET    /api/newsletter/subscriptions    // Get all (Admin only)
GET    /api/newsletter/export           // Export CSV (Admin only)
```

### **Email Flow:**
```
1. User enters email → Validate
2. Check if already subscribed
3. Insert into database
4. Send confirmation email
5. Track open rates (optional)
```

---

## 📬 4. Contact Submissions

### **الغرض:**
تخزين رسائل نموذج التواصل

### **الاستخدام في الصفحات:**
- ✅ ContactPage - نموذج التواصل

### **Schema:**
```sql
CREATE TABLE contact_submissions (
    id UUID PRIMARY KEY,
    
    -- Submitter (optional if logged in)
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    
    -- Message
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'read', 'responded', 'archived')),
    admin_notes TEXT,
    
    -- Timestamps
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    responded_at TIMESTAMP
);
```

### **Status Flow:**
```
pending → read → responded → archived
```

### **API Endpoints:**
```typescript
POST   /api/contact/submit              // Submit contact form
GET    /api/contact/submissions         // Get all (Admin only)
GET    /api/contact/submissions/:id     // Get specific submission
PUT    /api/contact/submissions/:id     // Update status/notes
DELETE /api/contact/submissions/:id     // Delete submission
```

### **Admin Dashboard Features:**
- ✅ View all submissions
- ✅ Filter by status
- ✅ Mark as read/responded
- ✅ Add admin notes
- ✅ Reply via email
- ✅ Archive old messages

---

## 📄 5. Static Pages

### **الغرض:**
تخزين محتوى الصفحات الثابتة (سياسة الخصوصية، الشروط والأحكام)

### **الاستخدام في الصفحات:**
- ✅ PrivacyPolicyPage
- ✅ TermsAndConditionsPage
- ✅ FAQPage (مستقبلاً)

### **Schema:**
```sql
CREATE TABLE static_pages (
    id UUID PRIMARY KEY,
    
    page_key VARCHAR(100) UNIQUE NOT NULL, -- 'privacy-policy', 'terms'
    
    title_ar VARCHAR(500) NOT NULL,
    title_en VARCHAR(500),
    content_ar TEXT NOT NULL,
    content_en TEXT,
    
    meta_description_ar TEXT,
    meta_description_en TEXT,
    
    is_published BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Page Keys:**
```typescript
const PAGE_KEYS = {
  PRIVACY_POLICY: 'privacy-policy',
  TERMS_CONDITIONS: 'terms-conditions',
  FAQ: 'faq',
  ABOUT: 'about',
  SUBMISSION_GUIDELINES: 'submission-guidelines',
  REVIEW_POLICY: 'review-policy',
  ETHICS_POLICY: 'ethics-policy',
} as const;
```

### **Example Data:**
```sql
INSERT INTO static_pages (page_key, title_ar, content_ar) VALUES
('privacy-policy', 'سياسة الخصوصية', '...'),
('terms-conditions', 'الشروط والأحكام', '...'),
('submission-guidelines', 'إرشادات تقديم الأبحاث', '...');
```

### **API Endpoints:**
```typescript
GET    /api/pages/:key                  // Get page by key
GET    /api/pages                       // Get all pages
POST   /api/pages                       // Create page (Admin)
PUT    /api/pages/:key                  // Update page (Admin)
DELETE /api/pages/:key                  // Delete page (Admin)
```

### **Content Editor:**
- ✅ Rich Text Editor (TinyMCE/Quill)
- ✅ Markdown support
- ✅ Preview before publish
- ✅ Version history
- ✅ Bilingual support (AR/EN)

---

## 🎯 Integration with Frontend

### **1. AboutPage Integration:**
```typescript
// Fetch site settings
const { data: settings } = await api.get('/api/settings/public');

// Fetch publication fields
const { data: fields } = await api.get('/api/publication-fields');

// Display
<AboutPage 
  mission={settings.mission}
  vision={settings.vision}
  goals={settings.goals}
  fields={fields}
/>
```

### **2. ContactPage Integration:**
```typescript
// Submit contact form
const handleSubmit = async (formData) => {
  await api.post('/api/contact/submit', {
    name: formData.name,
    email: formData.email,
    subject: formData.subject,
    message: formData.message
  });
  
  toast.success('تم إرسال رسالتك بنجاح');
};

// Display contact info
const { data: settings } = await api.get('/api/settings/public');
<ContactInfo data={settings.contact_info} />
```

### **3. Newsletter Integration:**
```typescript
const handleSubscribe = async (email: string) => {
  try {
    await api.post('/api/newsletter/subscribe', { email });
    toast.success('تم الاشتراك بنجاح');
  } catch (error) {
    if (error.code === 'ALREADY_SUBSCRIBED') {
      toast.error('هذا البريد مشترك بالفعل');
    }
  }
};
```

### **4. Static Pages Integration:**
```typescript
// Privacy Policy Page
const { data: page } = await api.get('/api/pages/privacy-policy');

<PrivacyPolicyPage 
  title={page.title_ar}
  content={page.content_ar}
  lastUpdate={page.updated_at}
/>
```

---

## 🔐 Admin Dashboard Features

### **Site Settings Management:**
```typescript
// Admin can edit:
- ✅ Site name & logo
- ✅ Mission & vision
- ✅ Goals (add/remove/reorder)
- ✅ Contact information
- ✅ Social media links
- ✅ Maintenance mode
```

### **Publication Fields Management:**
```typescript
// Admin can:
- ✅ Add new fields
- ✅ Edit existing fields
- ✅ Reorder fields (drag & drop)
- ✅ Activate/deactivate fields
- ✅ Delete unused fields
```

### **Newsletter Management:**
```typescript
// Admin can:
- ✅ View all subscribers
- ✅ Export to CSV
- ✅ Send bulk emails
- ✅ View statistics (open rate, click rate)
- ✅ Manually add/remove subscribers
```

### **Contact Submissions Management:**
```typescript
// Admin can:
- ✅ View all messages
- ✅ Filter by status
- ✅ Reply to messages
- ✅ Mark as read/responded
- ✅ Add internal notes
- ✅ Archive old messages
```

### **Static Pages Management:**
```typescript
// Admin can:
- ✅ Edit page content (WYSIWYG editor)
- ✅ Preview changes
- ✅ Publish/unpublish pages
- ✅ View version history
- ✅ Restore previous versions
```

---

## 📊 Statistics & Analytics

### **Newsletter Stats:**
```sql
SELECT 
    COUNT(*) as total_subscribers,
    COUNT(*) FILTER (WHERE status = 'active') as active,
    COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed,
    COUNT(*) FILTER (WHERE subscribed_at > NOW() - INTERVAL '30 days') as new_this_month
FROM newsletter_subscriptions;
```

### **Contact Submissions Stats:**
```sql
SELECT 
    COUNT(*) as total_submissions,
    COUNT(*) FILTER (WHERE status = 'pending') as pending,
    COUNT(*) FILTER (WHERE status = 'responded') as responded,
    AVG(EXTRACT(EPOCH FROM (responded_at - submitted_at))/3600) as avg_response_time_hours
FROM contact_submissions;
```

---

## 🚀 Migration Strategy

### **Phase 1: Create Tables**
```bash
npm run migration:create -- static-content-tables
```

### **Phase 2: Seed Initial Data**
```sql
-- Insert default site settings
INSERT INTO site_settings (id, site_name, mission, vision) VALUES
(gen_random_uuid(), 'مجلة الدراسات والبحوث', '...', '...');

-- Insert publication fields
INSERT INTO publication_fields (name_ar, display_order) VALUES
('تكنولوجيا التعليم', 1),
('المناهج وطرق التدريس', 2);

-- Insert static pages
INSERT INTO static_pages (page_key, title_ar, content_ar) VALUES
('privacy-policy', 'سياسة الخصوصية', '...'),
('terms-conditions', 'الشروط والأحكام', '...');
```

### **Phase 3: Update Frontend**
```typescript
// Replace hardcoded data with API calls
- aboutData.ts → API call
- contactData.ts → API call
- privacyData.ts → API call
- termsData.ts → API call
```

---

## ✅ Checklist

### **Backend:**
- [ ] Create migration files
- [ ] Create models/entities
- [ ] Create API endpoints
- [ ] Add validation
- [ ] Add authentication/authorization
- [ ] Write tests

### **Frontend:**
- [ ] Update pages to use API
- [ ] Create admin management pages
- [ ] Add loading states
- [ ] Add error handling
- [ ] Update forms

### **Testing:**
- [ ] Test all CRUD operations
- [ ] Test email functionality
- [ ] Test file uploads (logo/favicon)
- [ ] Test rich text editor
- [ ] Test permissions

---

**📅 آخر تحديث:** 2025-10-21  
**📝 الإصدار:** 1.0.0  
**✍️ المطور:** Belal

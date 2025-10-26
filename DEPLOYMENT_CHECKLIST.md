# ✅ Deployment Checklist - UPAFA Journal

## قبل النشر على السيرفر

### 📝 الملفات التي تم إنشاؤها

| الملف | الوصف | الحالة |
|------|-------|--------|
| `apps/backend/.env.production` | إعدادات Backend للـ Production | ⚠️ يحتاج تعديل |
| `apps/frontend/.env.production` | إعدادات Frontend للـ Production | ✅ جاهز |
| `ecosystem.config.js` | إعدادات PM2 | ✅ جاهز |
| `nginx-frontend.conf` | إعدادات Nginx للـ Frontend | ✅ جاهز |
| `nginx-backend.conf` | إعدادات Nginx للـ Backend | ✅ جاهز |
| `backup-db.sh` | سكريبت النسخ الاحتياطي | ⚠️ يحتاج تعديل |
| `DEPLOYMENT_GUIDE.md` | دليل النشر الكامل | ✅ جاهز |
| `DEPLOYMENT_QUICK_START.md` | دليل النشر السريع | ✅ جاهز |

---

## ⚠️ التعديلات المطلوبة قبل النشر

### 1. Backend Environment (`.env.production`)

**الموقع:** `apps/backend/.env.production`

**يجب تغيير:**

```env
# ❌ غيّر هذا - كلمة مرور قوية للـ database
DATABASE_PASSWORD=CHANGE_THIS_STRONG_PASSWORD_123!@#

# ❌ غيّر هذا - JWT Secret قوي (32+ حرف)
JWT_SECRET=CHANGE_THIS_TO_VERY_STRONG_RANDOM_SECRET_KEY_MIN_32_CHARS
```

**لتوليد JWT Secret قوي:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**جاهز للاستخدام (لا تغيير):**
```env
✅ CLOUDINARY_URL=cloudinary://239981419569485:SAI_t-S1JekbLOOtOcuoVdUnXrI@dxcgmdbbs
✅ EMAIL_USER=journalresearchut@gmail.com
✅ EMAIL_PASSWORD=vxgd udzy okjp rrjb
✅ FRONTEND_URL=https://upafa-edu.net
✅ API_URL=https://api.upafa-edu.net
```

---

### 2. Database Backup Script (`backup-db.sh`)

**الموقع:** `backup-db.sh`

**يجب تغيير:**

```bash
# السطر 10
DB_PASSWORD="YOUR_DB_PASSWORD_HERE"  # ❌ غيّر هذا!
```

استخدم نفس الـ `DATABASE_PASSWORD` من `.env.production`

---

### 3. DNS Records في Hostinger

**يجب إضافة:**

```
Type    Name    Value               TTL
A       @       YOUR_VPS_IP         3600
A       www     YOUR_VPS_IP         3600
A       api     YOUR_VPS_IP         3600
```

**للحصول على IP السيرفر:**
```bash
curl ifconfig.me
```

---

## 🔐 معلومات حساسة - لا ترفعها على Git

### ملفات يجب عدم رفعها:
- ❌ `apps/backend/.env` (الفعلي على السيرفر)
- ❌ `apps/frontend/.env` (الفعلي على السيرفر)
- ❌ أي ملف يحتوي على passwords حقيقية

### ملفات مسموح برفعها (Templates):
- ✅ `apps/backend/.env.production` (كـ template)
- ✅ `apps/frontend/.env.production` (كـ template)

**ملاحظة:** ملفات `.env.production` هي templates فقط. يجب تغيير القيم الحساسة على السيرفر.

---

## 📋 خطوات النشر (مختصرة)

### المرحلة 1: إعداد السيرفر (مرة واحدة)
```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install dependencies
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs postgresql postgresql-contrib nginx git
sudo npm install -g pm2
```

### المرحلة 2: إعداد Database
```bash
sudo -u postgres psql
# CREATE DATABASE journal_db;
# CREATE USER journal_user WITH ENCRYPTED PASSWORD 'YOUR_PASSWORD';
# GRANT ALL PRIVILEGES ON DATABASE journal_db TO journal_user;
```

### المرحلة 3: رفع المشروع
```bash
sudo mkdir -p /var/www/upafa-journal
sudo chown -R $USER:$USER /var/www/upafa-journal
cd /var/www/upafa-journal
git clone https://github.com/Belalnajy/scholarly-journal-system.git .
npm install
cd apps/backend && npm install
cd ../frontend && npm install
```

### المرحلة 4: تكوين Environment
```bash
# Backend
cd /var/www/upafa-journal/apps/backend
cp .env.production .env
nano .env  # غيّر DATABASE_PASSWORD و JWT_SECRET

# Frontend
cd ../frontend
cp .env.production .env
```

### المرحلة 5: Build
```bash
cd /var/www/upafa-journal/apps/backend
npm run build
npm run migration:run

cd ../frontend
npm run build
```

### المرحلة 6: PM2
```bash
mkdir -p /var/www/upafa-journal/logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### المرحلة 7: Nginx
```bash
sudo cp nginx-frontend.conf /etc/nginx/sites-available/upafa-frontend
sudo cp nginx-backend.conf /etc/nginx/sites-available/upafa-backend
sudo ln -s /etc/nginx/sites-available/upafa-frontend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/upafa-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### المرحلة 8: SSL
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d upafa-edu.net -d www.upafa-edu.net
sudo certbot --nginx -d api.upafa-edu.net
```

---

## ✅ Checklist النهائي

### قبل النشر:
- [ ] تغيير `DATABASE_PASSWORD` في `.env.production`
- [ ] تغيير `JWT_SECRET` في `.env.production`
- [ ] تغيير `DB_PASSWORD` في `backup-db.sh`
- [ ] إعداد DNS Records في Hostinger
- [ ] التأكد من IP السيرفر صحيح

### أثناء النشر:
- [ ] تثبيت Node.js, PostgreSQL, Nginx, PM2
- [ ] إنشاء Database و User
- [ ] استنساخ المشروع
- [ ] تثبيت Dependencies
- [ ] نسخ `.env.production` إلى `.env` وتعديله
- [ ] Build Backend و Frontend
- [ ] تشغيل PM2
- [ ] إعداد Nginx
- [ ] الحصول على SSL

### بعد النشر:
- [ ] اختبار Frontend: https://upafa-edu.net
- [ ] اختبار Backend: https://api.upafa-edu.net/api/health
- [ ] فحص PM2 logs: `pm2 logs upafa-backend`
- [ ] فحص Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- [ ] اختبار تسجيل الدخول
- [ ] اختبار رفع ملف PDF
- [ ] إعداد Backup Script
- [ ] اختبار Backup: `./backup-db.sh`

---

## 🔄 التحديثات المستقبلية

```bash
cd /var/www/upafa-journal
git pull origin main

# Backend
cd apps/backend
npm install
npm run build
pm2 restart upafa-backend

# Frontend
cd ../frontend
npm install
npm run build
```

---

## 📞 في حالة المشاكل

### Backend لا يعمل:
```bash
pm2 logs upafa-backend --lines 100
pm2 restart upafa-backend
```

### Frontend لا يظهر:
```bash
sudo nginx -t
sudo systemctl reload nginx
ls -la /var/www/upafa-journal/apps/frontend/dist/
```

### Database Connection Error:
```bash
PGPASSWORD='YOUR_PASSWORD' psql -h localhost -U journal_user -d journal_db
sudo systemctl status postgresql
```

### SSL Issues:
```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

---

## 📚 المراجع

- **الدليل الكامل:** `DEPLOYMENT_GUIDE.md`
- **البدء السريع:** `DEPLOYMENT_QUICK_START.md`
- **Backend Docs:** `docs/backend/`
- **Frontend Docs:** `docs/frontend/`

---

## 🎯 الخلاصة

### ما تم إنجازه:
✅ إنشاء ملفات `.env.production` للـ Backend و Frontend  
✅ إنشاء `ecosystem.config.js` لـ PM2  
✅ إنشاء Nginx configurations  
✅ إنشاء Database backup script  
✅ إنشاء دليل نشر شامل  
✅ تحديث `.gitignore`  

### ما يجب فعله على السيرفر:
⚠️ تغيير `DATABASE_PASSWORD`  
⚠️ تغيير `JWT_SECRET`  
⚠️ إعداد DNS Records  
⚠️ اتباع خطوات النشر  

**جاهز للنشر! 🚀**

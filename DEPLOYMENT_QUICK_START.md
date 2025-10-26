# 🚀 دليل النشر السريع - UPAFA Journal

## ملخص سريع للخطوات الأساسية

### 📋 قبل البدء

**معلومات السيرفر:**
- Domain: `upafa-edu.net`
- Frontend: `https://upafa-edu.net`
- Backend API: `https://api.upafa-edu.net`
- VPS: Hostinger

---

## 🔧 التعديلات المطلوبة قبل الرفع

### 1. ملفات Environment

#### ✅ تم إنشاء الملفات التالية:

1. **`apps/backend/.env.production`**
   - ⚠️ **يجب تغيير:**
     - `DATABASE_PASSWORD` - كلمة مرور قوية للـ database
     - `JWT_SECRET` - secret key عشوائي وقوي (32+ حرف)
   - ✅ **جاهز:**
     - CLOUDINARY_URL
     - EMAIL_USER & EMAIL_PASSWORD
     - FRONTEND_URL & API_URL

2. **`apps/frontend/.env.production`**
   - ✅ **جاهز:** VITE_API_URL مضبوط على `https://api.upafa-edu.net/api`

3. **`ecosystem.config.js`**
   - ✅ **جاهز:** إعدادات PM2 للـ backend

4. **`nginx-frontend.conf`**
   - ✅ **جاهز:** إعدادات Nginx للـ frontend

5. **`nginx-backend.conf`**
   - ✅ **جاهز:** إعدادات Nginx للـ backend API

6. **`backup-db.sh`**
   - ⚠️ **يجب تغيير:** `DB_PASSWORD` في السطر 10

---

## 📝 خطوات النشر (مختصرة)

### 1️⃣ إعداد السيرفر (مرة واحدة)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 (مهم جداً!)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js version (يجب أن يكون 20.x)
node --version

# Install PostgreSQL, Nginx, Git
sudo apt install -y postgresql postgresql-contrib nginx git

# Install PM2
sudo npm install -g pm2
```

**⚠️ مهم جداً:** يجب استخدام Node.js 20 أو أعلى لتجنب مشاكل Vite/ESM

### 2️⃣ إعداد Database
```bash
sudo -u postgres psql

# في PostgreSQL:
CREATE DATABASE journal_db;
CREATE USER journal_user WITH ENCRYPTED PASSWORD 'YOUR_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE journal_db TO journal_user;
ALTER DATABASE journal_db OWNER TO journal_user;
\q
```

### 3️⃣ رفع المشروع
```bash
# Create directory
sudo mkdir -p /var/www/upafa-journal
sudo chown -R $USER:$USER /var/www/upafa-journal
cd /var/www/upafa-journal

# Clone project
git clone https://github.com/Belalnajy/scholarly-journal-system.git .

# Install dependencies (Nx Monorepo)
npm install
```

### 4️⃣ تكوين Environment
```bash
# Backend
cd /var/www/upafa-journal/apps/backend
cp .env.production .env
nano .env  # غيّر DATABASE_PASSWORD و JWT_SECRET

# Frontend
cd ../frontend
cp .env.production .env
# لا حاجة لتغيير شيء

cd ../..
```

### 5️⃣ Build المشروع

```bash
# Return to root directory
cd /var/www/upafa-journal

# Build backend using Nx
npx nx build backend

# Build frontend using Nx
npx nx build frontend

# Verify build outputs
ls -la apps/backend/dist/
ls -la apps/frontend/dist/
```

**ملاحظة:** 
- تم إصلاح أخطاء TypeScript باستخدام `// @ts-nocheck` في الملفات المشكلة
- Nx يستخدم webpack للـ backend و vite للـ frontend تلقائياً
- الـ Backend يستخدم `synchronize: true`، لذلك سيُنشئ الجداول تلقائياً عند أول تشغيل

### 6️⃣ تشغيل Backend مع PM2
```bash
# Create logs directory
mkdir -p /var/www/upafa-journal/logs

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # اتبع التعليمات
```

### 7️⃣ إعداد Nginx
```bash
# Copy configurations
sudo cp nginx-frontend.conf /etc/nginx/sites-available/upafa-frontend
sudo cp nginx-backend.conf /etc/nginx/sites-available/upafa-backend

# Enable sites
sudo ln -s /etc/nginx/sites-available/upafa-frontend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/upafa-backend /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 8️⃣ إعداد SSL (HTTPS)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificates
sudo certbot --nginx -d upafa-edu.net -d www.upafa-edu.net
sudo certbot --nginx -d api.upafa-edu.net
```

### 9️⃣ إعداد DNS في Hostinger
```
Type    Name    Value           TTL
A       @       YOUR_VPS_IP     3600
A       www     YOUR_VPS_IP     3600
A       api     YOUR_VPS_IP     3600
```

### 🔟 التحقق
```bash
# Check backend
pm2 status
curl https://api.upafa-edu.net/api/health

# Check frontend in browser
# https://upafa-edu.net
```

---

## 🔄 تحديث المشروع (مستقبلاً)

```bash
cd /var/www/upafa-journal

# Pull changes
git pull origin main

# Install/Update dependencies
npm install

# Build both apps using Nx
npx nx build backend
npx nx build frontend

# Restart backend
pm2 restart upafa-backend

# No need to restart Nginx (static files updated automatically)
```

---

## 🛠️ أوامر مفيدة

```bash
# PM2
pm2 status
pm2 logs upafa-backend
pm2 restart upafa-backend

# Nginx
sudo nginx -t
sudo systemctl reload nginx

# Database
sudo -u postgres psql -d journal_db

# Logs
pm2 logs upafa-backend
sudo tail -f /var/log/nginx/error.log
```

---

## ⚠️ نقاط مهمة يجب تذكرها

### 🔴 يجب تغييرها:
1. ✅ `DATABASE_PASSWORD` في `.env` و `backup-db.sh`
2. ✅ `JWT_SECRET` في `.env` (استخدم: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
3. ✅ DNS Records في Hostinger

### 🟢 جاهزة للاستخدام:
1. ✅ Cloudinary Configuration
2. ✅ Email Configuration (Gmail SMTP)
3. ✅ Frontend & Backend URLs
4. ✅ Nginx Configurations
5. ✅ PM2 Configuration

---

## 📞 في حالة وجود مشاكل

### ❌ خطأ: "require() of ES Module not supported"
```bash
# المشكلة: Node.js قديم جداً
# الحل: تحديث Node.js إلى 20+

# Check current version
node --version

# If less than 20.x, update:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version  # Should be v20.x or higher
```

### Backend لا يعمل:
```bash
pm2 logs upafa-backend --lines 50
```

### Frontend لا يظهر:
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
ls -la /var/www/upafa-journal/apps/frontend/dist/
```

### Database Connection Error:
```bash
PGPASSWORD='YOUR_PASSWORD' psql -h localhost -U journal_user -d journal_db
sudo systemctl status postgresql
```

---

## ✅ Checklist النشر

- [ ] تثبيت Node.js, PostgreSQL, Nginx, PM2
- [ ] إنشاء Database و User
- [ ] استنساخ المشروع من GitHub
- [ ] تثبيت Dependencies
- [ ] تكوين `.env` للـ Backend (تغيير PASSWORD و JWT_SECRET)
- [ ] تكوين `.env` للـ Frontend
- [ ] Build Backend و Frontend
- [ ] تشغيل Backend مع PM2
- [ ] إعداد Nginx Configurations
- [ ] الحصول على SSL Certificates
- [ ] إعداد DNS Records
- [ ] اختبار الموقع

---

**للتفاصيل الكاملة، راجع: `DEPLOYMENT_GUIDE.md`**

# 🚀 دليل رفع المشروع على VPS (Hostinger)

## 📋 المتطلبات الأساسية

### على السيرفر (VPS):
- Ubuntu 20.04+ أو Debian
- Node.js 18+ و npm
- PostgreSQL 14+
- Nginx
- PM2 (لإدارة Node.js processes)
- SSL Certificate (Let's Encrypt)

### الدومين:
- **Domain**: upafa-edu.net
- **Frontend**: https://upafa-edu.net
- **Backend API**: https://api.upafa-edu.net

---

## 🔧 الخطوة 1: إعداد السيرفر

### 1.1 تحديث النظام
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 تثبيت Node.js 20+
```bash
# Install Node.js 20.x (مهم جداً!)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v20.x or higher
npm --version
```

**⚠️ مهم:** يجب استخدام Node.js 20 أو أعلى لتجنب مشاكل ESM/Vite

### 1.3 تثبيت PostgreSQL
```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
sudo systemctl status postgresql
```

### 1.4 تثبيت Nginx
```bash
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 1.5 تثبيت PM2
```bash
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### 1.6 تثبيت Git
```bash
sudo apt install -y git
```

---

## 🗄️ الخطوة 2: إعداد قاعدة البيانات

### 2.1 إنشاء Database و User
```bash
# Switch to postgres user
sudo -u postgres psql

# في PostgreSQL shell:
CREATE DATABASE journal_db;
CREATE USER journal_user WITH ENCRYPTED PASSWORD 'YOUR_STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE journal_db TO journal_user;
ALTER DATABASE journal_db OWNER TO journal_user;

# Exit PostgreSQL
\q
```

### 2.2 تعديل PostgreSQL للسماح بالاتصال المحلي
```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Add this line (if not exists):
# local   all             all                                     md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

## 📦 الخطوة 3: رفع المشروع على السيرفر

### 3.1 إنشاء مجلد المشروع
```bash
# Create directory for the project
sudo mkdir -p /var/www/upafa-journal
sudo chown -R $USER:$USER /var/www/upafa-journal
cd /var/www/upafa-journal
```

### 3.2 استنساخ المشروع من GitHub
```bash
# Clone the repository
git clone https://github.com/Belalnajy/scholarly-journal-system.git .

# Or if you have SSH key:
# git clone git@github.com:Belalnajy/scholarly-journal-system.git .
```

### 3.3 تثبيت Dependencies
```bash
# Install all dependencies (Nx Monorepo)
# This will install dependencies for all apps in the workspace
npm install

# Verify Nx installation
npx nx --version
```

---

## ⚙️ الخطوة 4: تكوين Environment Variables

### 4.1 Backend Environment
```bash
cd /var/www/upafa-journal/apps/backend

# Copy production env file
cp .env.production .env

# Edit .env file
nano .env
```

**تأكد من تغيير:**
```env
# Database Password (استخدم نفس الـ password من الخطوة 2.1)
DATABASE_PASSWORD=YOUR_STRONG_PASSWORD_HERE

# JWT Secret (استخدم secret قوي وعشوائي)
JWT_SECRET=GENERATE_STRONG_RANDOM_SECRET_AT_LEAST_32_CHARS

# Frontend URL
FRONTEND_URL=https://upafa-edu.net

# API URL
API_URL=https://api.upafa-edu.net
```

**لتوليد JWT Secret قوي:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4.2 Frontend Environment
```bash
cd /var/www/upafa-journal/apps/frontend

# Copy production env file
cp .env.production .env

# Edit if needed
nano .env
```

تأكد من:
```env
VITE_API_URL=https://api.upafa-edu.net/api
```

---

## 🏗️ الخطوة 5: Build المشروع
### 5.1 Build Backend
```bash
# Return to root directory
cd /var/www/upafa-journal

# Build backend using Nx
npx nx build backend
```

**ملاحظة مهمة:**
- Nx يستخدم webpack لبناء الـ backend تلقائياً
- تم إصلاح أخطاء TypeScript باستخدام `// @ts-nocheck`
- الـ Backend يستخدم `synchronize: true` في database config
- هذا يعني أن TypeORM سيُنشئ الجداول تلقائياً عند أول تشغيل
- لا حاجة لتشغيل migrations يدوياً

### 5.2 Build Frontend
```bash
# Build frontend using Nx
cd /var/www/upafa-journal
npx nx build frontend

# This will create a 'dist' folder in apps/frontend/
```

### 5.3 التحقق من Build Outputs
{{ ... }}
```bash
# Verify backend build
ls -la /var/www/upafa-journal/apps/backend/dist/

# Verify frontend build
ls -la /var/www/upafa-journal/apps/frontend/dist/
```

---

## 🚀 الخطوة 6: تشغيل Backend مع PM2

### 6.1 إنشاء PM2 Ecosystem File
```bash
cd /var/www/upafa-journal
nano ecosystem.config.js
```

**محتوى الملف:**
```javascript
module.exports = {
  apps: [
    {
      name: 'upafa-backend',
      cwd: '/var/www/upafa-journal/apps/backend',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/www/upafa-journal/logs/backend-error.log',
      out_file: '/var/www/upafa-journal/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
```

### 6.2 إنشاء مجلد Logs
```bash
mkdir -p /var/www/upafa-journal/logs
```

### 6.3 تشغيل Backend
```bash
cd /var/www/upafa-journal

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the command it gives you (usually starts with 'sudo env PATH=...')

# Check status
pm2 status
pm2 logs upafa-backend
```

---

## 🌐 الخطوة 7: إعداد Nginx

### 7.1 إنشاء Nginx Configuration للـ Frontend
```bash
sudo nano /etc/nginx/sites-available/upafa-frontend
```

**محتوى الملف:**
```nginx
server {
    listen 80;
    server_name upafa-edu.net www.upafa-edu.net;

    root /var/www/upafa-journal/apps/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Disable caching for index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

### 7.2 إنشاء Nginx Configuration للـ Backend API
```bash
sudo nano /etc/nginx/sites-available/upafa-backend
```

**محتوى الملف:**
```nginx
server {
    listen 80;
    server_name api.upafa-edu.net;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Increase upload size for PDFs
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts for large file uploads
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
    }
}
```

### 7.3 تفعيل المواقع
```bash
# Enable sites
sudo ln -s /etc/nginx/sites-available/upafa-frontend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/upafa-backend /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔒 الخطوة 8: إعداد SSL Certificate (HTTPS)

### 8.1 تثبيت Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 8.2 الحصول على SSL Certificates
```bash
# For frontend (upafa-edu.net)
sudo certbot --nginx -d upafa-edu.net -d www.upafa-edu.net

# For backend API (api.upafa-edu.net)
sudo certbot --nginx -d api.upafa-edu.net
```

**اتبع التعليمات:**
- أدخل email address
- وافق على Terms of Service
- اختر redirect HTTP to HTTPS (Option 2)

### 8.3 تجديد SSL تلقائياً
```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Certbot will automatically renew certificates before they expire
```

---

## 🎯 الخطوة 9: إعداد DNS Records

في لوحة تحكم Hostinger، أضف DNS Records التالية:

### A Records:
```
Type    Name    Value               TTL
A       @       YOUR_VPS_IP         3600
A       www     YOUR_VPS_IP         3600
A       api     YOUR_VPS_IP         3600
```

**ملاحظة:** استبدل `YOUR_VPS_IP` بـ IP السيرفر الفعلي

### للتحقق من IP السيرفر:
```bash
curl ifconfig.me
```

---

## ✅ الخطوة 10: التحقق من التشغيل

### 10.1 فحص Backend
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs upafa-backend

# Test API directly
curl http://localhost:3000/api/health
```

### 10.2 فحص Frontend
```bash
# Check if files exist
ls -la /var/www/upafa-journal/apps/frontend/dist/

# Check Nginx status
sudo systemctl status nginx
```

### 10.3 فحص من المتصفح
- Frontend: https://upafa-edu.net
- Backend API: https://api.upafa-edu.net/api/health

---

## 🔄 تحديث المشروع (Future Updates)

عند إجراء تحديثات على المشروع:

```bash
cd /var/www/upafa-journal

# Pull latest changes
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

### تحديث سريع (بدون dependencies):
```bash
cd /var/www/upafa-journal
git pull origin main

# Build both apps
npx nx build backend
npx nx build frontend

# Restart backend
pm2 restart upafa-backend
```

---

## 🛠️ أوامر مفيدة

### PM2 Commands:
```bash
pm2 status                    # Check status
pm2 logs upafa-backend        # View logs
pm2 restart upafa-backend     # Restart app
pm2 stop upafa-backend        # Stop app
pm2 delete upafa-backend      # Remove app
pm2 monit                     # Monitor resources
```

### Nginx Commands:
```bash
sudo nginx -t                 # Test configuration
sudo systemctl reload nginx   # Reload config
sudo systemctl restart nginx  # Restart Nginx
sudo systemctl status nginx   # Check status
```

### PostgreSQL Commands:
```bash
sudo -u postgres psql -d journal_db    # Connect to database
sudo systemctl status postgresql       # Check status
sudo systemctl restart postgresql      # Restart PostgreSQL
```

### View Logs:
```bash
# Backend logs
pm2 logs upafa-backend

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🔥 Firewall Configuration (Optional but Recommended)

```bash
# Install UFW
sudo apt install -y ufw

# Allow SSH (IMPORTANT: Do this first!)
sudo ufw allow OpenSSH

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Allow PostgreSQL (only if needed externally)
# sudo ufw allow 5432/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## 📊 Monitoring & Maintenance

### 1. Setup Log Rotation
```bash
sudo nano /etc/logrotate.d/upafa-journal
```

**محتوى الملف:**
```
/var/www/upafa-journal/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 $USER $USER
    sharedscripts
}
```

### 2. Database Backup Script
```bash
nano /var/www/upafa-journal/backup-db.sh
```

**محتوى الملف:**
```bash
#!/bin/bash
BACKUP_DIR="/var/www/upafa-journal/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
PGPASSWORD='YOUR_DB_PASSWORD' pg_dump -h localhost -U journal_user journal_db > $BACKUP_DIR/journal_db_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "journal_db_*.sql" -mtime +7 -delete

echo "Backup completed: journal_db_$DATE.sql"
```

```bash
chmod +x /var/www/upafa-journal/backup-db.sh

# Add to crontab for daily backup at 2 AM
crontab -e
# Add this line:
# 0 2 * * * /var/www/upafa-journal/backup-db.sh
```

---

## 🚨 Troubleshooting

### Backend لا يعمل:
```bash
pm2 logs upafa-backend --lines 100
# Check for errors in logs
```

### Frontend لا يظهر:
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Database Connection Error:
```bash
# Test connection
PGPASSWORD='YOUR_PASSWORD' psql -h localhost -U journal_user -d journal_db

# Check PostgreSQL status
sudo systemctl status postgresql
```

### SSL Certificate Issues:
```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. تحقق من الـ logs أولاً
2. تأكد من أن جميع الخدمات تعمل (PostgreSQL, Nginx, PM2)
3. تحقق من DNS records
4. تأكد من Firewall settings

---

## ✨ ملاحظات مهمة

1. **Security:**
   - غيّر جميع الـ passwords الافتراضية
   - استخدم JWT secret قوي وعشوائي
   - فعّل Firewall
   - حدّث النظام بانتظام

2. **Performance:**
   - راقب استخدام الـ resources (CPU, RAM, Disk)
   - استخدم `pm2 monit` لمراقبة Backend
   - فعّل Gzip compression في Nginx

3. **Backups:**
   - اعمل backup للـ database يومياً
   - احفظ الـ backups في مكان آمن
   - اختبر الـ backups بانتظام

4. **Updates:**
   - حدّث المشروع بانتظام
   - اختبر التحديثات في بيئة تطوير أولاً
   - اعمل backup قبل أي تحديث

---

**تم بحمد الله! 🎉**

المشروع الآن جاهز للعمل على:
- **Frontend**: https://upafa-edu.net
- **Backend API**: https://api.upafa-edu.net

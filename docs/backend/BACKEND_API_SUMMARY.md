# Backend API Summary - My Journal

## 🎯 Overview
Complete RESTful API for Scientific Journal Management System built with NestJS, TypeORM, PostgreSQL, and Cloudinary.

## 🔐 Authentication System

### JWT Authentication
- **Strategy**: Passport JWT
- **Token Expiry**: 7 days (configurable via `JWT_EXPIRES_IN`)
- **Secret**: Stored in `.env` as `JWT_SECRET`

### Login Flow
1. User sends credentials to `POST /api/auth/login`
2. Backend validates email/password and user status
3. Returns JWT token + user info
4. Frontend stores token in localStorage
5. All subsequent requests include token in `Authorization: Bearer <token>` header

### Guards
- **JwtAuthGuard**: Validates JWT token and extracts user info
- **RolesGuard**: Checks if user has required role(s)
- **@Public()**: Decorator to bypass authentication
- **@Roles()**: Decorator to specify required roles

## 📊 Database Schema

### Users Table
- id (UUID, PK)
- email (unique)
- password (bcrypt hashed)
- name
- role (admin, editor, reviewer, researcher)
- status (active, inactive, suspended)
- phone, affiliation, specialization
- avatar_url, avatar_cloudinary_public_id
- created_at, updated_at

### Research Table
- id (UUID, PK)
- user_id (FK → users)
- research_number (unique, auto-generated)
- title, abstract, keywords
- authors, specialization
- status (under-review, approved, rejected, published, revision-requested)
- pdf_url, pdf_cloudinary_public_id
- submission_date, publication_date
- created_at, updated_at

### Research Files Table
- id (UUID, PK)
- research_id (FK → research)
- file_name, file_type
- file_url, cloudinary_public_id
- file_size
- uploaded_at

### Research Revisions Table
- id (UUID, PK)
- research_id (FK → research)
- revision_number
- revision_notes, changes_summary
- file_url, cloudinary_public_id
- status (pending, approved, rejected)
- submitted_at, reviewed_at

### Reviews Table
- id (UUID, PK)
- research_id (FK → research)
- reviewer_id (FK → users)
- comments, rating (1-5)
- recommendation (accept, minor-revisions, major-revisions, reject)
- status (pending, in-progress, completed)
- submitted_at

### Reviewer Assignments Table
- id (UUID, PK)
- research_id (FK → research)
- reviewer_id (FK → users)
- assigned_by (FK → users)
- status (pending, accepted, declined, completed)
- assigned_at, accepted_at, completed_at

### Notifications Table
- id (UUID, PK)
- user_id (FK → users)
- type (research_submitted, review_assigned, etc.)
- title, message
- is_read
- created_at

### Site Settings Table
- id (UUID, PK)
- site_name, site_description
- contact_email, contact_phone
- maintenance_mode, maintenance_message
- updated_at

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/login                    # Login (Public)
```

### Users
```
POST   /api/users                         # Register (Public)
GET    /api/users                         # Get all (Admin/Editor)
GET    /api/users/stats                   # Get stats (Admin/Editor)
GET    /api/users/:id                     # Get by ID
PATCH  /api/users/:id                     # Update (Admin/Editor)
DELETE /api/users/:id                     # Delete (Admin)
POST   /api/users/:id/verify-password     # Verify password
POST   /api/users/:id/upload-avatar       # Upload avatar
DELETE /api/users/:id/avatar              # Delete avatar
GET    /api/users/:id/avatar-url          # Get avatar URL
```

### Research
```
POST   /api/research                      # Create (Researcher/Admin/Editor)
GET    /api/research                      # Get all (with filters)
GET    /api/research/stats                # Get statistics
GET    /api/research/:id                  # Get by ID
GET    /api/research/number/:number       # Get by research number
PATCH  /api/research/:id                  # Update
PATCH  /api/research/:id/status           # Update status (Admin/Editor)
DELETE /api/research/:id                  # Delete (Admin)

# File Management
POST   /api/research/:id/upload-pdf       # Upload PDF
POST   /api/research/:id/upload-supplementary  # Upload supplementary
GET    /api/research/:id/files            # Get all files
GET    /api/research/:id/pdf-view-url     # Get PDF view URL (signed)
GET    /api/research/:id/pdf-download-url # Get PDF download URL (signed)
GET    /api/research/download?file=...    # Download file (signed)
DELETE /api/research/files/:file_id       # Delete file
```

### Research Revisions
```
POST   /api/research-revisions            # Create revision
GET    /api/research-revisions/research/:research_id  # Get research revisions
GET    /api/research-revisions/:id        # Get by ID
POST   /api/research-revisions/:id/upload-file  # Upload revision file
PUT    /api/research-revisions/:id/approve      # Approve (Editor/Admin)
PUT    /api/research-revisions/:id/reject       # Reject (Editor/Admin)
GET    /api/research-revisions/:id/file-download-url  # Get file URL
```

### Reviews
```
POST   /api/reviews                       # Create (Reviewer)
GET    /api/reviews                       # Get all (with filters)
GET    /api/reviews/stats/:research_id    # Get review stats
GET    /api/reviews/:id                   # Get by ID
PATCH  /api/reviews/:id                   # Update
PATCH  /api/reviews/:id/status            # Update status
DELETE /api/reviews/:id                   # Delete (Admin)
```

### Reviewer Assignments
```
POST   /api/reviewer-assignments          # Assign reviewer (Editor/Admin)
GET    /api/reviewer-assignments          # Get all
GET    /api/reviewer-assignments/research/:research_id  # Get research assignments
GET    /api/reviewer-assignments/reviewer/:reviewer_id  # Get reviewer assignments
PATCH  /api/reviewer-assignments/:id/status  # Update status
DELETE /api/reviewer-assignments/:id       # Delete (Admin)
```

### Notifications
```
POST   /api/notifications                 # Create notification
GET    /api/notifications                 # Get all
GET    /api/notifications/user/:user_id   # Get user notifications
GET    /api/notifications/user/:user_id/unread-count  # Get unread count
PATCH  /api/notifications/:id             # Update
PATCH  /api/notifications/:id/read        # Mark as read
POST   /api/notifications/mark-all-read   # Mark all as read
POST   /api/notifications/broadcast       # Broadcast (Admin)
DELETE /api/notifications/:id             # Delete
```

### Site Settings
```
GET    /api/site-settings                 # Get settings (Admin/Editor)
GET    /api/site-settings/public          # Get public settings (Public)
PATCH  /api/site-settings                 # Update (Admin)
POST   /api/site-settings/maintenance-mode  # Toggle maintenance (Admin)
```

### Publication Fields
```
POST   /api/publication-fields            # Create field
GET    /api/publication-fields            # Get all
GET    /api/publication-fields/:id        # Get by ID
PATCH  /api/publication-fields/:id        # Update
DELETE /api/publication-fields/:id        # Delete
```

### Activity Logs
```
POST   /api/activity-logs                 # Create log
GET    /api/activity-logs                 # Get all
GET    /api/activity-logs/:id             # Get by ID
PATCH  /api/activity-logs/:id             # Update
DELETE /api/activity-logs/:id             # Delete
```

### Contact Submissions
```
POST   /api/contact-submissions           # Create submission
GET    /api/contact-submissions           # Get all
GET    /api/contact-submissions/:id       # Get by ID
PATCH  /api/contact-submissions/:id/status  # Update status
DELETE /api/contact-submissions/:id       # Delete
```

## 🔒 Authorization Matrix

| Endpoint | Admin | Editor | Reviewer | Researcher | Public |
|----------|-------|--------|----------|------------|--------|
| Login | ✅ | ✅ | ✅ | ✅ | ✅ |
| Register | ✅ | ✅ | ✅ | ✅ | ✅ |
| Get All Users | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update User | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete User | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create Research | ✅ | ✅ | ❌ | ✅ | ❌ |
| Update Research Status | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Review | ✅ | ✅ | ✅ | ❌ | ❌ |
| Assign Reviewer | ✅ | ✅ | ❌ | ❌ | ❌ |
| Approve Revision | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update Site Settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| Broadcast Notification | ✅ | ❌ | ❌ | ❌ | ❌ |

## 📁 Cloudinary Integration

### File Storage Structure
```
research/
  pdfs/
    {research_number}/
      {research_number}.pdf
  supplementary/
    {research_number}/
      {filename}_{timestamp}.pdf
  revisions/
    {research_number}/
      revision-{number}.pdf

users/
  avatars/
    avatar_{user_id}.png
```

### Security
- **New Files**: `type: 'upload'` (public access)
- **Old Files**: Signed URLs with 1-hour expiry
- **File Sanitization**: Arabic characters removed from filenames
- **PDF Delivery**: Enabled in Cloudinary Dashboard

### Endpoints
- Upload: `POST /research/:id/upload-pdf`
- View URL: `GET /research/:id/pdf-view-url`
- Download URL: `GET /research/:id/pdf-download-url`
- Generic Download: `GET /research/download?file={public_id}`

## 🚀 Running the Backend

### Development
```bash
# Install dependencies
npm install

# Start PostgreSQL database
# Make sure it's running on localhost:5432

# Run migrations (if any)
npm run migration:run

# Start backend
npx nx serve backend

# Backend runs on http://localhost:3000
```

### Environment Variables (.env)
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=journal_user
DATABASE_PASSWORD=123456
DATABASE_NAME=journal_db

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_URL=cloudinary://239981419569485:SAI_t-S1JekbLOOtOcuoVdUnXrI@dxcgmdbbs
```

## 🧪 Testing with Postman

1. Import `My-Journal-API.postman_collection.json`
2. Import `My-Journal-API.postman_environment.json`
3. Run "🔐 Authentication > Login" request
4. Token and user_id will be auto-saved
5. Test other endpoints!

### Demo Accounts
```
Admin:      admin@demo.com      / Demo@123
Editor:     editor@demo.com     / Demo@123
Reviewer:   reviewer@demo.com   / Demo@123
Researcher: researcher@demo.com / Demo@123
```

## 📝 Key Features

### ✅ Implemented
- JWT Authentication with Passport
- Role-based Access Control (RBAC)
- User Management (CRUD + Avatar)
- Research Submission & Management
- Research Revisions System
- Peer Review System
- Reviewer Assignment
- Real-time Notifications
- Activity Logging
- Site Settings Management
- Cloudinary File Storage
- Signed URLs for secure file access
- PDF Upload & Download
- Email/Password Validation
- User Status Management (active/inactive/suspended)

### 🔄 Auto-Generated
- Research Numbers (RES-YYYY-NNN)
- Revision Numbers (sequential per research)
- Timestamps (created_at, updated_at)
- UUIDs for all primary keys

### 🔔 Notification Types
- RESEARCH_SUBMITTED
- RESEARCH_STATUS_CHANGED
- REVIEW_ASSIGNED
- REVIEW_SUBMITTED
- REVISION_REQUESTED
- REVISION_SUBMITTED
- ACCOUNT_CREATED
- ACCOUNT_APPROVED
- ACCOUNT_SUSPENDED
- PASSWORD_CHANGED

## 📚 Documentation Files
- `BACKEND_API_SUMMARY.md` - This file
- `POSTMAN_COLLECTION_README.md` - Postman usage guide
- `DATABASE_SCHEMA.md` - Database structure
- `CLOUDINARY_INTEGRATION.md` - Cloudinary setup
- `AUTH_INTEGRATION_README.md` - Authentication guide

## 🎓 Tech Stack
- **Framework**: NestJS 11
- **Database**: PostgreSQL + TypeORM
- **Authentication**: Passport JWT
- **File Storage**: Cloudinary
- **Validation**: class-validator
- **Password Hashing**: bcrypt
- **API Style**: RESTful

## 🔧 Module Structure
```
apps/backend/src/
├── app/                    # Main app module
├── common/                 # Shared resources
│   ├── decorators/         # @Public(), @Roles()
│   └── guards/             # JwtAuthGuard, RolesGuard
├── config/                 # Database config
├── database/               # Entities
│   └── entities/
├── modules/
│   ├── auth/               # Authentication
│   ├── users/              # User management
│   ├── research/           # Research management
│   ├── research-revisions/ # Revisions
│   ├── reviews/            # Peer reviews
│   ├── reviewer-assignments/
│   ├── notifications/
│   ├── site-settings/
│   ├── publication-fields/
│   ├── activity-logs/
│   ├── contact-submissions/
│   └── cloudinary/         # File storage
└── main.ts                 # Entry point
```

## ✨ Best Practices
- ✅ DTOs for validation
- ✅ Guards for authorization
- ✅ Decorators for metadata
- ✅ Services for business logic
- ✅ Repositories for data access
- ✅ Error handling with proper HTTP codes
- ✅ Password hashing before storage
- ✅ JWT token validation
- ✅ File sanitization
- ✅ Signed URLs for security

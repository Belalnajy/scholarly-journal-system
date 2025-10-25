# My Journal API - Postman Collection

## 📋 Overview
Complete Postman collection for testing all My Journal API endpoints with JWT authentication.

## 🔧 Setup Instructions

### 1. Import Collection
1. Open Postman
2. Click **Import** button
3. Select `My-Journal-API.postman_collection.json`
4. Select `My-Journal-API.postman_environment.json`

### 2. Configure Environment
Set these variables in your Postman environment:
- `base_url`: `http://localhost:3000/api`
- `token`: (will be auto-filled after login)
- `user_id`: (will be auto-filled after login)
- `research_id`: (will be auto-filled after creating research)

### 3. Authentication Flow
1. Run **Authentication > Login** request
2. Token and user_id will be automatically saved
3. All subsequent requests will use the saved token

## 📚 API Endpoints Summary

### Authentication
- `POST /auth/login` - Login with email/password (returns JWT token)

### Users
- `POST /users` - Register new user (Public)
- `GET /users` - Get all users (Admin/Editor)
- `GET /users/stats` - Get user statistics (Admin/Editor)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user (Admin/Editor)
- `DELETE /users/:id` - Delete user (Admin)
- `POST /users/:id/verify-password` - Verify password
- `POST /users/:id/upload-avatar` - Upload avatar
- `DELETE /users/:id/avatar` - Delete avatar
- `GET /users/:id/avatar-url` - Get avatar URL

### Research
- `POST /research` - Create research (Researcher/Admin/Editor)
- `GET /research` - Get all research (with filters)
- `GET /research/stats` - Get research statistics
- `GET /research/:id` - Get research by ID
- `GET /research/number/:number` - Get research by number
- `PATCH /research/:id` - Update research
- `PATCH /research/:id/status` - Update status (Admin/Editor)
- `DELETE /research/:id` - Delete research (Admin)
- `POST /research/:id/upload-pdf` - Upload PDF
- `POST /research/:id/upload-supplementary` - Upload supplementary file
- `GET /research/:id/pdf-view-url` - Get PDF view URL (signed)
- `GET /research/:id/pdf-download-url` - Get PDF download URL (signed)
- `GET /research/:id/files` - Get all research files
- `GET /research/download?file={public_id}` - Download file (signed URL)

### Research Revisions
- `POST /research-revisions` - Create revision
- `GET /research-revisions/research/:research_id` - Get research revisions
- `GET /research-revisions/:id` - Get revision by ID
- `POST /research-revisions/:id/upload-file` - Upload revision file
- `PUT /research-revisions/:id/approve` - Approve revision (Editor/Admin)
- `PUT /research-revisions/:id/reject` - Reject revision (Editor/Admin)
- `GET /research-revisions/:id/file-download-url` - Get file download URL

### Reviews
- `POST /reviews` - Create review (Reviewer)
- `GET /reviews` - Get all reviews (with filters)
- `GET /reviews/stats/:research_id` - Get review stats
- `GET /reviews/:id` - Get review by ID
- `PATCH /reviews/:id` - Update review
- `PATCH /reviews/:id/status` - Update review status
- `DELETE /reviews/:id` - Delete review (Admin)

### Reviewer Assignments
- `POST /reviewer-assignments` - Assign reviewer (Editor/Admin)
- `GET /reviewer-assignments` - Get all assignments
- `GET /reviewer-assignments/research/:research_id` - Get research assignments
- `GET /reviewer-assignments/reviewer/:reviewer_id` - Get reviewer assignments
- `PATCH /reviewer-assignments/:id/status` - Update assignment status
- `DELETE /reviewer-assignments/:id` - Delete assignment (Admin)

### Notifications
- `POST /notifications` - Create notification
- `GET /notifications` - Get all notifications
- `GET /notifications/user/:user_id` - Get user notifications
- `GET /notifications/user/:user_id/unread-count` - Get unread count
- `PATCH /notifications/:id` - Update notification
- `PATCH /notifications/:id/read` - Mark as read
- `POST /notifications/mark-all-read` - Mark all as read
- `POST /notifications/broadcast` - Broadcast notification (Admin)
- `DELETE /notifications/:id` - Delete notification

### Site Settings
- `GET /site-settings` - Get settings (Admin/Editor)
- `GET /site-settings/public` - Get public settings (Public)
- `PATCH /site-settings` - Update settings (Admin)
- `POST /site-settings/maintenance-mode` - Toggle maintenance (Admin)

### Publication Fields
- `POST /publication-fields` - Create field
- `GET /publication-fields` - Get all fields
- `GET /publication-fields/:id` - Get field by ID
- `PATCH /publication-fields/:id` - Update field
- `DELETE /publication-fields/:id` - Delete field

### Activity Logs
- `POST /activity-logs` - Create log
- `GET /activity-logs` - Get all logs
- `GET /activity-logs/:id` - Get log by ID
- `PATCH /activity-logs/:id` - Update log
- `DELETE /activity-logs/:id` - Delete log

### Contact Submissions
- `POST /contact-submissions` - Create submission
- `GET /contact-submissions` - Get all submissions
- `GET /contact-submissions/:id` - Get submission by ID
- `PATCH /contact-submissions/:id/status` - Update status
- `DELETE /contact-submissions/:id` - Delete submission

## 🔐 Authentication & Authorization

### JWT Token
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### User Roles
- **Admin**: Full access to all endpoints
- **Editor**: Manage research, reviews, assignments
- **Reviewer**: Create and manage reviews
- **Researcher**: Submit and manage own research

### Demo Accounts
```
Admin:      admin@demo.com      / Demo@123
Editor:     editor@demo.com     / Demo@123
Reviewer:   reviewer@demo.com   / Demo@123
Researcher: researcher@demo.com / Demo@123
```

## 📝 Testing Workflow

### 1. Authentication
```bash
POST /auth/login
{
  "email": "admin@demo.com",
  "password": "Demo@123"
}
```

### 2. Create Research
```bash
POST /research
{
  "user_id": "{{user_id}}",
  "title": "Test Research",
  "abstract": "Abstract...",
  "keywords": "keyword1, keyword2",
  "specialization": "Computer Science",
  "authors": "Author Name"
}
```

### 3. Upload PDF
```bash
POST /research/{{research_id}}/upload-pdf
Form-data: file = [PDF file]
```

### 4. Assign Reviewer
```bash
POST /reviewer-assignments
{
  "research_id": "{{research_id}}",
  "reviewer_id": "reviewer_user_id"
}
```

### 5. Create Review
```bash
POST /reviews
{
  "research_id": "{{research_id}}",
  "reviewer_id": "{{user_id}}",
  "comments": "Review comments...",
  "rating": 4,
  "recommendation": "accept"
}
```

## 🔄 Environment Variables

The collection uses these auto-updating variables:
- `token` - Auto-saved after login
- `user_id` - Auto-saved after login
- `research_id` - Auto-saved after creating research
- `review_id` - Auto-saved after creating review
- `assignment_id` - Auto-saved after creating assignment

## 🚀 Quick Start

1. Start backend: `npx nx serve backend`
2. Import collection and environment in Postman
3. Run "Authentication > Login" request
4. Start testing other endpoints!

## 📖 Additional Resources

- Backend API Documentation: See `apps/backend/src/`
- Database Schema: See `DATABASE_SCHEMA.md`
- Cloudinary Integration: See `CLOUDINARY_INTEGRATION.md`

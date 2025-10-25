# نظام الحماية والصلاحيات - Backend Security System

## 🔒 نظرة عامة

تم إنشاء نظام حماية شامل للـ Backend باستخدام **Guards** و **Decorators** لضمان أن جميع الـ API Endpoints محمية بشكل صحيح.

## 🛡️ مكونات النظام

### 1. JWT Authentication Guard

**الملف:** `/apps/backend/src/common/guards/jwt-auth.guard.ts`

```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user exists and is active
    if (!user || !user.id || user.status !== 'active') {
      throw new UnauthorizedException('يجب تسجيل الدخول للوصول إلى هذا المورد');
    }

    return true;
  }
}
```

**الوظيفة:**
- ✅ التحقق من وجود مستخدم مسجل دخول
- ✅ التحقق من أن حالة المستخدم `active`
- ✅ السماح بالوصول للـ routes المُعلمة بـ `@Public()`

### 2. Roles Guard

**الملف:** `/apps/backend/src/common/guards/roles.guard.ts`

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.role) {
      throw new ForbiddenException('ليس لديك صلاحية للوصول إلى هذا المورد');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);
    
    if (!hasRole) {
      throw new ForbiddenException(
        `هذا المورد متاح فقط لـ: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}
```

**الوظيفة:**
- ✅ التحقق من أن المستخدم لديه أحد الأدوار المطلوبة
- ✅ رسائل خطأ واضحة بالعربية
- ✅ دعم multiple roles

### 3. Decorators

#### @Public()

**الملف:** `/apps/backend/src/common/decorators/public.decorator.ts`

```typescript
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**الاستخدام:**
```typescript
@Get('public')
@Public() // No authentication required
getPublicSettings() {
  return this.siteSettingsService.getPublicSettings();
}
```

#### @Roles()

**الملف:** `/apps/backend/src/common/decorators/roles.decorator.ts`

```typescript
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

**الاستخدام:**
```typescript
@Get()
@Roles('admin', 'editor') // Only admin and editor can access
findAll() {
  return this.usersService.findAll();
}
```

## 📋 الأدوار المتاحة (User Roles)

| الدور | الوصف | الصلاحيات |
|-------|-------|-----------|
| **admin** | مدير النظام | جميع الصلاحيات |
| **editor** | محرر | إدارة الأبحاث، المراجعين، الإعدادات |
| **reviewer** | مُحكّم | مراجعة الأبحاث، إضافة تقييمات |
| **researcher** | باحث | تقديم الأبحاث، التعديلات |

## 🔐 الحماية على Controllers

### 1. Users Controller

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  
  @Post()
  @Public() // ✅ Public - للتسجيل
  create(@Body() createUserDto: CreateUserDto) {}

  @Get()
  @Roles('admin', 'editor') // 🔒 Admin & Editor فقط
  findAll() {}

  @Get('stats')
  @Roles('admin', 'editor') // 🔒 Admin & Editor فقط
  getStats() {}

  @Get(':id')
  findOne(@Param('id') id: string) {} // 🔒 Authenticated users

  @Patch(':id')
  @Roles('admin', 'editor') // 🔒 Admin & Editor فقط
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {}

  @Delete(':id')
  @Roles('admin') // 🔒 Admin فقط
  remove(@Param('id') id: string) {}

  @Post(':id/upload-avatar')
  uploadAvatar() {} // 🔒 Authenticated users

  @Delete(':id/avatar')
  deleteAvatar() {} // 🔒 Authenticated users
}
```

**ملخص الصلاحيات:**
- ✅ **Public**: التسجيل
- 🔒 **Authenticated**: عرض ملف شخصي، رفع صورة
- 🔒 **Admin/Editor**: عرض جميع المستخدمين، الإحصائيات، التعديل
- 🔒 **Admin**: الحذف

### 2. Research Controller

```typescript
@Controller('research')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResearchController {
  
  @Post()
  @Roles('researcher', 'admin', 'editor') // 🔒 Researchers
  create(@Body() createResearchDto: CreateResearchDto) {}

  @Get()
  @Roles('researcher', 'reviewer', 'editor', 'admin') // 🔒 All users
  findAll() {}

  @Get('stats')
  getStats() {} // 🔒 Authenticated users

  @Get(':id')
  findOne(@Param('id') id: string) {} // 🔒 Authenticated users

  @Patch(':id')
  @Roles('researcher', 'admin', 'editor') // 🔒 Researchers
  update(@Param('id') id: string, @Body() updateResearchDto: UpdateResearchDto) {}

  @Patch(':id/status')
  @Roles('admin', 'editor') // 🔒 Admin & Editor فقط
  updateStatus(@Param('id') id: string, @Body('status') status: ResearchStatus) {}

  @Delete(':id')
  @Roles('admin') // 🔒 Admin فقط
  remove(@Param('id') id: string) {}

  @Post(':id/upload-pdf')
  @Roles('researcher', 'admin', 'editor') // 🔒 Researchers
  uploadPDF() {}

  @Post(':id/upload-supplementary')
  @Roles('researcher', 'admin', 'editor') // 🔒 Researchers
  uploadSupplementary() {}
}
```

**ملخص الصلاحيات:**
- 🔒 **Researchers**: إنشاء، تعديل، رفع ملفات
- 🔒 **Reviewers**: عرض الأبحاث
- 🔒 **Admin/Editor**: تغيير الحالة
- 🔒 **Admin**: الحذف

### 3. Reviews Controller

```typescript
@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewsController {
  
  @Post()
  @Roles('reviewer', 'admin', 'editor') // 🔒 Reviewers
  create(@Body() createDto: CreateReviewDto) {}

  @Get()
  @Roles('reviewer', 'editor', 'admin') // 🔒 Reviewers & Editors
  findAll() {}

  @Get(':id')
  findOne(@Param('id') id: string) {} // 🔒 Authenticated users

  @Patch(':id')
  @Roles('reviewer', 'admin', 'editor') // 🔒 Reviewers
  update(@Param('id') id: string, @Body() updateDto: UpdateReviewDto) {}

  @Delete(':id')
  @Roles('admin') // 🔒 Admin فقط
  remove(@Param('id') id: string) {}
}
```

**ملخص الصلاحيات:**
- 🔒 **Reviewers**: إنشاء، تعديل التقييمات
- 🔒 **Admin/Editor**: عرض جميع التقييمات
- 🔒 **Admin**: الحذف

### 4. Reviewer Assignments Controller

```typescript
@Controller('reviewer-assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewerAssignmentsController {
  
  @Post()
  @Roles('admin', 'editor') // 🔒 Admin & Editor فقط
  create(@Body() createDto: CreateReviewerAssignmentDto) {}

  @Get()
  @Roles('reviewer', 'editor', 'admin') // 🔒 Reviewers & Editors
  findAll() {}

  @Patch(':id')
  @Roles('reviewer', 'admin', 'editor') // 🔒 Reviewers
  update(@Param('id') id: string, @Body() updateDto: UpdateReviewerAssignmentDto) {}

  @Delete(':id')
  @Roles('admin') // 🔒 Admin فقط
  remove(@Param('id') id: string) {}
}
```

**ملخص الصلاحيات:**
- 🔒 **Admin/Editor**: تعيين المُحكمين
- 🔒 **Reviewers**: عرض وتحديث التعيينات
- 🔒 **Admin**: الحذف

### 5. Research Revisions Controller

```typescript
@Controller('research-revisions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResearchRevisionsController {
  
  @Post()
  @Roles('admin', 'editor') // 🔒 Admin & Editor فقط
  create(@Body() createDto: CreateRevisionDto) {}

  @Get()
  @Roles('researcher', 'editor', 'admin') // 🔒 Researchers & Editors
  findAll() {}

  @Put(':id/submit')
  @Roles('researcher', 'admin', 'editor') // 🔒 Researchers
  submitRevision() {}

  @Put(':id/approve')
  @Roles('admin', 'editor') // 🔒 Admin & Editor فقط
  approveRevision() {}

  @Put(':id/reject')
  @Roles('admin', 'editor') // 🔒 Admin & Editor فقط
  rejectRevision() {}

  @Delete(':id')
  @Roles('admin') // 🔒 Admin فقط
  delete() {}

  @Post(':id/upload-file')
  @Roles('researcher', 'admin', 'editor') // 🔒 Researchers
  uploadRevisionFile() {}
}
```

**ملخص الصلاحيات:**
- 🔒 **Admin/Editor**: إنشاء طلبات تعديل، الموافقة/الرفض
- 🔒 **Researchers**: إرسال التعديلات، رفع ملفات
- 🔒 **Admin**: الحذف

### 6. Site Settings Controller

```typescript
@Controller('site-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SiteSettingsController {
  
  @Get()
  @Roles('admin', 'editor') // 🔒 Admin & Editor فقط
  getSettings() {}

  @Get('public')
  @Public() // ✅ Public
  getPublicSettings() {}

  @Patch()
  @Roles('admin') // 🔒 Admin فقط
  updateSettings(@Body() updateSiteSettingsDto: UpdateSiteSettingsDto) {}

  @Post('maintenance-mode')
  @Roles('admin') // 🔒 Admin فقط
  toggleMaintenanceMode(@Body() body: { enabled: boolean }) {}
}
```

**ملخص الصلاحيات:**
- ✅ **Public**: الإعدادات العامة
- 🔒 **Admin/Editor**: عرض جميع الإعدادات
- 🔒 **Admin**: التعديل، وضع الصيانة

## 📊 جدول الصلاحيات الكامل

| Controller | Endpoint | Method | Roles | Public |
|-----------|----------|--------|-------|--------|
| **Users** | `/users` | POST | - | ✅ |
| | `/users` | GET | admin, editor | ❌ |
| | `/users/stats` | GET | admin, editor | ❌ |
| | `/users/:id` | GET | authenticated | ❌ |
| | `/users/:id` | PATCH | admin, editor | ❌ |
| | `/users/:id` | DELETE | admin | ❌ |
| **Research** | `/research` | POST | researcher, admin, editor | ❌ |
| | `/research` | GET | researcher, reviewer, editor, admin | ❌ |
| | `/research/:id` | PATCH | researcher, admin, editor | ❌ |
| | `/research/:id/status` | PATCH | admin, editor | ❌ |
| | `/research/:id` | DELETE | admin | ❌ |
| | `/research/:id/upload-pdf` | POST | researcher, admin, editor | ❌ |
| **Reviews** | `/reviews` | POST | reviewer, admin, editor | ❌ |
| | `/reviews` | GET | reviewer, editor, admin | ❌ |
| | `/reviews/:id` | PATCH | reviewer, admin, editor | ❌ |
| | `/reviews/:id` | DELETE | admin | ❌ |
| **Assignments** | `/reviewer-assignments` | POST | admin, editor | ❌ |
| | `/reviewer-assignments` | GET | reviewer, editor, admin | ❌ |
| | `/reviewer-assignments/:id` | PATCH | reviewer, admin, editor | ❌ |
| | `/reviewer-assignments/:id` | DELETE | admin | ❌ |
| **Revisions** | `/research-revisions` | POST | admin, editor | ❌ |
| | `/research-revisions` | GET | researcher, editor, admin | ❌ |
| | `/research-revisions/:id/submit` | PUT | researcher, admin, editor | ❌ |
| | `/research-revisions/:id/approve` | PUT | admin, editor | ❌ |
| | `/research-revisions/:id/reject` | PUT | admin, editor | ❌ |
| | `/research-revisions/:id` | DELETE | admin | ❌ |
| **Settings** | `/site-settings` | GET | admin, editor | ❌ |
| | `/site-settings/public` | GET | - | ✅ |
| | `/site-settings` | PATCH | admin | ❌ |
| | `/site-settings/maintenance-mode` | POST | admin | ❌ |

## 🚀 كيفية الاستخدام

### تطبيق Guards على Controller

```typescript
import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('example')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply guards to all routes
export class ExampleController {
  
  @Get('public')
  @Public() // Override - no authentication needed
  getPublicData() {
    return { message: 'This is public' };
  }

  @Get('protected')
  // Authenticated users only (no specific role required)
  getProtectedData() {
    return { message: 'This requires authentication' };
  }

  @Get('admin-only')
  @Roles('admin') // Admin only
  getAdminData() {
    return { message: 'This is for admins only' };
  }

  @Get('multi-role')
  @Roles('admin', 'editor', 'reviewer') // Multiple roles
  getMultiRoleData() {
    return { message: 'This is for admins, editors, and reviewers' };
  }
}
```

## ⚠️ ملاحظات مهمة

### 1. ترتيب Guards مهم!

```typescript
@UseGuards(JwtAuthGuard, RolesGuard) // ✅ Correct order
```

يجب أن يكون `JwtAuthGuard` **قبل** `RolesGuard` لأن:
- `JwtAuthGuard` يتحقق من وجود المستخدم
- `RolesGuard` يتحقق من صلاحيات المستخدم

### 2. الـ User Object

يجب أن يكون الـ `user` object متاحاً في الـ `request`:

```typescript
// في middleware أو passport strategy
request.user = {
  id: 'user-id',
  email: 'user@example.com',
  role: 'researcher',
  status: 'active',
  // ... other fields
};
```

### 3. Public Routes

استخدم `@Public()` للـ routes التي لا تحتاج authentication:

```typescript
@Post('register')
@Public()
register(@Body() dto: RegisterDto) {
  return this.authService.register(dto);
}
```

## 🔧 التحسينات المستقبلية

### 1. Resource-Based Authorization

إضافة التحقق من ملكية المورد:

```typescript
// مثال: السماح للباحث بتعديل أبحاثه فقط
@Patch(':id')
@Roles('researcher', 'admin', 'editor')
async update(@Param('id') id: string, @Request() req, @Body() dto: UpdateResearchDto) {
  const research = await this.researchService.findOne(id);
  
  // Check ownership
  if (req.user.role === 'researcher' && research.user_id !== req.user.id) {
    throw new ForbiddenException('لا يمكنك تعديل أبحاث الآخرين');
  }
  
  return this.researchService.update(id, dto);
}
```

### 2. Permission-Based System

بدلاً من الأدوار، استخدام صلاحيات محددة:

```typescript
@Permissions('research:update', 'research:delete')
updateResearch() {}
```

### 3. Rate Limiting

إضافة حماية من الـ brute force attacks:

```typescript
@UseGuards(ThrottlerGuard)
@Throttle(5, 60) // 5 requests per minute
@Post('login')
login() {}
```

## ✅ الخلاصة

### ما تم إنجازه:

1. ✅ إنشاء `JwtAuthGuard` للتحقق من Authentication
2. ✅ تحديث `RolesGuard` لدعم multiple roles
3. ✅ إنشاء `@Public()` decorator
4. ✅ تحديث `@Roles()` decorator
5. ✅ تطبيق Guards على جميع Controllers:
   - ✅ Users Controller
   - ✅ Research Controller
   - ✅ Reviews Controller
   - ✅ Reviewer Assignments Controller
   - ✅ Research Revisions Controller
   - ✅ Site Settings Controller

### الحماية الحالية:

- 🔒 **جميع الـ Endpoints محمية** بـ Authentication (ما عدا Public routes)
- 🔒 **صلاحيات محددة** لكل دور (Role)
- 🔒 **رسائل خطأ واضحة** بالعربية
- 🔒 **التحقق من حالة المستخدم** (active/inactive)

### الخطوات التالية:

1. ⚠️ **إضافة JWT Strategy/Middleware** لتعيين `request.user`
2. ⚠️ **Resource-Based Authorization** للتحقق من الملكية
3. ⚠️ **Rate Limiting** للحماية من الهجمات
4. ⚠️ **Audit Logging** لتسجيل جميع العمليات

---

**تم التطوير بواسطة:** Cascade AI  
**التاريخ:** 2025-01-23  
**الإصدار:** 1.0.0

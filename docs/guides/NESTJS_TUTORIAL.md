# 🎓 NestJS Tutorial - بناء Users Module من الصفر

## 📚 **المحتويات:**
1. [فهم NestJS Architecture](#architecture)
2. [إعداد البيئة](#setup)
3. [إنشاء Users Module](#module)
4. [إنشاء Entity](#entity)
5. [إنشاء DTOs](#dtos)
6. [إنشاء Service](#service)
7. [إنشاء Controller](#controller)
8. [Testing](#testing)
9. [ربط Frontend](#frontend)

---

## 🏗️ **1. فهم NestJS Architecture** <a name="architecture"></a>

### **كيف يعمل NestJS؟**

```
HTTP Request (من Frontend)
    ↓
Controller (يستقبل الطلب)
    ↓
Service (ينفذ Business Logic)
    ↓
Repository (يتعامل مع Database)
    ↓
Database (PostgreSQL)
    ↓
Repository (يرجع البيانات)
    ↓
Service (يعالج البيانات)
    ↓
Controller (يرسل Response)
    ↓
HTTP Response (للـ Frontend)
```

### **مثال عملي:**

```typescript
// 1. Frontend يرسل طلب
fetch('/api/users/123')

// 2. Controller يستقبل
@Get(':id')
getUser(@Param('id') id: string) {
  return this.usersService.findOne(id);
}

// 3. Service ينفذ
async findOne(id: string) {
  return this.userRepository.findOne({ where: { id } });
}

// 4. Repository يجيب من Database
SELECT * FROM users WHERE id = '123';

// 5. البيانات ترجع للـ Frontend
{ id: '123', name: 'Belal', email: '...' }
```

---

## ⚙️ **2. إعداد البيئة** <a name="setup"></a>

### **الحزم المطلوبة:**

```bash
# TypeORM (للتعامل مع Database)
npm install @nestjs/typeorm typeorm pg

# Class Validator (للتحقق من البيانات)
npm install class-validator class-transformer

# Config (لإدارة Environment Variables)
npm install @nestjs/config

# Bcrypt (لتشفير كلمات المرور)
npm install bcrypt
npm install -D @types/bcrypt
```

### **Environment Variables:**

```env
# .env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=journal_db

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

---

## 📦 **3. إنشاء Users Module** <a name="module"></a>

### **ما هو Module؟**

Module هو **حاوية** تجمع كل المكونات المرتبطة ببعضها (Controllers, Services, Repositories).

### **الهيكل:**

```
src/
└── modules/
    └── users/
        ├── users.module.ts       ← يجمع كل شيء
        ├── users.controller.ts   ← HTTP Layer
        ├── users.service.ts      ← Business Logic
        ├── entities/
        │   └── user.entity.ts    ← Database Model
        └── dto/
            ├── create-user.dto.ts
            ├── update-user.dto.ts
            └── user-response.dto.ts
```

### **users.module.ts:**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]) // ← تسجيل Entity
  ],
  controllers: [UsersController],    // ← Controllers
  providers: [UsersService],         // ← Services
  exports: [UsersService]            // ← Export للاستخدام في Modules أخرى
})
export class UsersModule {}
```

**شرح:**
- `imports`: نستورد TypeORM ونسجل الـ User Entity
- `controllers`: نسجل الـ Controller
- `providers`: نسجل الـ Service
- `exports`: نصدّر الـ Service لاستخدامه في modules أخرى

---

## 🗄️ **4. إنشاء Entity** <a name="entity"></a>

### **ما هو Entity؟**

Entity هو **Class** يمثل جدول في Database. كل property في الـ Class يمثل عمود في الجدول.

### **user.entity.ts:**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('users') // ← اسم الجدول في Database
export class User {
  @PrimaryGeneratedColumn('uuid') // ← UUID Primary Key
  id: string;

  @Column({ unique: true }) // ← Email فريد
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: ['researcher', 'reviewer', 'editor', 'admin'],
    default: 'researcher'
  })
  role: string;

  // Profile Info
  @Column({ nullable: true })
  avatar_url: string;

  @Column({ nullable: true })
  affiliation: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  specialization: string;

  @Column({
    type: 'enum',
    enum: ['bachelor', 'master', 'phd', 'assistant-professor', 'associate-professor', 'professor'],
    nullable: true
  })
  academic_degree: string;

  // Academic IDs
  @Column({ nullable: true })
  orcid_id: string;

  @Column({ nullable: true })
  google_scholar_id: string;

  @Column({ nullable: true })
  research_gate_id: string;

  // Additional Info
  @Column({ type: 'text', nullable: true })
  research_interests: string;

  @Column({ type: 'text', nullable: true })
  expertise_areas: string;

  @Column({ nullable: true })
  languages_spoken: string;

  @Column({ type: 'int', default: 0 })
  years_of_experience: number;

  @Column({ type: 'int', default: 0 })
  number_of_publications: number;

  @Column({ type: 'text', nullable: true })
  bio: string;

  // Status
  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  })
  status: string;

  // Timestamps
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  // Hash password before insert/update
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  // Method to compare passwords
  async comparePassword(attempt: string): Promise<boolean> {
    return await bcrypt.compare(attempt, this.password);
  }
}
```

**شرح Decorators:**
- `@Entity('users')`: يحدد اسم الجدول
- `@PrimaryGeneratedColumn('uuid')`: Primary Key من نوع UUID
- `@Column()`: عمود عادي
- `@Column({ unique: true })`: عمود فريد
- `@Column({ nullable: true })`: عمود اختياري
- `@CreateDateColumn()`: يضاف تلقائياً عند الإنشاء
- `@UpdateDateColumn()`: يتحدث تلقائياً عند التعديل
- `@BeforeInsert()`: ينفذ قبل الإضافة
- `@BeforeUpdate()`: ينفذ قبل التحديث

---

## 📝 **5. إنشاء DTOs** <a name="dtos"></a>

### **ما هو DTO؟**

DTO (Data Transfer Object) هو **Class** يحدد شكل البيانات المرسلة/المستقبلة.

### **لماذا نستخدم DTOs؟**
1. ✅ **Validation** - التحقق من البيانات
2. ✅ **Type Safety** - ضمان نوع البيانات
3. ✅ **Documentation** - توثيق API
4. ✅ **Security** - منع إرسال بيانات غير مطلوبة

### **create-user.dto.ts:**

```typescript
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'البريد الإلكتروني غير صحيح' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(['researcher', 'reviewer', 'editor', 'admin'])
  role?: string;

  @IsOptional()
  @IsString()
  affiliation?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsEnum(['bachelor', 'master', 'phd', 'assistant-professor', 'associate-professor', 'professor'])
  academic_degree?: string;

  @IsOptional()
  @IsString()
  orcid_id?: string;

  @IsOptional()
  @IsString()
  google_scholar_id?: string;

  @IsOptional()
  @IsString()
  research_gate_id?: string;

  @IsOptional()
  @IsString()
  research_interests?: string;

  @IsOptional()
  @IsString()
  expertise_areas?: string;

  @IsOptional()
  @IsString()
  languages_spoken?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  years_of_experience?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  number_of_publications?: number;

  @IsOptional()
  @IsString()
  bio?: string;
}
```

### **update-user.dto.ts:**

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsEnum } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'])
  status?: string;
}
```

**شرح:**
- `PartialType(CreateUserDto)`: يجعل كل الحقول اختيارية
- نضيف `status` لأنه يُحدث فقط، لا يُنشأ

### **user-response.dto.ts:**

```typescript
import { Exclude } from 'class-transformer';

export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  avatar_url: string;
  affiliation: string;
  department: string;
  specialization: string;
  academic_degree: string;
  orcid_id: string;
  google_scholar_id: string;
  research_gate_id: string;
  research_interests: string;
  expertise_areas: string;
  languages_spoken: string;
  years_of_experience: number;
  number_of_publications: number;
  bio: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  last_login: Date;

  @Exclude() // ← لا نرسل كلمة المرور أبداً!
  password: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
```

**شرح:**
- `@Exclude()`: يمنع إرسال الـ password في Response
- `constructor`: يسمح بإنشاء instance من البيانات

---

## 🔧 **6. إنشاء Service** <a name="service"></a>

### **ما هو Service؟**

Service يحتوي على **Business Logic** - كل العمليات والحسابات.

### **users.service.ts:**

```typescript
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Create new user
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('البريد الإلكتروني مستخدم بالفعل');
    }

    // Create user
    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);

    // Return without password
    return new UserResponseDto(savedUser);
  }

  // Find all users
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find();
    return users.map(user => new UserResponseDto(user));
  }

  // Find one user by ID
  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    return new UserResponseDto(user);
  }

  // Find user by email (for authentication)
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  // Update user
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    // Check if email is being changed and already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('البريد الإلكتروني مستخدم بالفعل');
      }
    }

    // Update user
    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    return new UserResponseDto(updatedUser);
  }

  // Delete user (soft delete)
  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    await this.userRepository.remove(user);
  }

  // Get user statistics
  async getStats() {
    const total = await this.userRepository.count();
    const researchers = await this.userRepository.count({ where: { role: 'researcher' } });
    const reviewers = await this.userRepository.count({ where: { role: 'reviewer' } });
    const editors = await this.userRepository.count({ where: { role: 'editor' } });
    const admins = await this.userRepository.count({ where: { role: 'admin' } });

    return {
      total,
      researchers,
      reviewers,
      editors,
      admins,
    };
  }
}
```

**شرح:**
- `@Injectable()`: يجعل الـ Service قابل للحقن (Dependency Injection)
- `@InjectRepository(User)`: يحقن الـ Repository
- `Repository<User>`: يوفر methods للتعامل مع Database
- `throw new NotFoundException()`: يرمي Exception مع HTTP Status 404
- `throw new ConflictException()`: يرمي Exception مع HTTP Status 409

---

## 🎮 **7. إنشاء Controller** <a name="controller"></a>

### **ما هو Controller؟**

Controller يستقبل **HTTP Requests** ويرسل **Responses**.

### **users.controller.ts:**

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor) // ← لتطبيق @Exclude()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST /api/users
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // GET /api/users
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // GET /api/users/stats
  @Get('stats')
  getStats() {
    return this.usersService.getStats();
  }

  // GET /api/users/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // PATCH /api/users/:id
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // DELETE /api/users/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
```

**شرح Decorators:**
- `@Controller('users')`: يحدد route prefix
- `@Get()`: HTTP GET request
- `@Post()`: HTTP POST request
- `@Patch()`: HTTP PATCH request
- `@Delete()`: HTTP DELETE request
- `@Param('id')`: يستخرج parameter من URL
- `@Body()`: يستخرج body من request
- `@Query()`: يستخرج query parameters
- `@HttpCode()`: يحدد HTTP status code

---

## ✅ **8. Testing** <a name="testing"></a>

### **كيف نختبر؟**

```bash
# Start the server
npm run serve

# Test with curl or Postman
```

### **Test Cases:**

```bash
# 1. Create User
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "belal@example.com",
    "password": "password123",
    "name": "Belal",
    "role": "researcher"
  }'

# 2. Get All Users
curl http://localhost:3000/api/users

# 3. Get User by ID
curl http://localhost:3000/api/users/{user-id}

# 4. Update User
curl -X PATCH http://localhost:3000/api/users/{user-id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Belal Updated"
  }'

# 5. Delete User
curl -X DELETE http://localhost:3000/api/users/{user-id}

# 6. Get Stats
curl http://localhost:3000/api/users/stats
```

---

## 🔗 **9. ربط Frontend** <a name="frontend"></a>

### **API Service (Frontend):**

```typescript
// services/users.service.ts
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const usersApi = {
  // Get all users
  getAll: async () => {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  },

  // Get user by ID
  getById: async (id: string) => {
    const response = await axios.get(`${API_URL}/users/${id}`);
    return response.data;
  },

  // Create user
  create: async (data: CreateUserDto) => {
    const response = await axios.post(`${API_URL}/users`, data);
    return response.data;
  },

  // Update user
  update: async (id: string, data: UpdateUserDto) => {
    const response = await axios.patch(`${API_URL}/users/${id}`, data);
    return response.data;
  },

  // Delete user
  delete: async (id: string) => {
    await axios.delete(`${API_URL}/users/${id}`);
  },

  // Get stats
  getStats: async () => {
    const response = await axios.get(`${API_URL}/users/stats`);
    return response.data;
  },
};
```

### **React Component Example:**

```typescript
import { useState, useEffect } from 'react';
import { usersApi } from '../services/users.service';

export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} - {user.email} - {user.role}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 📚 **المفاهيم المهمة:**

### **1. Dependency Injection:**
```typescript
// NestJS يحقن UsersService تلقائياً
constructor(private readonly usersService: UsersService) {}
```

### **2. Decorators:**
```typescript
@Controller()  // Class decorator
@Get()         // Method decorator
@Body()        // Parameter decorator
```

### **3. Exception Handling:**
```typescript
throw new NotFoundException('User not found');
throw new ConflictException('Email already exists');
throw new BadRequestException('Invalid data');
```

### **4. Validation:**
```typescript
@IsEmail()
@MinLength(8)
@IsOptional()
```

---

## 🎯 **الخطوات التالية:**

1. ✅ إضافة Authentication (JWT)
2. ✅ إضافة Authorization (Guards)
3. ✅ إضافة Pagination
4. ✅ إضافة Filtering & Sorting
5. ✅ إضافة File Upload (Avatar)
6. ✅ إضافة Email Verification
7. ✅ إضافة Password Reset

---

**📅 تم الإنشاء:** 2025-10-21  
**✍️ المطور:** Belal  
**📚 المرجع:** NestJS Official Docs

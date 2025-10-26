import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../../database/entities/notification.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

// Type for user response without password
type UserResponse = Omit<User, 'password' | 'hashPassword' | 'comparePassword'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // Create new user
  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
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

    // Send welcome notification
    try {
      await this.notificationsService.create({
        user_id: savedUser.id,
        type: NotificationType.ACCOUNT_CREATED,
        title: 'مرحباً بك في المجلة العلمية',
        message: `مرحباً ${savedUser.name}! تم إنشاء حسابك بنجاح. يمكنك الآن البدء في استخدام المنصة.`,
      });
    } catch (error) {
      // Log error but don't fail user creation
      console.error('Failed to send welcome notification:', error);
    }

    // Remove password from response
    const { password, hashPassword, comparePassword, ...result } = savedUser;
    return result as UserResponse;
  }

  // Find all users
  async findAll(): Promise<UserResponse[]> {
    const users = await this.userRepository.find();
    // Remove passwords
    return users.map((user) => {
      const { password, hashPassword, comparePassword, ...result } = user;
      return result as UserResponse;
    });
  }

  // Get editors (Public endpoint for editorial board page)
  async getEditors(): Promise<UserResponse[]> {
    const editors = await this.userRepository.find({
      where: {
        role: 'editor',
        status: 'active',
      },
      order: {
        created_at: 'DESC',
      },
    });

    // Remove passwords
    return editors.map((user) => {
      const { password, hashPassword, comparePassword, ...result } = user;
      return result as UserResponse;
    });
  }

  // Find one user by ID
  async findOne(id: string): Promise<UserResponse> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    const { password, hashPassword, comparePassword, ...result } = user;
    return result as UserResponse;
  }

  // Find user by email (for authentication)
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  // Update user
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponse> {
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

    // Track status change for notification
    const oldStatus = user.status;
    const statusChanged = updateUserDto.status && updateUserDto.status !== oldStatus;

    // Update user
    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    // Send notification if status changed
    if (statusChanged) {
      try {
        let notificationType: NotificationType;
        let title: string;
        let message: string;

        switch (updateUserDto.status) {
          case 'active':
            notificationType = NotificationType.ACCOUNT_APPROVED;
            title = 'تم تفعيل حسابك';
            message = 'تم تفعيل حسابك بنجاح. يمكنك الآن الوصول إلى جميع ميزات المنصة.';
            break;
          case 'suspended':
            notificationType = NotificationType.ACCOUNT_SUSPENDED;
            title = 'تم تعليق حسابك';
            message = 'تم تعليق حسابك مؤقتاً. يرجى التواصل مع الإدارة للمزيد من المعلومات.';
            break;
          case 'inactive':
            notificationType = NotificationType.GENERAL;
            title = 'تم تغيير حالة حسابك';
            message = 'تم تغيير حالة حسابك إلى غير نشط.';
            break;
          default:
            notificationType = NotificationType.GENERAL;
            title = 'تم تحديث حسابك';
            message = 'تم تحديث معلومات حسابك.';
        }

        await this.notificationsService.create({
          user_id: updatedUser.id,
          type: notificationType,
          title,
          message,
        });
      } catch (error) {
        console.error('Failed to send status change notification:', error);
      }
    }

    // Send notification if password was changed
    if (updateUserDto.password) {
      try {
        await this.notificationsService.create({
          user_id: updatedUser.id,
          type: NotificationType.PASSWORD_CHANGED,
          title: 'تم تغيير كلمة المرور',
          message: 'تم تغيير كلمة المرور الخاصة بك بنجاح. إذا لم تقم بهذا الإجراء، يرجى التواصل مع الإدارة فوراً.',
        });
      } catch (error) {
        console.error('Failed to send password change notification:', error);
      }
    }

    const { password, hashPassword, comparePassword, ...result } = updatedUser;
    return result as UserResponse;
  }

  // Delete user
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
    const researchers = await this.userRepository.count({
      where: { role: 'researcher' },
    });
    const reviewers = await this.userRepository.count({
      where: { role: 'reviewer' },
    });
    const editors = await this.userRepository.count({
      where: { role: 'editor' },
    });
    const admins = await this.userRepository.count({
      where: { role: 'admin' },
    });

    return {
      total,
      researchers,
      reviewers,
      editors,
      admins,
    };
  }

  // Verify user password
  async verifyPassword(id: string, password: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    
    const isValid = await user.comparePassword(password);
    
    if (!isValid) {
      throw new UnauthorizedException('كلمة المرور غير صحيحة');
    }

    return true;
  }

  // Upload user avatar to Cloudinary
  async uploadAvatar(userId: string, fileBuffer: Buffer): Promise<UserResponse> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    // Delete old avatar if exists
    if (user.avatar_cloudinary_public_id) {
      try {
        await this.cloudinaryService.deleteFile(
          user.avatar_cloudinary_public_id,
          'image'
        );
      } catch (error) {
        console.error('Failed to delete old avatar from Cloudinary:', error);
      }
    }

    // Upload new avatar
    const uploadResult = await this.cloudinaryService.uploadAvatar(
      fileBuffer,
      userId
    );

    // Update user with new avatar info
    user.avatar_url = uploadResult.secure_url;
    user.avatar_cloudinary_public_id = uploadResult.public_id;
    user.avatar_cloudinary_secure_url = uploadResult.secure_url;

    const updatedUser = await this.userRepository.save(user);

    const { password, hashPassword, comparePassword, ...result } = updatedUser;
    return result as UserResponse;
  }

  // Delete user avatar
  async deleteAvatar(userId: string): Promise<UserResponse> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    // Delete from Cloudinary if exists
    if (user.avatar_cloudinary_public_id) {
      try {
        await this.cloudinaryService.deleteFile(
          user.avatar_cloudinary_public_id,
          'image'
        );
      } catch (error) {
        console.error('Failed to delete avatar from Cloudinary:', error);
      }
    }

    // Clear avatar fields
    user.avatar_url = null;
    user.avatar_cloudinary_public_id = null;
    user.avatar_cloudinary_secure_url = null;

    const updatedUser = await this.userRepository.save(user);

    const { password, hashPassword, comparePassword, ...result } = updatedUser;
    return result as UserResponse;
  }

  // Get optimized avatar URL
  async getAvatarUrl(userId: string, width?: number, height?: number): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    if (!user.avatar_cloudinary_public_id) {
      throw new NotFoundException('لا توجد صورة شخصية للمستخدم');
    }

    return this.cloudinaryService.getOptimizedImageUrl(
      user.avatar_cloudinary_public_id,
      width,
      height
    );
  }

  // Update user password (for password reset)
  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    user.password = hashedPassword;
    await this.userRepository.save(user);

    // Send password change notification
    try {
      await this.notificationsService.create({
        user_id: user.id,
        type: NotificationType.PASSWORD_CHANGED,
        title: 'تم تغيير كلمة المرور',
        message: 'تم تغيير كلمة المرور الخاصة بك بنجاح. إذا لم تقم بهذا الإجراء، يرجى التواصل مع الإدارة فوراً.',
      });
    } catch (error) {
      console.error('Failed to send password change notification:', error);
    }
  }
}

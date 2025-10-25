import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../modules/auth/auth.module';
import { UsersModule } from '../modules/users/users.module';
import { ActivityLogsModule } from '../modules/activity-logs/activity-logs.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';
import { ContactSubmissionsModule } from '../modules/contact-submissions/contact-submissions.module';
import { SiteSettingsModule } from '../modules/site-settings/site-settings.module';
import { PublicationFieldsModule } from '../modules/publication-fields/publication-fields.module';
import { ResearchModule } from '../modules/research/research.module';
import { ReviewerAssignmentsModule } from '../modules/reviewer-assignments/reviewer-assignments.module';
import { ReviewsModule } from '../modules/reviews/reviews.module';
import { ResearchRevisionsModule } from '../modules/research-revisions/research-revisions.module';
import { CloudinaryModule } from '../modules/cloudinary/cloudinary.module';
import { IssuesModule } from '../modules/issues/issues.module';
import { ArticlesModule } from '../modules/articles/articles.module';
import { QRCodeModule } from '../modules/qrcode/qrcode.module';
import { getDatabaseConfig } from '../config';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Database connection with configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,
    CloudinaryModule,
    QRCodeModule,
    UsersModule,
    ActivityLogsModule,
    NotificationsModule,
    ContactSubmissionsModule,
    SiteSettingsModule,
    PublicationFieldsModule,
    ResearchModule,
    ReviewerAssignmentsModule,
    ReviewsModule,
    ResearchRevisionsModule,
    IssuesModule,
    ArticlesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

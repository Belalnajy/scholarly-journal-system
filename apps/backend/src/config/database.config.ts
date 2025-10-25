import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DATABASE_HOST', 'localhost'),
  port: configService.get<number>('DATABASE_PORT', 5432),
  username: configService.get<string>('DATABASE_USER', 'postgres'),
  password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
  database: configService.get<string>('DATABASE_NAME', 'journal_db'),
  entities: [__dirname + '/../database/entities/**/*.entity{.ts,.js}'],
  synchronize: configService.get<boolean>('DATABASE_SYNC', true), // ⚠️ Set to false in production!
  logging: configService.get<boolean>('DATABASE_LOGGING', true),
  autoLoadEntities: true,
});

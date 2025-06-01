// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

import { SettingsModule } from './settings/settings.module';
import { AdminModule } from './admin/admin.module';
import { WorkerModule } from './worker/worker.module';
import { AuthModule } from './auth/auth.module';
import { CatamaransModule } from './catamarans/catamarans.module';
import { RentalsModule } from './rentals/rentals.module';
import { CommentsModule } from './comments/comments.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    // 1) Подключаем ConfigModule для доступа к переменным из .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 2) Конфигурация TypeORM через переменные окружения
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'mysql',
        host: cfg.get<string>('DB_HOST', 'localhost'),
        port: Number(cfg.get<string>('DB_PORT', '3306')),
        username: cfg.get<string>('DB_USERNAME', 'root'), // ключ: DB_USERNAME
        password: cfg.get<string>('DB_PASSWORD', ''), // ключ: DB_PASSWORD
        database: cfg.get<string>('DB_NAME', 'catamaran_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        dropSchema: false,
      }),
    }),

    // 3) Конфигурация почты через переменные окружения
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        transport: {
          host: cfg.get<string>('SMTP_HOST', 'smtp.mail.ru'),
          port: Number(cfg.get<string>('SMTP_PORT', '465')),
          secure: true,
          auth: {
            user: cfg.get<string>('SMTP_USER'),
            pass: cfg.get<string>('SMTP_PASS'),
          },
          tls: {
            rejectUnauthorized: false,
          },
          connectionTimeout: 10000,
          greetingTimeout: 5000,
        },
        defaults: {
          from: `"Catamaran Rental" <${cfg.get<string>('SMTP_USER')}>`,
        },
        template: {
          dir: join(__dirname, '..', 'email-templates'),
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
    }),

    SettingsModule,
    AdminModule,
    WorkerModule,
    AuthModule,
    CatamaransModule,
    RentalsModule,
    CommentsModule,
    ReportModule,
  ],
})
export class AppModule {}

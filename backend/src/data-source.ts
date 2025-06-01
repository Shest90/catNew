// backend/src/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

import { Admin } from './admin/entities/admin.entity';
import { Worker } from './worker/entities/worker.entity';
import { Catamaran } from './catamarans/catamaran.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root', // ← синхронизировано с .env
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'catamarans',
  entities: [Admin, Worker, Catamaran],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});

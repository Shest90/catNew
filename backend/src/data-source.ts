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
  port: +(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'FFb4Pes2',
  database: process.env.DB_NAME || 'catamaran_db',
  entities: [Admin, Worker, Catamaran],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // или true в dev, но не одновременно с миграциями
});

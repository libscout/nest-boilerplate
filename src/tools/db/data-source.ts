import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ConfigService } from '@src/tools/config';
import { config as loadDotenv } from 'dotenv';
import { type EnvSchema } from '@src/tools/config/config.schema';

const raw = loadDotenv().parsed ?? {};
const env = { ...raw, ...process.env } as unknown as EnvSchema;

const config = new ConfigService(env);

const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.expectEnv('DB_HOST'),
  port: config.expectEnv('DB_PORT'),
  username: config.expectEnv('DB_USER'),
  password: config.expectEnv('DB_PASSWORD'),
  database: config.expectEnv('DB_DATABASE'),
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/tools/db/migrations/*.ts'],
  synchronize: false,
});

export default AppDataSource;

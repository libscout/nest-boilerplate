import { Global, Module, type DynamicModule } from '@nestjs/common';
import { config as loadDotenv } from 'dotenv';
import { type EnvSchema, validateEnv } from './config.schema';
import { ConfigService } from './config.service';

@Global()
@Module({})
export class ConfigModule {
  static register(): DynamicModule {
    const raw = loadDotenv().parsed ?? {};
    const env = validateEnv({ ...raw, ...process.env });

    return {
      module: ConfigModule,
      global: true,
      providers: [
        { provide: ConfigService, useFactory: () => new ConfigService(env) },
      ],
      exports: [ConfigService],
    };
  }

  static with_config(env: EnvSchema): DynamicModule {
    return {
      module: ConfigModule,
      global: true,
      providers: [
        { provide: ConfigService, useFactory: () => new ConfigService(env) },
      ],
      exports: [ConfigService],
    };
  }
}

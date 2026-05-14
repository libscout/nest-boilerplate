import { Injectable } from '@nestjs/common';
import type { EnvSchema } from './config.schema';

@Injectable()
export class ConfigService {
  constructor(private readonly env: EnvSchema) {}

  getEnv<K extends keyof EnvSchema>(key: K): EnvSchema[K] {
    return this.env[key] as EnvSchema[K];
  }
}

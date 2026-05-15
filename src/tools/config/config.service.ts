import { Injectable } from '@nestjs/common';
import type { EnvSchema } from './config.schema';

@Injectable()
export class ConfigService {
  constructor(private readonly env: EnvSchema) {}

  getEnv<K extends keyof EnvSchema>(key: K): EnvSchema[K] {
    return this.env[key];
  }

  expectEnv<K extends keyof EnvSchema>(key: K): EnvSchema[K] {
    const out = this.env[key];

    if (out === undefined || out === null)
      throw new Error(`Environment variable "${key}" is undefined`);

    return out;
  }
}

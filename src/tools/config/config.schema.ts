import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Max, Min, validateSync } from 'class-validator';

export class EnvSchema {
  @IsNumber()
  @Min(1)
  @Max(65535)
  PORT: number;

  @IsEnum(['development', 'production', 'test'])
  NODE_ENV: 'development' | 'production' | 'test';

  @IsOptional()
  @IsString()
  IS_LOCAL_ENV?: string;

  @IsOptional()
  @IsString()
  DB_SCHEMA_SYNC?: string; // for tests only

  @IsString()
  DB_HOST: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  DB_PORT: number;

  @IsString()
  DB_USER: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_DATABASE: string;

  @IsString()
  REDIS_HOST: string;

  @IsNumber()
  @Min(1)
  @Max(65535)
  REDIS_PORT: number;
}

export function validateEnv(raw: Record<string, unknown>): EnvSchema {
  const validated = plainToInstance(EnvSchema, raw, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
    whitelist: true,
  });

  if (errors.length > 0) {
    const formatted = errors
      .map((err) => {
        const constraints = Object.values(err.constraints ?? {}).join(', ');
        return `  ${err.property}: ${constraints}`;
      })
      .join('\n');
    throw new Error(`Config validation failed:\n${formatted}`);
  }

  return validated;
}

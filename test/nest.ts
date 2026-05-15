import { type ModuleMetadata } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import {
  GenericContainer,
  type StartedTestContainer,
  Wait,
} from 'testcontainers';
import { ConfigModule } from '@src/tools/config';
import { DbModule } from '@src/tools/db';
import { RedisModule } from '@src/tools/redis';
import { LoggerModule } from '@src/tools/logger';
import { ContextModule } from '@src/tools/context';
import { EnvSchema } from '@src/tools/config/config.schema';
import { plainToInstance } from 'class-transformer';

export class TestEnv {
  nest!: TestingModule;
  containers: StartedTestContainer[] = [];

  async cleanup(): Promise<void> {
    await this.nest?.close().catch((err) => console.error(err));

    let error: unknown;
    for (const container of this.containers) {
      await container.stop().catch((err) => (error = err));
    }

    if (error) {
      throw error;
    }
  }

  static async create(opts: Partial<ModuleMetadata> = {}): Promise<TestEnv> {
    const config = TestEnv.testEnv();

    config.DB_SCHEMA_SYNC = 'true';
    const pgContainer = await TestEnv.spinupPostgres(config);
    const redisContainer = await TestEnv.spinupRedis(config);

    const { imports = [], providers = [], ...rest } = opts;

    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.with_config(config),
        DbModule.register(),
        RedisModule.register(),
        ContextModule,
        LoggerModule.register({ service: 'test' }),
        ...imports,
      ],
      providers: [...providers],
      ...rest,
    }).compile();

    const app = await module.init();

    const env = new TestEnv();
    env.nest = app;
    env.containers = [pgContainer, redisContainer];

    return env;
  }

  // ── container helpers ────────────────────────────────────────────

  static async spinupPostgres(env: EnvSchema): Promise<StartedTestContainer> {
    const container = await new GenericContainer('postgres:18.4-alpine')
      .withEnvironment({
        POSTGRES_USER: env.DB_USER,
        POSTGRES_PASSWORD: env.DB_PASSWORD,
        POSTGRES_DB: env.DB_DATABASE,
      })
      .withExposedPorts(5432)
      .withWaitStrategy(
        Wait.forLogMessage('database system is ready to accept connections'),
      )
      .start();

    env.DB_HOST = container.getHost();
    env.DB_PORT = container.getMappedPort(5432);

    return container;
  }

  static async spinupRedis(env: EnvSchema): Promise<StartedTestContainer> {
    const container = await new GenericContainer('redis:8.6.3-alpine')
      .withExposedPorts(6379)
      .withWaitStrategy(Wait.forLogMessage('Ready to accept connections'))
      .start();

    env.REDIS_HOST = container.getHost();
    env.REDIS_PORT = container.getMappedPort(6379);

    return container;
  }

  private static testEnv(): EnvSchema {
    return plainToInstance(EnvSchema, {
      DB_USER: 'test',
      DB_PASSWORD: 'test',
      DB_DATABASE: 'test',
      NODE_ENV: 'test',
      PORT: 3000,
    } as Partial<EnvSchema>);
  }
}

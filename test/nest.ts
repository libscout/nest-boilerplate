import { ModuleMetadata } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { AppConfigModule } from "@src/config/module";
import { GenericContainer, StartedTestContainer, Wait } from "testcontainers";
import { RedisModule } from "@src/redis/redis.module";

export class TestEnv {
  nest: TestingModule;
  containers: StartedTestContainer[];

  async cleanup() {
    this.nest?.close().catch((err) => console.error(err));

    let error;
    for (const container of this.containers) {
      container.stop().catch((err) => (error = err));
    }

    if (error) {
      throw error;
    }
  }

  static async create({
    imports = [],
    providers = [],
    ...opts
  }: Partial<ModuleMetadata> = {}): Promise<TestEnv> {
    const redisContainer = await TestEnv.spinupRedis();

    const app = await Test.createTestingModule({
      imports: [
        await ConfigModule.forRoot({ isGlobal: true }),
        { module: AppConfigModule, global: true },
        RedisModule.build(
          redisContainer.getHost(),
          redisContainer.getMappedPort(6379),
        ),
        ...imports,
      ],
      providers: [...providers],
      ...opts,
    }).compile();

    await app.init();

    const env: Partial<TestEnv> = { nest: app, containers: [redisContainer] };
    return Object.assign(new TestEnv(), env);
  }

  static spinupRedis(): Promise<StartedTestContainer> {
    return new GenericContainer("redis:7-alpine")
      .withExposedPorts(6379)
      .withWaitStrategy(Wait.forLogMessage("Ready to accept connections"))
      .start();
  }
}

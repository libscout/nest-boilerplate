import { Global, Module, type DynamicModule } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@src/tools/config';
import { RedisService } from './redis.service';

@Global()
@Module({})
export class RedisModule {
  static register(): DynamicModule {
    return {
      module: RedisModule,
      global: true,
      providers: [
        {
          provide: Redis,
          inject: [ConfigService],
          useFactory: (config: ConfigService): Redis => {
            return new Redis({
              host: config.getEnv('REDIS_HOST'),
              port: config.getEnv('REDIS_PORT'),
              lazyConnect: true,
            });
          },
        },
        RedisService,
      ],
      exports: [RedisService],
    };
  }
}

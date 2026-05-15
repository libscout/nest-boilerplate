import { Module } from '@nestjs/common';
import { ConfigModule } from '@src/tools/config';
import { ContextModule } from '@src/tools/context';
import { DbModule } from '@src/tools/db';
import { LoggerModule } from '@src/tools/logger';
import { RedisModule } from '@src/tools/redis';
import { UsersModule } from '@src/modules/users/users.module';
import { PostsModule } from '@src/modules/posts/posts.module';

@Module({
  imports: [
    ConfigModule.register(),
    DbModule.register(),
    RedisModule.register(),
    ContextModule,
    LoggerModule.register({ service: 'nest-boilerplate' }),
    UsersModule,
    PostsModule,
  ],
})
export class AppModule {}

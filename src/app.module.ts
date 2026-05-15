import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

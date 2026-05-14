import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@src/tools/config';
import { ContextModule } from '@src/tools/context';
import { DbModule } from '@src/tools/db';
import { RedisModule } from '@src/tools/redis';

@Module({
  imports: [
    ConfigModule.register(),
    DbModule.register(),
    RedisModule.register(),
    ContextModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

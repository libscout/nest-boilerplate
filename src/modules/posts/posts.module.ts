import { Module } from '@nestjs/common';
import { DbModule } from '@src/tools/db';
import { UsersModule } from '../users/users.module';
import { Post } from './entities';
import { PostService } from './services';
import { PostController } from './controllers/post.controller';

@Module({
  imports: [DbModule.forFeature([Post]), UsersModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostsModule {}

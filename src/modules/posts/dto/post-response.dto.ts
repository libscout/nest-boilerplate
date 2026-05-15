import { Expose, Type } from 'class-transformer';
import type { Post } from '../entities';
import { UserResponseDto } from '../../users/dto';

export class PostResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  isPublished: boolean;

  @Expose()
  authorId: string;

  @Expose()
  @Type(() => UserResponseDto)
  author?: UserResponseDto;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  static fromEntity(post: Post, includeAuthor = false): PostResponseDto {
    const dto: PostResponseDto = {
      id: post.id,
      title: post.title,
      content: post.content,
      isPublished: post.isPublished,
      authorId: post.authorId,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };

    if (includeAuthor && post.author) {
      dto.author = UserResponseDto.fromEntity(post.author);
    }

    return dto;
  }
}

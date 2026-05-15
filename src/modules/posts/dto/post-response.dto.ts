import type { Post } from '../entities';
import { UserResponseDto } from '../../users/dto';

export class PostResponseDto {
  id: string;
  title: string;
  content: string;
  isPublished: boolean;
  authorId: string;
  author?: UserResponseDto;
  createdAt: string;
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

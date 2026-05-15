import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities';
import { LoggerService } from '@src/tools/logger';
import { UserLookupService } from '../../users/services';
import {
  normalizePagination,
  paginate,
  type PaginatedResult,
} from '@src/lib/pagination';
import type { CreatePostDto } from '../dto';
import type { UpdatePostDto } from '../dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    private readonly userLookup: UserLookupService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Creates a new post for the given author.
   */
  async create(authorId: string, dto: CreatePostDto): Promise<Post> {
    // Ensure author exists
    await this.userLookup.byId(authorId);

    const post = this.postRepo.create({
      ...dto,
      authorId,
      isPublished: dto.isPublished ?? false,
    });

    const saved = await this.postRepo.save(post);

    this.logger.info('Post created', { postId: saved.id, authorId });

    return saved;
  }

  /**
   * Returns a single post by ID with optional author relation.
   */
  async byId(id: string, includeAuthor = false): Promise<Post> {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: includeAuthor ? ['author'] : [],
    });

    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }

    return post;
  }

  /**
   * Lists posts with pagination. Only published posts by default.
   */
  async list(
    page?: number | string,
    limit?: number | string,
    includeUnpublished = false,
  ): Promise<PaginatedResult<Post>> {
    const params = normalizePagination(page, limit);

    this.logger.debug('Listing posts', { ...params, includeUnpublished });

    const where: Record<string, unknown> = {};
    if (!includeUnpublished) {
      where['isPublished'] = true;
    }

    const [data, total] = await this.postRepo.findAndCount({
      where,
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });

    return paginate(data, total, params);
  }

  /**
   * Lists all posts for a specific author.
   */
  async listByAuthor(
    authorId: string,
    page?: number | string,
    limit?: number | string,
  ): Promise<PaginatedResult<Post>> {
    await this.userLookup.byId(authorId); // ensure author exists
    const params = normalizePagination(page, limit);

    const [data, total] = await this.postRepo.findAndCount({
      where: { authorId },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      order: { createdAt: 'DESC' },
    });

    return paginate(data, total, params);
  }

  /**
   * Updates a post. Only the author may update.
   */
  async update(
    id: string,
    authorId: string,
    dto: UpdatePostDto,
  ): Promise<Post> {
    const post = await this.byId(id);

    if (post.authorId !== authorId) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }

    await this.postRepo.update(id, dto);

    this.logger.info('Post updated', { postId: id });

    return this.byId(id, true);
  }

  /**
   * Deletes a post. Only the author may delete.
   */
  async delete(id: string, authorId: string): Promise<void> {
    const post = await this.byId(id);

    if (post.authorId !== authorId) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }

    await this.postRepo.delete(id);

    this.logger.info('Post deleted', { postId: id });
  }
}

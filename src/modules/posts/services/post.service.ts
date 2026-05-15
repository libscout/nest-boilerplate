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
  type PaginationDto,
} from '@src/lib/pagination';
import type { CreatePostDto, UpdatePostDto } from '../dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    private readonly userLookup: UserLookupService,
    private readonly logger: LoggerService,
  ) {}

  async create(authorId: string, dto: CreatePostDto): Promise<Post> {
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

  async list(
    query: PaginationDto,
    includeUnpublished = false,
  ): Promise<PaginatedResult<Post>> {
    const params = normalizePagination(query.page, query.limit);

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

  async listByAuthor(
    authorId: string,
    query: PaginationDto,
  ): Promise<PaginatedResult<Post>> {
    await this.userLookup.byId(authorId);
    const params = normalizePagination(query.page, query.limit);

    const [data, total] = await this.postRepo.findAndCount({
      where: { authorId },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      order: { createdAt: 'DESC' },
    });

    return paginate(data, total, params);
  }

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

  async delete(id: string, authorId: string): Promise<void> {
    const post = await this.byId(id);

    if (post.authorId !== authorId) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }

    await this.postRepo.delete(id);

    this.logger.info('Post deleted', { postId: id });
  }
}

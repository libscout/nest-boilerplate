import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PostService } from '../services';
import { CreatePostDto } from '../dto';
import { UpdatePostDto } from '../dto';
import { PostResponseDto } from '../dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // ── CRUD ────────────────────────────────────────────────────────

  @Post()
  async create(
    @Headers('x-user-id') authorId: string,
    @Body() dto: CreatePostDto,
  ): Promise<PostResponseDto> {
    const post = await this.postService.create(authorId, dto);
    return PostResponseDto.fromEntity(post, true);
  }

  @Get()
  async list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Headers('x-user-id') userId?: string,
  ): Promise<{ data: PostResponseDto[]; meta: unknown }> {
    const includeUnpublished = !!userId;
    const result = await this.postService.list(page, limit, includeUnpublished);
    return {
      data: result.data.map((p) => PostResponseDto.fromEntity(p, true)),
      meta: result.meta,
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<PostResponseDto> {
    const post = await this.postService.byId(id, true);
    return PostResponseDto.fromEntity(post, true);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Headers('x-user-id') authorId: string,
    @Body() dto: UpdatePostDto,
  ): Promise<PostResponseDto> {
    const post = await this.postService.update(id, authorId, dto);
    return PostResponseDto.fromEntity(post, true);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @Headers('x-user-id') authorId: string,
  ): Promise<void> {
    await this.postService.delete(id, authorId);
  }
}

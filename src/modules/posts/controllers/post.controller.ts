import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PostService } from '../services';
import { CreatePostDto, UpdatePostDto, PostResponseDto } from '../dto';
import { PaginationDto } from '@src/lib/pagination';
import { ContextService } from '@src/tools/context';

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly ctx: ContextService,
  ) {}

  @Post()
  async create(@Body() dto: CreatePostDto): Promise<PostResponseDto> {
    const post = await this.postService.create(this.ctx.userID(), dto);
    return PostResponseDto.fromEntity(post, true);
  }

  @Get()
  async list(
    @Query() query: PaginationDto,
  ): Promise<{ data: PostResponseDto[]; meta: unknown }> {
    const includeUnpublished = !!this.ctx.userID();
    const result = await this.postService.list(query, includeUnpublished);
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
    @Body() dto: UpdatePostDto,
  ): Promise<PostResponseDto> {
    const post = await this.postService.update(id, this.ctx.userID(), dto);
    return PostResponseDto.fromEntity(post, true);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.postService.delete(id, this.ctx.userID());
  }
}

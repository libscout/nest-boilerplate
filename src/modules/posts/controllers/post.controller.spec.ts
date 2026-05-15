import { Test, type TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PostController } from './post.controller';
import { PostService } from '../services';

describe('PostController', () => {
  let app: INestApplication;

  const mockPostService = {
    create: jest.fn(),
    byId: jest.fn(),
    list: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [{ provide: PostService, useValue: mockPostService }],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── POST /posts ──────────────────────────────────────────────────

  describe('POST /posts', () => {
    it('returns 201 with the created post', async () => {
      mockPostService.create.mockResolvedValue({
        id: 'post-1',
        title: 'Hello',
        content: 'World',
        isPublished: true,
        authorId: 'author-1',
        author: {
          id: 'author-1',
          email: 'a@a.com',
          name: 'Author',
          isEmailVerified: true,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
        },
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      });

      const res = await request(app.getHttpServer())
        .post('/posts')
        .set('x-user-id', 'author-1')
        .send({ title: 'Hello', content: 'World' })
        .expect(201);

      expect(res.body.id).toBe('post-1');
      expect(res.body.title).toBe('Hello');
      expect(res.body.author).toBeDefined();
    });
  });

  // ── GET /posts ───────────────────────────────────────────────────

  describe('GET /posts', () => {
    it('returns paginated posts', async () => {
      mockPostService.list.mockResolvedValue({
        data: [
          {
            id: 'post-1',
            title: 'First',
            content: '...',
            isPublished: true,
            authorId: 'author-1',
            author: {
              id: 'author-1',
              email: 'a@a.com',
              name: 'Author',
              isEmailVerified: true,
              createdAt: new Date('2025-01-01'),
              updatedAt: new Date('2025-01-01'),
            },
            createdAt: new Date('2025-01-01'),
            updatedAt: new Date('2025-01-01'),
          },
        ],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
      });

      const res = await request(app.getHttpServer())
        .get('/posts')
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].author).toBeDefined();
    });
  });

  // ── GET /posts/:id ───────────────────────────────────────────────

  describe('GET /posts/:id', () => {
    it('returns a post by id', async () => {
      mockPostService.byId.mockResolvedValue({
        id: 'post-1',
        title: 'Single',
        content: '...',
        isPublished: true,
        authorId: 'author-1',
        author: {
          id: 'author-1',
          email: 'a@a.com',
          name: 'Author',
          isEmailVerified: true,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
        },
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      });

      const res = await request(app.getHttpServer())
        .get('/posts/post-1')
        .expect(200);

      expect(res.body.id).toBe('post-1');
      expect(res.body.title).toBe('Single');
    });
  });

  // ── PATCH /posts/:id ─────────────────────────────────────────────

  describe('PATCH /posts/:id', () => {
    it('updates a post', async () => {
      mockPostService.update.mockResolvedValue({
        id: 'post-1',
        title: 'Updated',
        content: '...',
        isPublished: true,
        authorId: 'author-1',
        author: {
          id: 'author-1',
          email: 'a@a.com',
          name: 'Author',
          isEmailVerified: true,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
        },
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      });

      const res = await request(app.getHttpServer())
        .patch('/posts/post-1')
        .set('x-user-id', 'author-1')
        .send({ title: 'Updated' })
        .expect(200);

      expect(res.body.title).toBe('Updated');
    });
  });

  // ── DELETE /posts/:id ────────────────────────────────────────────

  describe('DELETE /posts/:id', () => {
    it('returns 204 on successful delete', async () => {
      mockPostService.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/posts/post-1')
        .set('x-user-id', 'author-1')
        .expect(204);
    });
  });
});

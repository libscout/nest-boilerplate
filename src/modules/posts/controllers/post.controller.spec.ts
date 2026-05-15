import { Test, type TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PostController } from './post.controller';
import { PostService } from '../services';
import { ContextService } from '@src/tools/context';

describe('PostController', () => {
  let app: INestApplication;

  const mockContext = {
    userID: jest.fn().mockReturnValue('author-1'),
    requestID: jest.fn().mockReturnValue('req-1'),
  };

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
      providers: [
        { provide: PostService, useValue: mockPostService },
        { provide: ContextService, useValue: mockContext },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockContext.userID.mockReturnValue('author-1');
  });

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
        .send({ title: 'Hello', content: 'World' })
        .expect(201);

      expect(res.body.id).toBe('post-1');
      expect(res.body.title).toBe('Hello');
      expect(res.body.author).toBeDefined();
      expect(mockPostService.create).toHaveBeenCalledWith('author-1', expect.any(Object));
    });
  });

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
        meta: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      const res = await request(app.getHttpServer()).get('/posts').expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].author).toBeDefined();
    });

    it('includes unpublished when user is present', async () => {
      mockPostService.list.mockResolvedValue({
        data: [],
        meta: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      await request(app.getHttpServer()).get('/posts').expect(200);

      expect(mockPostService.list).toHaveBeenCalledWith(
        expect.any(Object),
        true, // includeUnpublished because userID is set
      );
    });

    it('transforms string query params to numbers', async () => {
      mockPostService.list.mockResolvedValue({
        data: [],
        meta: {
          page: 3,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      });

      await request(app.getHttpServer()).get('/posts?page=3&limit=10').expect(200);

      const calledWith = mockPostService.list.mock.calls[0][0];
      expect(typeof calledWith.page).toBe('number');
      expect(typeof calledWith.limit).toBe('number');
    });

    it('returns 400 for invalid page', async () => {
      await request(app.getHttpServer()).get('/posts?page=abc').expect(400);
    });

    it('returns 400 for limit over 100', async () => {
      await request(app.getHttpServer()).get('/posts?limit=200').expect(400);
    });
  });

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

      const res = await request(app.getHttpServer()).get('/posts/post-1').expect(200);

      expect(res.body.id).toBe('post-1');
      expect(res.body.title).toBe('Single');
    });
  });

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
        .send({ title: 'Updated' })
        .expect(200);

      expect(res.body.title).toBe('Updated');
      expect(mockPostService.update).toHaveBeenCalledWith('post-1', 'author-1', expect.any(Object));
    });
  });

  describe('DELETE /posts/:id', () => {
    it('returns 204 on successful delete', async () => {
      mockPostService.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer()).delete('/posts/post-1').expect(204);

      expect(mockPostService.delete).toHaveBeenCalledWith('post-1', 'author-1');
    });
  });
});

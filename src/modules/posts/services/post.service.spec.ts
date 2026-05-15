import { TestEnv } from '@test/nest';
import { PostsModule } from '../posts.module';
import { PostService } from './post.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Post } from '../entities';
import { User } from '../../users/entities';
import type { Repository } from 'typeorm';

describe('PostService', () => {
  let env: TestEnv;
  let service: PostService;
  let postRepo: Repository<Post>;
  let userRepo: Repository<User>;

  let author: User;

  beforeAll(async () => {
    env = await TestEnv.create({ imports: [PostsModule] });
    service = env.nest.get(PostService);
    postRepo = env.nest.get(getRepositoryToken(Post));
    userRepo = env.nest.get(getRepositoryToken(User));
  });

  afterAll(async () => {
    await env.cleanup();
  });

  beforeEach(async () => {
    await postRepo.delete({});
    await userRepo.delete({});

    author = await userRepo.save(
      userRepo.create({
        email: 'author@example.com',
        name: 'Author',
        passwordHash: 'hash',
      }),
    );
  });

  describe('create', () => {
    it('creates a new post', async () => {
      const post = await service.create(author.id, {
        title: 'Test Post',
        content: 'Hello world',
        isPublished: true,
      });

      expect(post.id).toBeDefined();
      expect(post.title).toBe('Test Post');
      expect(post.authorId).toBe(author.id);
    });

    it('throws when author does not exist', async () => {
      await expect(
        service.create('00000000-0000-0000-0000-000000000000', {
          title: 'Nope',
          content: '...',
        }),
      ).rejects.toThrow();
    });
  });

  describe('byId', () => {
    it('returns a post by id', async () => {
      const created = await service.create(author.id, {
        title: 'Find me',
        content: 'Content',
      });

      const found = await service.byId(created.id);
      expect(found.title).toBe('Find me');
    });

    it('includes author when requested', async () => {
      const created = await service.create(author.id, {
        title: 'With author',
        content: '...',
      });

      const found = await service.byId(created.id, true);
      expect(found.author).toBeDefined();
      expect(found.author.email).toBe('author@example.com');
    });

    it('throws for unknown post', async () => {
      await expect(
        service.byId('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow();
    });
  });

  describe('list', () => {
    it('returns paginated published posts', async () => {
      await service.create(author.id, {
        title: 'Published',
        content: 'A',
        isPublished: true,
      });
      await service.create(author.id, {
        title: 'Draft',
        content: 'B',
        isPublished: false,
      });

      const result = await service.list({ page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Published');
    });
  });

  describe('delete', () => {
    it('deletes a post by its author', async () => {
      const post = await service.create(author.id, {
        title: 'Delete me',
        content: '...',
      });

      await service.delete(post.id, author.id);

      await expect(service.byId(post.id)).rejects.toThrow();
    });

    it('throws when non-author tries to delete', async () => {
      const post = await service.create(author.id, {
        title: 'Protected',
        content: '...',
      });

      await expect(
        service.delete(post.id, '00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow();
    });
  });
});

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities';
import { LoggerService } from '@src/tools/logger';
import {
  normalizePagination,
  paginate,
  type PaginatedResult,
  type PaginationDto,
} from '@src/lib/pagination';

@Injectable()
export class UserLookupService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly logger: LoggerService,
  ) {}

  async byId(id: string): Promise<User> {
    this.logger.debug('Looking up user by ID', { id });

    const user = await this.userRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    return user;
  }

  async byEmail(email: string): Promise<User | null> {
    this.logger.debug('Looking up user by email', { email });
    return this.userRepo.findOneBy({ email });
  }

  async list(query: PaginationDto): Promise<PaginatedResult<User>> {
    const params = normalizePagination(query.page, query.limit);

    this.logger.debug('Listing users', params);

    const [data, total] = await this.userRepo.findAndCount({
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      order: { createdAt: 'DESC' },
    });

    return paginate(data, total, params);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userRepo.count({ where: { email } });
    return count > 0;
  }
}

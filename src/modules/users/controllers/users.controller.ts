import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  UserLookupService,
  UserRegistrationService,
  UserPasswordResetService,
} from '../services';
import {
  UserResponseDto,
  CreateUserDto,
  RequestPasswordResetDto,
  ConfirmPasswordResetDto,
} from '../dto';
import { PaginationDto } from '@src/lib/pagination';
import { ContextService } from '@src/tools/context';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userLookup: UserLookupService,
    private readonly userRegistration: UserRegistrationService,
    private readonly passwordReset: UserPasswordResetService,
    private readonly ctx: ContextService,
  ) {}

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userRegistration.register(dto);
    return UserResponseDto.fromEntity(user);
  }

  @Post(':id/verify-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  async verifyEmail(@Param('id') id: string): Promise<void> {
    await this.userRegistration.verifyEmail(id);
  }

  @Get()
  async list(
    @Query() query: PaginationDto,
  ): Promise<{ data: UserResponseDto[]; meta: unknown }> {
    const result = await this.userLookup.list(query);
    return {
      data: result.data.map(UserResponseDto.fromEntity),
      meta: result.meta,
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userLookup.byId(id);
    return UserResponseDto.fromEntity(user);
  }

  @Post('password-reset/request')
  @HttpCode(HttpStatus.ACCEPTED)
  async requestPasswordReset(
    @Body() dto: RequestPasswordResetDto,
  ): Promise<{ message: string }> {
    await this.passwordReset.requestReset(dto.email);
    return {
      message:
        'If an account with that email exists, a reset link has been sent.',
    };
  }

  @Post('password-reset/confirm')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmPasswordReset(
    @Body() dto: ConfirmPasswordResetDto,
  ): Promise<void> {
    await this.passwordReset.confirmReset(dto.token, dto.newPassword);
  }
}

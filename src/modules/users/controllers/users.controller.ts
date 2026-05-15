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
import { UserLookupService } from '../services';
import { UserRegistrationService } from '../services';
import { UserPasswordResetService } from '../services';
import {
  UserResponseDto,
  CreateUserDto,
  RequestPasswordResetDto,
  ConfirmPasswordResetDto,
} from '../dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userLookup: UserLookupService,
    private readonly userRegistration: UserRegistrationService,
    private readonly passwordReset: UserPasswordResetService,
  ) {}

  // ── Registration ─────────────────────────────────────────────────

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

  // ── Lookup ───────────────────────────────────────────────────────

  @Get()
  async list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: UserResponseDto[]; meta: unknown }> {
    const result = await this.userLookup.list(page, limit);
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

  // ── Password Reset ───────────────────────────────────────────────

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

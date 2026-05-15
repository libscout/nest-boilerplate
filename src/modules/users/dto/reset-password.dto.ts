import { IsString, MinLength, MaxLength } from 'class-validator';

export class RequestPasswordResetDto {
  @IsString()
  email: string;
}

export class ConfirmPasswordResetDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword: string;
}

import { IsString, IsEmail, MinLength } from 'class-validator';

export class RegisterAdminDto {
  @IsString()
  readonly username: string;

  @IsEmail()
  readonly email: string; // ← добавлено

  @IsString()
  @MinLength(6)
  readonly password: string;
}

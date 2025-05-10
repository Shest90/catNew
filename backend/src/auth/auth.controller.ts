// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RegisterAdminDto } from 'src/admin/dto/create-admin.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Регистрация администратора
  @Post('admin/register')
  async registerAdmin(@Body() dto: RegisterAdminDto) {
    return this.authService.registerAdmin(dto);
  }

  // Единый endpoint авторизации для администратора и рабочего
  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    return await this.authService.login(body.username, body.password);
  }
  // Эндпоинт для создания рабочего (доступен только для авторизованных администраторов)
  @UseGuards(JwtAuthGuard)
  @Post('worker/create')
  async createWorker(
    @Body() body: { username: string; password: string },
    @Req() req: Request,
  ) {
    // Предполагается, что JwtAuthGuard добавляет информацию о пользователе (администраторе) в req.user
    const adminId = (req as any).user?.id;
    return await this.authService.createWorker(
      adminId,
      body.username,
      body.password,
    );
  }
}

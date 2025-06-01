import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // опционально: удаляем лишние поля
      transform: true, // очень важно — без этого @Transform не сработает
    }),
  );
  app.enableCors(); // Разрешает запросы с любого источника
  await app.listen(3001, '0.0.0.0');
}
bootstrap();

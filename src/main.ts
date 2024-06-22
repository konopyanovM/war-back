import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      // So that it is impossible to pass fields that are not in the DTO
      whitelist: true,
    }),
  );
  await app.listen(3000);
}
bootstrap();

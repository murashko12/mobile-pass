import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS для фронтенда и мобильного приложения
  app.enableCors({
    origin: [
      'http://localhost:5173', 
      'http://localhost:3000',
      'http://localhost:8081', // Expo dev server
      'exp://localhost:8081'   // Expo
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  });

  // Глобальная валидация
  app.useGlobalPipes(new ValidationPipe());

  // Swagger документация
  const config = new DocumentBuilder()
    .setTitle('Mobile Pass API')
    .setDescription('API для системы мобильных пропусков')
    .setVersion('1.0')
    .addTag('employees')
    .addTag('scans')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3001);
  console.log('🚀 Сервер запущен на http://localhost:3001');
  console.log('📚 Swagger документация: http://localhost:3001/api');
}

bootstrap();
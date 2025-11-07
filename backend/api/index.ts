import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';

let cachedApp: INestApplication;

async function bootstrap() {
  if (!cachedApp) {
    cachedApp = await NestFactory.create(AppModule);

    cachedApp.enableCors({
      origin: true,
      credentials: true,
    });

    await cachedApp.init();
  }
  return cachedApp;
}

export default async (req: any, res: any) => {
  const app = await bootstrap();
  const expressApp = app.getHttpAdapter().getInstance();

  // Use the Express app to handle the request
  return expressApp(req, res);
};

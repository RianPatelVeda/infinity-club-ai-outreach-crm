import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';

let app: INestApplication;

async function getApp(): Promise<INestApplication> {
  if (!app) {
    app = await NestFactory.create(AppModule);

    // Enable CORS for all origins in production (you can restrict this later)
    app.enableCors({
      origin: true,
      credentials: true,
    });

    await app.init();
  }

  return app;
}

export default async (req: any, res: any) => {
  const application = await getApp();
  const expressApp = application.getHttpAdapter().getInstance();
  return expressApp(req, res);
};

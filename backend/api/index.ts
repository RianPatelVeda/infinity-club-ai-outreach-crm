import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();
let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule, new ExpressAdapter(server));

    // Enable CORS
    app.enableCors({
      origin: true,
      credentials: true,
    });

    await app.init();
  }
  return app;
}

export default async (req: any, res: any) => {
  await bootstrap();
  server(req, res);
};

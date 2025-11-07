import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import type { NestExpressApplication } from '@nestjs/platform-express';

let app: NestExpressApplication;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.enableCors({
      origin: true,
      credentials: true,
    });

    await app.init();
  }
  return app;
}

module.exports = async (req: any, res: any) => {
  const server = await bootstrap();
  const instance = server.getHttpAdapter().getInstance();

  return new Promise((resolve, reject) => {
    instance(req, res, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(undefined);
      }
    });
  });
};

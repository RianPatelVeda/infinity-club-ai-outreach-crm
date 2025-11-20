import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { AppModule } from "../src/app.module";
import express, { Express } from "express";

//new push

let cachedServer: Express;

async function bootstrap() {
  if (!cachedServer) {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);

    const app = await NestFactory.create(AppModule, adapter);

    app.enableCors({
      origin: true,
      credentials: true,
    });

    await app.init();

    cachedServer = expressApp;
  }

  return cachedServer;
}

module.exports = async (req: any, res: any) => {
  const server = await bootstrap();
  server(req, res);
};

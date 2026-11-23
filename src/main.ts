import { join } from "node:path";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { PostgresExceptionFilter } from "@shared/infra/database/postgres-exception.filter";
import { runMigrations } from "@shared/infra/database/run-migrations";
import { AppModule } from "./app.module";

async function bootstrap() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET não definido.");
  }

  if (process.env.RUN_MIGRATIONS === "true") {
    await runMigrations();
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Fotos do imóvel vão no JSON (limite igual ao do Nginx)
  app.useBodyParser("json", { limit: "20mb" });

  // Atrás do Nginx: o IP do cliente vem no X-Forwarded-For
  app.set("trust proxy", 1);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useStaticAssets(join(process.cwd(), "uploads"), {
    prefix: "/uploads/",
  });

  app.useGlobalFilters(new PostgresExceptionFilter(app.getHttpAdapter()));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Urbizzi API")
    .setDescription("Documentação dos endpoints do urbizzi API.")
    .setVersion("1.0.0")
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup("docs", app, swaggerDocument);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();

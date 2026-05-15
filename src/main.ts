import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@src/tools/config';
import { LoggerService } from '@src/tools/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(LoggerService);
  app.useLogger(logger);
  app.flushLogs();

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      strategy: 'excludeAll',
      exposeUnsetFields: false,
      enableImplicitConversion: false,
    }),
  );

  const config = app.get(ConfigService);
  await app.listen(config.getEnv('PORT'));

  logger.info(`Server listening on port ${config.getEnv('PORT')}`);
}
bootstrap();

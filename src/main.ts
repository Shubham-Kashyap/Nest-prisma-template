import 'tsconfig-paths/register';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import classValidatorConfiguration from './config/class-validator';
import swaggerConfiguration from './config/swagger';
import versioningConfiguration from './config/versioning';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { LoggingInterceptor } from './interceptor/logging.interceptor';
import { ResponseInterceptor } from './interceptor/response.interceptor';

import { logger } from './config/logger';

/**
 * Bootstrap Application
 */
async function bootstrap() {
    const app = await NestFactory.create(AppModule, { logger });
    const configService = app.get(ConfigService);

    /** Global request route prefix  */
    app.setGlobalPrefix('api');

    /** Enable Versioning */
    versioningConfiguration(app);

    /** Response interceptor */
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());

    /** Swagger config */
    swaggerConfiguration(app);

    /** Enable Loggging */
    if (configService.get('incomingRequestsLogging') === '1') {
        app.useGlobalInterceptors(new LoggingInterceptor());
    }

    /** Enable Validation Pipe */
    classValidatorConfiguration(app);

    /** Enable CORS */
    app.enableCors();

    const port = configService.get<number>('port') || 5000;
    await app.listen(port);
    Logger.log(`Application is running on: ${await app.getUrl()}`, 'Bootstrap');
}
bootstrap();

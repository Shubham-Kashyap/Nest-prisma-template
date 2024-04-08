import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import classValidatorConfiguration from './config/class-validator';
import swaggerConfiguration from './config/swagger';
import { LoggingInterceptor } from './interceptor/logging.interceptor';
import { ResponseInterceptor } from './interceptor/response.interceptor';

/**
 * Bootstrap Application
 */
async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    /** Global request route prefix  */
    app.setGlobalPrefix('api/v1/');

    /** Response interceptor */
    app.useGlobalInterceptors(new ResponseInterceptor());

    /** Swagger config */
    swaggerConfiguration(app);

    /** logging request data { for debugging purpose } */
    Boolean(Number(process.env.INCOMMING_REQUESTS_LOGGING)) &&
        app.useGlobalInterceptors(new LoggingInterceptor()); /** Logger for handeling requests  */

    /** Class validator configuration */
    classValidatorConfiguration(app);

    /** Enable CORS */
    app.enableCors();

    /** add filter */
    await app.listen(process.env.PORT);
    Logger.debug(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

import swagger from '@constants/swagger';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';

import { AppModule } from './app.module';
import { LoggingInterceptor } from './interceptor/logging.interceptor';
import { ResponseInterceptor } from './interceptor/response.interceptor';

/**
 * Swagger Configuration
 * @param app
 */
const swaggerConfiguration = (app) => {
    const config = new DocumentBuilder()
        .setTitle(swagger.title)
        .setDescription(swagger.description)
        .setVersion(swagger.version)
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
};

/**
 * Class-validator Configuration
 * @param app
 */
const classValidatorConfiguration = (app) => {
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            disableErrorMessages: true,
            stopAtFirstError: true,
            exceptionFactory: (errors) => {
                const errorDetails = errors.reduce((acc, error) => {
                    return {
                        ...acc,
                        cause: error.value,
                        property: error.property,
                        message: error.constraints[Object.keys(error.constraints)[0]],
                        description: '',
                        error
                    };
                }, {});
                return new BadRequestException({ message: errorDetails['message'], ...errorDetails });
            }
        })
    );
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
};

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

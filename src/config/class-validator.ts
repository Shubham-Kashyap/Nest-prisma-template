import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { AppModule } from 'src/app.module';

/**
 * Class-validator Configuration
 * @param app
 */
export default (app: INestApplication<any>) => {
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            disableErrorMessages: true,
            stopAtFirstError: true,
            exceptionFactory: (errors) => {
                const errorDetails = errors.reduce(
                    (acc, error) => ({
                        ...acc,
                        cause: error.value,
                        property: error.property,
                        message: error.constraints[Object.keys(error.constraints)[0]],
                        description: '',
                        error
                    }),
                    {}
                );
                return new BadRequestException({ message: errorDetails['message'], ...errorDetails });
            }
        })
    );
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
};

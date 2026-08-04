import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { AppModule } from '../app.module';

/**
 * Class-validator Configuration
 * @param app
 */
export default (app: INestApplication) => {
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            disableErrorMessages: true,
            stopAtFirstError: true,
            exceptionFactory: (errors) => {
                const error = errors[0];
                const constraints = error.constraints || {};
                const firstConstraintKey = Object.keys(constraints)[0];
                const message = firstConstraintKey ? constraints[firstConstraintKey] : 'Validation failed';

                const errorDetails = {
                    cause: error.value,
                    property: error.property,
                    message: message,
                    description: '',
                    error
                };
                return new BadRequestException(errorDetails);
            }
        })
    );
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
};

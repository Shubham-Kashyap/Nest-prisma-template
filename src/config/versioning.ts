import { INestApplication, VersioningType } from '@nestjs/common';

/**
 * API Versioning Configuration
 * @param app
 */
export default (app: INestApplication) => {
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
        prefix: 'v'
    });
};

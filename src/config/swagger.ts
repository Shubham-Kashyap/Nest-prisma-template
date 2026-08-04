import AdminModule from '@modules/admin/admin.module';
import SystemModule from '@modules/system/system.module';
import WebModule from '@modules/web/web.module';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const DOC_CONFIG = {
    web: {
        title: "Nest with MongoDB { Web Api's }",
        description: 'Learning nest with mongodb',
        version: '1.0',
        endpoint: 'api/doc/web',
        tag: 'Api`s listing',
        include: [WebModule]
    },
    admin: {
        title: "Nest with MongoDB { Admin Api's }",
        description: 'Learning nest with mongodb',
        version: '1.0',
        endpoint: 'api/doc/admin',
        tag: 'Api`s listing',
        include: [AdminModule]
    },
    system: {
        title: 'System API',
        description: 'System API',
        version: '1.0',
        endpoint: 'api/doc/system',
        tag: 'Api`s listing',
        include: [SystemModule]
    }
};

/**
 * Swagger Configuration
 * @param app
 */
export default (app: INestApplication) => {
    Object.values(DOC_CONFIG).forEach((swaggerConfig) => {
        const options = new DocumentBuilder()
            .setTitle(swaggerConfig.title)
            .setDescription(swaggerConfig.description)
            .setVersion(swaggerConfig.version)
            .addBearerAuth()
            .build();
        const document = SwaggerModule.createDocument(app, options, {
            // ignoreGlobalPrefix: true,
            include: swaggerConfig.include,
            deepScanRoutes: true
        });
        SwaggerModule.setup(swaggerConfig.endpoint, app, document);
    });
};

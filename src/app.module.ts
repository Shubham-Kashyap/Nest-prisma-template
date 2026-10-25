import AdminModule from '@modules/admin/admin.module';
import SystemModule from '@modules/system/system.module';
import WebModule from '@modules/web/web.module';
import { ApplicationCacheModule } from '@modules/shared/module/application-cache.module';
import { ApplicationDatabaseModule } from '@modules/shared/module/application-database.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/dot-env';
import QueueModule from '@modules/queue/queue.module';


const CORE_MODULES = [
    WebModule, // WebModule is the main entry point for all web-related features, including controllers and services.
    AdminModule, // AdminModule is the main entry point for all admin-related features, including controllers and services.
    SystemModule, // SystemModule is the main entry point for all system-related features, including controllers and services.
    QueueModule, // QueueModule is the main entry point for all queue-related features, including controllers and services.
]

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration]
        }),
        /**
         * cache and database modules are imported here to ensure that they are available throughout the application, 
         *  providing caching and database functionalities to all other modules.
         */
        ApplicationCacheModule,
        ApplicationDatabaseModule,

        // Core Modules
        ...CORE_MODULES
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}

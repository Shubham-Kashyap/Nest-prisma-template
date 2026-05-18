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

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration]
        }),
        ApplicationCacheModule,
        ApplicationDatabaseModule,
        WebModule,
        AdminModule,
        SystemModule
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}

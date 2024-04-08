import AdminModule from '@modules/admin/admin.module';
import WebModule from '@modules/web/web.module';
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
        WebModule,
        AdminModule
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}

import AuthModule from '@module/auth/auth.module';
import CartModule from '@module/cart/cart.module';
import OrderModule from '@module/order/order.module';
import { ProductsModule } from '@module/products/products.module';
import SpecificationsModule from '@module/specifications/specifications.module';
import UserModule from '@module/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration]
        }),
        AuthModule,
        UserModule,
        SpecificationsModule,
        ProductsModule,
        CartModule,
        OrderModule
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}

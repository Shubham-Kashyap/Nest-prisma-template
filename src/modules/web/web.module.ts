import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import AuthModule from './auth/auth.module';
import CartModule from './cart/cart.module';
import OrderModule from './order/order.module';
import { ProductsModule } from './products/products.module';
import SpecificationsModule from './specifications/specifications.module';
import UserModule from './user/user.module';

/**
 * import modules here in web modules :
 * The Router module does'nt  work on submodules [https://github.com/nestjs/nest/issues/8364]
 * */
const webModules = [AuthModule, UserModule, SpecificationsModule, ProductsModule, CartModule, OrderModule];
@Module({
    controllers: [],
    providers: [],
    imports: [
        ...webModules,
        RouterModule.register([
            {
                path: '/web',
                module: WebModule,
                children: webModules.map((module) => ({ path: '/', module }))
            }
        ])
    ]
})
export default class WebModule {}

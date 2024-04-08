import { ProductsModule } from '@modules/admin/products/products.module';
import UserModule from '@modules/admin/user/user.module';
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import AuthModule from './auth/auth.module';

/**
 * import modules here in adminModules :
 * The Router module does'nt  work on submodules [https://github.com/nestjs/nest/issues/8364]
 * */
const adminModules = [AuthModule, UserModule, ProductsModule];
@Module({
    controllers: [],
    providers: [],
    imports: [
        ...adminModules,
        RouterModule.register([
            {
                path: '/admin',
                module: AdminModule,
                children: adminModules.map((module) => ({ path: '/', module }))
            }
        ])
    ]
})
export default class AdminModule {}

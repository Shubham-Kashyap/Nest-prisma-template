import AuthModule from '@module/auth/auth.module';
import { Module } from '@nestjs/common';

import { ProductController } from './products.controller';
import { ProductService } from './products.service';

@Module({
    controllers: [ProductController],
    providers: [ProductService],
    imports: [AuthModule]
})
export class ProductsModule {}

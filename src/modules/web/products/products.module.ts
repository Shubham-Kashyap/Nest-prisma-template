import JwtAuthModule from '@modules/shared/module/jwt-auth.module';
import { Module } from '@nestjs/common';

import { ProductService } from '../../shared/service/products.service';
import { ProductController } from './products.controller';

@Module({
    controllers: [ProductController],
    providers: [ProductService],
    imports: [JwtAuthModule]
})
export class ProductsModule {}

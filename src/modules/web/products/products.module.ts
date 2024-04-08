import JwtAuthModule from '@modules/shared/module/jwt-auth.module';
import { Module } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';

import { ProductService } from '../../shared/service/products.service';
import { ProductController } from './products.controller';

@Module({
    controllers: [ProductController],
    providers: [ProductService, PrismaService],
    imports: [JwtAuthModule]
})
export class ProductsModule {}

import JwtAuthModule from '@modules/shared/module/jwt-auth.module';
import { Module } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';

import CartController from './cart.controller';
import CartService from './cart.service';

@Module({
    controllers: [CartController],
    providers: [CartService, PrismaService],
    imports: [JwtAuthModule]
})
export default class CartModule {}

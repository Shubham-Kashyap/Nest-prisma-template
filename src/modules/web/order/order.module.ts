import JwtAuthModule from '@modules/shared/module/jwt-auth.module';
import { Module } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';

import OrderController from './order.controller';
import OrderService from './order.service';

@Module({
    controllers: [OrderController],
    providers: [OrderService, PrismaService],
    imports: [JwtAuthModule]
})
export default class OrderModule {}

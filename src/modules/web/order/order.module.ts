import JwtAuthModule from '@modules/shared/module/jwt-auth.module';
import { Module } from '@nestjs/common';

import OrderController from './order.controller';
import OrderService from './order.service';

@Module({
    controllers: [OrderController],
    providers: [OrderService],
    imports: [JwtAuthModule]
})
export default class OrderModule {}

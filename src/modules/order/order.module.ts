import { Module } from '@nestjs/common';
import OrderController from './order.controller';
import OrderService from './order.service';
import AuthModule from '@module/auth/auth.module';

@Module({
    controllers: [OrderController],
    providers: [OrderService],
    imports: [AuthModule]
})
export default class OrderModule {}

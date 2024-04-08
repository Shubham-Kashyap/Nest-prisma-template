import { Module } from '@nestjs/common';
import CartController from './cart.controller';
import CartService from './cart.service';
import AuthModule from '@module/auth/auth.module';

@Module({
    controllers: [CartController],
    providers: [CartService],
    imports: [AuthModule]
})
export default class CartModule {}

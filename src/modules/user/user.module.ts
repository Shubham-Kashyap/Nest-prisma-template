import { Module } from '@nestjs/common';
import UserController from './user.controller';
import UserService from './user.service';
import { PrismaService } from '@services/prisma.service';
import { JwtTokenService } from '@services/jwt-token.service';

@Module({
    controllers: [UserController],
    exports: [],
    imports: [],
    providers: [UserService, PrismaService, JwtTokenService]
})
export default class UserModule {}

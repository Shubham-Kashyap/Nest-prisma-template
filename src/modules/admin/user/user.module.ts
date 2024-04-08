import JwtAuthModule from '@modules/shared/module/jwt-auth.module';
import UserService from '@modules/shared/service/user.service';
import { Module } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';

import UserController from './user.controller';

@Module({
    controllers: [UserController],
    exports: [],
    imports: [JwtAuthModule],
    providers: [UserService, PrismaService]
})
export default class UserModule {}

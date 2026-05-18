import JwtAuthModule from '@modules/shared/module/jwt-auth.module';
import UserService from '@modules/shared/service/user.service';
import { Module } from '@nestjs/common';

import UserController from './user.controller';
import AuthService from '@modules/shared/service/auth.service';

@Module({
    controllers: [UserController],
    exports: [],
    imports: [JwtAuthModule],
    providers: [UserService, AuthService]
})
export default class UserModule {}

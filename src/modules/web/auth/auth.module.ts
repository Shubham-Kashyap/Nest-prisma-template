import AuthController from '@modules/web/auth/auth.controller';
import JwtAuthModule from '@modules/shared/module/jwt-auth.module';
import AuthService from '@modules/shared/service/auth.service';
import { Module } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';

@Module({
    controllers: [AuthController],
    imports: [JwtAuthModule],
    providers: [AuthService, PrismaService]
})
export default class AuthModule {}

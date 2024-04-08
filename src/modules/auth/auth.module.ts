import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtTokenService } from '@services/jwt-token.service';
import { PrismaService } from '@services/prisma.service';
import { Algorithm } from 'jsonwebtoken';

import AuthController from './auth.controller';
import AuthService from './auth.service';

@Module({
    controllers: [AuthController],
    exports: [JwtTokenService, PrismaService],
    imports: [
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET,
            verifyOptions: {
                ignoreExpiration: false
            },
            signOptions: {
                expiresIn: process.env.JWT_VALIDITY,
                algorithm: process.env.JWT_ALGORITHM as Algorithm
            }
        })
    ],
    providers: [AuthService, PrismaService, JwtTokenService]
})
export default class AuthModule {}

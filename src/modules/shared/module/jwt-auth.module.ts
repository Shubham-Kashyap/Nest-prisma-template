import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtTokenService } from '@services/jwt-token.service';
import { Algorithm } from 'jsonwebtoken';

@Module({
    controllers: [],
    exports: [JwtTokenService],
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
    providers: [JwtTokenService, JwtService]
})
export default class JwtAuthModule {}

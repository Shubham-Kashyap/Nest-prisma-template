import { MESSAGES } from '@constants/messages';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtTokenService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService
    ) {}

    /**
     * Encrypt token
     * @param payload
     * @returns
     */
    encrypt(payload): string {
        return this.jwtService.sign(payload, { secret: this.configService.get('jwt').secret });
    }

    /**
     * Decrypt token
     * @param {string} token
     * @returns
     */
    decrypt(token: string): { userID: number; role: string; isEmailVerified: boolean; iat: number; exp: number } {
        try {
            if (!token) throw new UnauthorizedException({ message: MESSAGES.accessControl.exception.invalidToken });
            return this.jwtService.verify(token, { secret: this.configService.get('jwt').secret });
        } catch (error) {
            throw new UnauthorizedException({ message: MESSAGES.accessControl.exception.tokenExpired });
        }
    }

    /**
     * Decode token
     * @param token
     * @returns
     */
    decode(token: string) {
        return this.jwtService.decode(token, { json: true, complete: true });
    }
}

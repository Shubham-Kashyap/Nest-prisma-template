/* eslint-disable prettier/prettier */
import { MESSAGES } from '@constants/messages';
import AuthService from '@modules/shared/service/auth.service';
import { ForgotPasswordDto } from '@modules/admin/auth/dto/forgotPassword.dto';
import LoginDto from '@modules/admin/auth/dto/login.dto';
import { ResetPasswordDto } from '@modules/admin/auth/dto/resetPassword.dto';
import { SignupDto } from '@modules/admin/auth/dto/signup.dto';
import { Body, Controller, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtTokenService } from '@services/jwt-token.service';


@Controller('/auth')
@ApiTags('Auth')
export default class AuthController {
    constructor(
        private authService: AuthService,
        private jwtTokenService: JwtTokenService
    ) { }

    /** Signup  */
    /** TODO : add transction  */
    @Post('/signup')
    async signup(@Body() signupData: SignupDto): Promise<ResponsePayload<unknown>> {
        await this.authService.createUser(signupData);
        return {
            message: MESSAGES.signup.success,
            data: []
        };
    }

    /** Login */
    @Post('/login')
    async login(@Body() body: LoginDto): Promise<ResponsePayload<unknown>> {
        const user = await this.authService.verifyUserCredentials(body.email, body.password);
        return {
            message: MESSAGES.login.success,
            data: {
                ...user,
                accessToken: this.jwtTokenService.encrypt({
                    userId: user.id,
                    isEmailVerified: user.isEmailVerified,
                    role: user.role
                })
            }
        };
    }

    /** Forgot password  */
    @Post('forgot-password')
    async forgotPassword(@Body() body: ForgotPasswordDto): Promise<ResponsePayload<unknown>> {
        const { email } = body;
        return {
            message: MESSAGES.forgotPassword.success,
            data: {
                email
            }
        };
    }

    /** Reset password */
    @Post('reset-password')
    async resetPassword(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @Body() body: ResetPasswordDto,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @Query('token') token: string
    ): Promise<ResponsePayload<unknown>> {
        return {
            message: MESSAGES.resetPassword.success,
            data: []
        };
    }
}

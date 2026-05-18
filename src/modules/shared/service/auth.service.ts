import { MESSAGES } from '@constants/messages';
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';
import { comparePasswords, encryptPassword } from '@utilities/hash';
import { Role } from '@prisma/client';

@Injectable()
export default class AuthService {
    constructor(private readonly prismaService: PrismaService) {}

    async verifyUserCredentials(
        email: string,
        password: string
    ): Promise<{ id: string; isEmailVerified: boolean; role: Role }> {
        const user = await this.prismaService.user.findUnique({
            where: { email },
            select: {
                id: true,
                password: true,
                isEmailVerified: true,
                role: true
            }
        });

        if (!user) throw new NotFoundException({ message: MESSAGES.login.exception.invalidCredentials });
        if (!user.isEmailVerified) throw new ForbiddenException({ message: MESSAGES.login.exception.emailNotVerified });
        if (!user.password) throw new InternalServerErrorException({ message: MESSAGES.login.error.password.invalid });
        if (!comparePasswords(password, user.password))
            throw new ForbiddenException({ message: MESSAGES.login.exception.PasswordsNotMatch });

        return {
            id: user.id,
            isEmailVerified: user.isEmailVerified,
            role: user.role
        };
    }

    async createUser(data: CreateUserDto): Promise<{ id: string; email: string }> {
        const existingUser = await this.prismaService.user.findUnique({
            where: { email: data.email },
            select: { id: true }
        });

        if (existingUser) {
            throw new ForbiddenException({ message: MESSAGES.signup.exception.alreadyExists });
        }

        return this.prismaService.user.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: data.password
                    ? encryptPassword(data.password)
                    : (() => {
                          throw new BadRequestException(MESSAGES.signup.error.password.required);
                      })(),
                role: Role.user,
                isEmailVerified: true
            },
            select: {
                id: true,
                email: true
            }
        });
    }

    async forgotPassword(data: ForgotPasswordDto): Promise<{ email: string }> {
        const user = await this.prismaService.user.findUnique({
            where: { email: data.email },
            select: { id: true }
        });

        if (!user) {
            throw new NotFoundException({ message: MESSAGES.login.exception.invalidCredentials });
        }

        // Generate a random reset token (in production, use a secure crypto method or UUID)
        const resetToken = Math.random().toString(36).substring(2, 15);

        await this.prismaService.user.update({
            where: { email: data.email },
            data: { userToken: resetToken }
        });

        // TODO: Integrate with an Email Service to send the resetToken
        return { email: data.email };
    }

    async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
        const user = await this.prismaService.user.findFirst({
            where: { email: data.email },
            select: { id: true, userToken: true }
        });

        if (!user) {
            throw new NotFoundException({ message: MESSAGES.login.exception.invalidCredentials });
        }

        if (!data.password) {
            throw new BadRequestException(MESSAGES.signup.error.password.required);
        }

        await this.prismaService.user.update({
            where: { email: data.email },
            data: {
                password: encryptPassword(data.password),
                userToken: null // Clear the token after use
            }
        });

        return { message: 'Password reset successful' };
    }
}

import { MESSAGES } from '@constants/messages';
import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@services/prisma.service';
import { comparePasswords } from '@utilities/hash';

@Injectable()
export default class AuthService {
    constructor(private readonly prismaService: PrismaService) {}

    /**
     * Verify user credentials
     * @param {string} email
     * @param {string} password
     * @returns
     */
    async verifyUserCredentials(email: string, password: string) {
        const user = await this.prismaService.user.findFirst({
            where: { email },
            select: { id: true, password: true, isEmailVerified: true, role: true }
        });
        if (!user) throw new NotFoundException({ message: MESSAGES.login.exception.invalidCredentials });
        if (!user.isEmailVerified) throw new ForbiddenException({ message: MESSAGES.login.exception.emailNotVerified });
        if (!user.password) throw new InternalServerErrorException({ message: MESSAGES.login.error.password.invalid });
        if (!comparePasswords(password, user.password))
            throw new ForbiddenException({ message: MESSAGES.login.exception.PasswordsNotMatch });
        delete user.password; /** remove user password from response */
        return user;
    }

    /**
     * Create User
     * @param data
     * @returns
     */
    async createUser(data) {
        return data;
    }

    /**
     * forgotPassword
     * @param data
     * @returns
     */
    async forgotPassword(data) {
        return data;
    }

    /**
     *  Reset password
     * @param data
     * @returns
     */
    async resetPassword(data) {
        return data;
    }
}

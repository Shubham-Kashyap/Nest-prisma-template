interface User {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    password?: string;
    isEmailVerified: boolean;
    role: 'user' | 'admin';
    userToken?: string;
}

interface CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
}

interface ForgotPasswordDto {
    email: string;
}

interface ResetPasswordDto {
    email: string;
    password?: string;
}

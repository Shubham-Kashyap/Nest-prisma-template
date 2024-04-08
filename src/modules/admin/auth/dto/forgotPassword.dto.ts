import { API_PROPERTIES, DEFAULT_VALUES } from '@constants/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
    @ApiProperty({ description: API_PROPERTIES.forgotPassword.email, default: DEFAULT_VALUES.user.email })
    @IsEmail()
    email: string;
}

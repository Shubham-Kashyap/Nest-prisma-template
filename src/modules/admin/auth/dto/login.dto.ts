import { MESSAGES } from '@constants/messages';
import { API_PROPERTIES, DEFAULT_VALUES } from '@constants/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export default class LoginDto {
    @ApiProperty({ description: API_PROPERTIES.login.email, default: DEFAULT_VALUES.user.email })
    @IsEmail({}, { message: MESSAGES.login.error.email.invalid })
    @IsNotEmpty({ message: MESSAGES.login.error.email.required })
    email: string;

    @ApiProperty({ description: API_PROPERTIES.login.password, default: DEFAULT_VALUES.user.password })
    @IsNotEmpty({ message: MESSAGES.login.error.password.required })
    password: string;
}

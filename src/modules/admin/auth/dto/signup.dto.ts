import { Role } from '@constants/enum';
import { MESSAGES } from '@constants/messages';
import { API_PROPERTIES, DEFAULT_VALUES } from '@constants/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsAlpha, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignupDto {
    @ApiProperty({
        description: API_PROPERTIES.signup.firstName,
        default: DEFAULT_VALUES.user.firstName,
        required: false
    })
    @IsString()
    @IsAlpha()
    @MinLength(1)
    firstName: string = '';

    @ApiProperty({
        description: API_PROPERTIES.signup.lastName,
        default: DEFAULT_VALUES.user.lastName,
        required: false
    })
    lastName: string;

    @ApiProperty({ description: API_PROPERTIES.signup.email, default: DEFAULT_VALUES.user.email })
    @IsNotEmpty({ message: MESSAGES.signup.error.email.required })
    email: string;

    @ApiProperty({ enum: Role, default: DEFAULT_VALUES.user.role, readOnly: true, required: true })
    role: Role;

    @ApiProperty({ description: API_PROPERTIES.signup.password })
    @IsNotEmpty({ message: MESSAGES.signup.error.password.required })
    password: string;
}

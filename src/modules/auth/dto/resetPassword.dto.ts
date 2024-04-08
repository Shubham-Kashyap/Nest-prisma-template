import { API_PROPERTIES, DEFAULT_VALUES } from '@constants/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from 'class-validator';

export class ResetPasswordDto {
    @ApiProperty({ description: API_PROPERTIES.login.email, default: DEFAULT_VALUES.user.password })
    @IsStrongPassword()
    newPassword: string;
}

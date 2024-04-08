import { MESSAGES } from '@constants/messages';
import { API_PROPERTIES, DEFAULT_VALUES } from '@constants/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsAlpha, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AddProductDto {
    @ApiProperty({ description: API_PROPERTIES.product.title, default: DEFAULT_VALUES.product.title, required: false })
    @IsString()
    @IsAlpha()
    @MinLength(1)
    title: string = '';

    @ApiProperty({
        description: API_PROPERTIES.product.description,
        default: DEFAULT_VALUES.product.description,
        required: false
    })
    description: string;

    @ApiProperty({ description: API_PROPERTIES.product.price, default: DEFAULT_VALUES.product.price })
    @IsNotEmpty({ message: MESSAGES.signup.error.email.required })
    price: string;

    @ApiProperty({ description: API_PROPERTIES.product.discountPercentage })
    @IsNotEmpty({ message: MESSAGES.signup.error.password.required })
    discountPercentage: string;

    @ApiProperty({ description: API_PROPERTIES.product.discountPercentage })
    @IsNotEmpty({ message: MESSAGES.signup.error.password.required })
    stock: string;

    @ApiProperty({ description: API_PROPERTIES.product.brand })
    @IsNotEmpty({ message: MESSAGES.signup.error.password.required })
    brand: string;

    @ApiProperty({ description: API_PROPERTIES.product.thumbnail })
    @IsNotEmpty({ message: MESSAGES.signup.error.password.required })
    thumbnail: string;
}

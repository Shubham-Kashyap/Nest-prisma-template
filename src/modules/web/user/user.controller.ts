import { Role } from '@constants/enum';
import { MESSAGES } from '@constants/messages';
import AuthRole from 'src/decorators/auth-role.decorator';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import UserService from '../../shared/service/user.service';

@Controller('/user')
@ApiTags('User')
export default class UserController {
    constructor(private userService: UserService) {}

    @Get('/list')
    @AuthRole(Role.Admin)
    findAll(): ResponsePayload<unknown> {
        return {
            message: 'success'
        };
    }

    @Get('/details/:userId')
    @AuthRole(Role.User)
    async userDetails(@Param('userId') userId: string): Promise<ResponsePayload<unknown>> {
        const data = await this.userService.userDetails(userId);
        return {
            message: MESSAGES.userDetails.success,
            data
        };
    }
}

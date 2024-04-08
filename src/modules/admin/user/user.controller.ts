import { Role } from '@constants/enum';
import { MESSAGES } from '@constants/messages';
import UserService from '@modules/shared/service/user.service';
import { Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import AuthRole from 'src/decorators/auth-role.decorator';

@Controller('user')
@ApiTags('User')
@AuthRole(Role.Admin)
export default class UserController {
    constructor(private userService: UserService) {}

    @Get('/list')
    findAll(): ResponsePayload<unknown> {
        return {
            message: 'success'
        };
    }

    @Patch('/block/:userId')
    async blokUser(@Param('userId') userId: string): Promise<ResponsePayload<unknown>> {
        await this.userService.blockUser(userId);
        return {
            message: MESSAGES.blockUser.success
        };
    }

    @Patch('/unblock/:userId')
    async unblockUser(@Param('userId') userId: string): Promise<ResponsePayload<unknown>> {
        await this.userService.unblockUser(userId);
        return {
            message: MESSAGES.unblockUser.success
        };
    }
}

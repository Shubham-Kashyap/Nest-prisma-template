import { Role } from '@constants/enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

export default function AuthRole(role: Role) {
    return applyDecorators(ApiBearerAuth(), SetMetadata('roles', [role]), UseGuards(AuthGuard, RoleGuard));
}

import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaService } from '@services/prisma.service';
import { ApplicationCacheModule } from '@modules/shared/module/application-cache.module';

@Module({
    imports: [TerminusModule, ApplicationCacheModule],
    controllers: [HealthController],
    providers: [PrismaService]
})
export default class HealthModule {}

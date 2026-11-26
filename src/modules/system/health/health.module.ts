import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { ApplicationCacheModule } from '@modules/shared/module/application-cache.module';
import { ApplicationDatabaseModule } from '@modules/shared/module/application-database.module';

@Module({
    imports: [TerminusModule, ApplicationCacheModule, ApplicationDatabaseModule],
    controllers: [HealthController],
    providers: []
})
export default class HealthModule {}

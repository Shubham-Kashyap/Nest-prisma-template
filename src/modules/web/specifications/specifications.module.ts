import { Module } from '@nestjs/common';
import { SpecificationsController } from './specifications.controller';
import { SpecificationsService } from './specifications.service';

@Module({
    controllers: [SpecificationsController],
    providers: [SpecificationsService]
})
export default class SpecificationsModule {}

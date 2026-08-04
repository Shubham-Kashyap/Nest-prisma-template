import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import HealthModule from './health/health.module';
import { SystemController } from './system.controller';
import QueueModule from '@modules/queue/queue.module';

const systemModules= [HealthModule];
@Module({
    controllers: [SystemController],
    providers: [],
    imports: [
        ...systemModules,
        QueueModule,
        RouterModule.register([
            {
                path: '/system',
                module: SystemModule,
                children: systemModules.map((module) => ({ path: '/', module }))
            }
        ])
    ]
})
export default class SystemModule {}
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import HealthModule from './health/health.module';

const systemModules= [HealthModule];
@Module({
    controllers: [],
    providers: [],
    imports: [
        ...systemModules,
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
import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, PrismaHealthIndicator, HealthCheckResult } from '@nestjs/terminus';
import { PrismaService } from '@services/prisma.service';
import { RedisService } from '@services/cache/redis.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private prismaHealth: PrismaHealthIndicator,
        private prisma: PrismaService,
        private redisService: RedisService
    ) {}

    @Get()
    @HealthCheck()
    @ApiOperation({ summary: 'Check API health status' })
    async check() : Promise<ResponsePayload<HealthCheckResult>> {
        return {
            message: 'success',
            data : await this.health.check([
                () => this.prismaHealth.pingCheck('database', this.prisma),
                () => ({
                    redis: {
                        status: this.redisService.isEnabled ? 'up' : 'down'
                    }
                })
            ])
        }
    }
}

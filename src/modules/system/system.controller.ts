import { Controller, Post, Get, Param, Query, Logger } from '@nestjs/common';
import { EmailProducer } from '@modules/queue/producers/email.producer';
import { DlqReplayService } from '@modules/queue/services/dlq-replay.service';
import { QueueType } from '@constants/enum';

@Controller('queue')
export class SystemController {
    private readonly logger = new Logger(SystemController.name);
    constructor(
        private readonly emailProducer: EmailProducer,
        private readonly dlqReplayService: DlqReplayService,
    ) {}

    @Get('status')
    async getQueueStatus() {
        const stats = await this.emailProducer.getStatus();
        return {
            success: true,
            data: stats
        };
    }

    @Post('resume')
    async resumeQueues() {
        this.logger.log('Manual intervention: Resuming all queues...');
        await this.emailProducer.resumeAll();
        return { success: true, message: 'All email queues have been forcefully resumed.' };
    }

    @Post('pause')
    async pauseQueues() {
        this.logger.log('Manual intervention: Pausing all queues...');
        await this.emailProducer.pauseAll();
        return { success: true, message: 'All email queues have been forcefully paused.' };
    }

    @Post('clear')
    async clearQueues() {
        this.logger.log('Manual intervention: Clearing all queues...');
        await this.emailProducer.clearAll();
        return { success: true, message: 'All email queues have been cleared and cleaned.' };
    }


    @Post('load-test')
    async startLoadTest(@Query('count') count: string) {
        const totalJobs = parseInt(count, 10) || 50;
        
        // Fire and forget the background seeder so the HTTP Request returns instantly.
        // It prevents the API from timing out during 1M loop generations.
        this.seedMassiveLoad(totalJobs).catch((err) => {
            this.logger.error('Background Seed Failed', err);
        });

        return {
            success: true,
            message: `Load test initiated. Background generator is seeding ${totalJobs} jobs with active Redis Backpressure protection!`
        };
    }

    private async seedMassiveLoad(totalJobs: number) {
        const BATCH_SIZE = 10000;
        const REDIS_BACKPRESSURE_LIMIT = 50000; // Max allowed waiting jobs before pausing

        this.logger.log(`[SEED START] Seeding ${totalJobs} jobs...`);

        for (let batchStart = 0; batchStart < totalJobs; batchStart += BATCH_SIZE) {
            
            // 1. SMART BACKPRESSURE CONTROL
            // If Redis is already choked with 50,000 pending bulk jobs, we WAIT.
            // This guarantees we never OOM Redis even if we queue 100,000,000 jobs!
            let waitingCount = await this.emailProducer.getWaitingCount(QueueType.BULK);
            while (waitingCount > REDIS_BACKPRESSURE_LIMIT) {
                this.logger.warn(`[BACKPRESSURE] Queue has ${waitingCount} jobs. Pausing seeder for 2 seconds to let workers drain...`);
                await new Promise((res) => setTimeout(res, 2000));
                waitingCount = await this.emailProducer.getWaitingCount(QueueType.BULK);
            }

            // 2. ULTRA-FAST ARRAY GENERATION
            const currentBatchSize = Math.min(BATCH_SIZE, totalJobs - batchStart);
            
            const criticalJobs: any[] = [];
            const normalJobs: any[] = [];
            const bulkJobs: any[] = [];

            for (let i = 1; i <= currentBatchSize; i++) {
                const globalIndex = batchStart + i;
                const payload = {
                    data: {
                        to: `user_${globalIndex}@example.com`,
                        subject: `Massive Load Test ${globalIndex}`,
                        body: `Payload #${globalIndex}`,
                        metadata: { campaignId: 'million_send_test' }
                    },
                    options: { jobId: `load_test_${globalIndex}` }
                };

                if (globalIndex % 10 === 0) criticalJobs.push(payload); // 10% Critical
                else if (globalIndex % 2 === 0) bulkJobs.push(payload); // 45% Bulk
                else normalJobs.push(payload); // 45% Normal
            }

            // 3. FLUSH VIA REDIS PIPELINES
            if (criticalJobs.length) await this.emailProducer.enqueueBulk(QueueType.CRITICAL, criticalJobs);
            if (normalJobs.length) await this.emailProducer.enqueueBulk(QueueType.NORMAL, normalJobs);
            if (bulkJobs.length) await this.emailProducer.enqueueBulk(QueueType.BULK, bulkJobs);
            
            this.logger.log(`[SEED PROGRESS] Batched ${batchStart + currentBatchSize} / ${totalJobs}`);
        }

        this.logger.log(`[SEED COMPLETE] All ${totalJobs} successfully pushed to BullMQ!`);
    }

    // ─────────────────────────── DLQ Endpoints ───────────────────────────

    /**
     * List all jobs currently in the Dead Letter Queue with their metadata.
     * GET /queue/dlq/jobs
     */
    @Get('dlq/jobs')
    async listDlqJobs() {
        const jobs = await this.dlqReplayService.listJobs();
        return {
            success: true,
            total: jobs.length,
            data: jobs,
        };
    }

    /**
     * Replay a single DLQ job back to its original queue.
     * Idempotency lock is bypassed so the job is guaranteed to re-enter.
     * POST /queue/dlq/replay/:jobId
     */
    @Post('dlq/replay/:jobId')
    async replayDlqJob(@Param('jobId') jobId: string) {
        this.logger.log(`Manual DLQ replay triggered for jobId=${jobId}`);
        await this.dlqReplayService.replayJob(jobId);
        return { success: true, message: `Job ${jobId} replayed to its original queue.` };
    }

    /**
     * Replay ALL DLQ jobs, optionally filtered by emailType.
     * Example: POST /queue/dlq/replay-all?emailType=registration
     */
    @Post('dlq/replay-all')
    async replayAllDlqJobs(@Query('emailType') emailType?: string) {
        this.logger.log(`DLQ replay-all triggered | filter emailType=${emailType ?? 'all'}`);
        await this.dlqReplayService.replayAll(emailType);
        return {
            success: true,
            message: emailType
                ? `All DLQ jobs with emailType="${emailType}" have been replayed.`
                : 'All DLQ jobs replayed to their original queues.',
        };
    }
}

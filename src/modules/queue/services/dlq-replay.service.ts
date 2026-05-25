import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QUEUE_NAMES } from '@constants/queue';
import { bullmqConfig } from '@config/bullmq';

/**
 * Service to interact with the DLQ (Dead Letter Queue).
 * Provides listing and replay capabilities.
 */
@Injectable()
export class DlqReplayService {
  private readonly logger = new Logger(DlqReplayService.name);
  private readonly dlqQueue: Queue;

  constructor() {
    // The DLQ queue name is fixed by the worker factory naming convention.
    this.dlqQueue = new Queue(QUEUE_NAMES.EMAIL_DLQ, {
      connection: bullmqConfig.connection,
    });
  }

  /** List jobs currently in the DLQ */
  async listJobs(): Promise<any[]> {
    // Use getJobs with appropriate statuses; here we only care about waiting/completed/failed.
    const jobs = await this.dlqQueue.getJobs(['waiting', 'delayed', 'failed', 'completed']);
    return jobs.map((job) => ({
      id: job.id,
      name: job.name,
      data: job.data,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
      finishedOn: job.finishedOn,
    }));
  }

  /** Replay a single job back to its original queue. */
  async replayJob(jobId: string): Promise<void> {
    const job = await this.dlqQueue.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found in DLQ`);
    }
    const { dlqMetadata, ...restData } = job.data;
    if (!dlqMetadata) {
      throw new Error(`Job ${jobId} missing dlqMetadata`);
    }
    const originalQueue = dlqMetadata.originalQueue;
    const targetQueue = new Queue(originalQueue, { connection: bullmqConfig.connection });
    // Re‑enqueue with idempotency bypass (TTL 0) and reset attempts.
    await targetQueue.add(job.name, { ...restData, globalAttemptsMade: 0 }, { attempts: 1, removeOnComplete: { age: 600 } });
    // Remove from DLQ after successful replay.
    await job.remove();
    this.logger.log(`Replayed DLQ job ${jobId} back to ${originalQueue}`);
  }

  /** Replay all jobs in the DLQ (optional filter by emailType) */
  async replayAll(filterEmailType?: string): Promise<void> {
    const jobs = await this.dlqQueue.getJobs(['waiting', 'failed', 'delayed']);
    for (const job of jobs) {
      const { dlqMetadata, ...restData } = job.data;
      if (!dlqMetadata) continue;
      if (filterEmailType && dlqMetadata.emailType !== filterEmailType) continue;
      const originalQueue = dlqMetadata.originalQueue;
      const targetQueue = new Queue(originalQueue, { connection: bullmqConfig.connection });
      await targetQueue.add(job.name, { ...restData, globalAttemptsMade: 0 }, { attempts: 1, removeOnComplete: { age: 600 } });
      await job.remove();
      this.logger.log(`Replayed DLQ job ${job.id} back to ${originalQueue}`);
    }
  }
}

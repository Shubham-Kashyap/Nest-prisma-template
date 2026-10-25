import { QueueType } from '@constants/enum';
import { QUEUE_NAMES, TTL_MAP } from '@constants/queue';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

export interface EmailJobPayload {
  to: string;
  subject: string;
  body: string;
  metadata?: Record<string, unknown>; // E.g., user tags, tracking IDs
  emailType?: string; // otp, registration, bulk, etc.
  userId?: string; // optional identifier for idempotency
}

export interface EnqueueOptions {
  jobId?: string; // Set this to enforce idempotency (prevent duplicates)
  delay?: number;
  idempotencyTTL?: number; // custom TTL in seconds, overrides default per emailType
}

@Injectable()
export class EmailProducer {
  private readonly logger = new Logger(EmailProducer.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.EMAIL_CRITICAL)
    private readonly criticalQueue: Queue,

    @InjectQueue(QUEUE_NAMES.EMAIL_NORMAL)
    private readonly normalQueue: Queue,

    @InjectQueue(QUEUE_NAMES.EMAIL_BULK)
    private readonly bulkQueue: Queue,

    @InjectQueue(QUEUE_NAMES.EMAIL_RETRY)
    private readonly retryQueue: Queue,

    @InjectQueue(QUEUE_NAMES.EMAIL_DLQ)
    private readonly dlqQueue: Queue,
  ) { }

  /**
   * Enqueues a single email job.
   */
  async enqueue(type: QueueType, payload: EmailJobPayload, options?: EnqueueOptions) {
    // Build idempotency key based on emailType and identifier (userId or email address)
    const lockKey = `idempotency:email:${payload.emailType ?? 'default'}:${payload.userId ?? payload.to}`;
    const ttl = options?.idempotencyTTL ?? TTL_MAP[payload.emailType ?? 'default'];
    // Access underlying ioredis client from any queue (they share the same connection)
    const redisClient = await this.criticalQueue.client;
    const lockAcquired = await redisClient.set(lockKey, '1', 'EX', ttl, 'NX');
    if (!lockAcquired) {
      this.logger.warn(`Idempotency lock exists for key ${lockKey}. Skipping duplicate job.`);
      return null;
    }

    const jobData = {
      ...payload,
      createdAt: Date.now(),
    };

    const bullOptions = {
      jobId: options?.jobId, // Idempotent key
      delay: options?.delay,
    };

    switch (type) {
      case QueueType.CRITICAL:
        return this.criticalQueue.add('send-email', jobData, bullOptions);
      case QueueType.NORMAL:
        return this.normalQueue.add('send-email', jobData, bullOptions);
      case QueueType.BULK:
        return this.bulkQueue.add('send-email', jobData, bullOptions);
      default:
        throw new Error(`Unsupported queue type: ${type}`);
    }
  }

  /**
   * Enqueues thousands of emails instantly using Redis pipelines.
   * Exponentially faster than calling enqueue() in a loop.
   */
  async enqueueBulk(type: QueueType, payloads: { data: EmailJobPayload, options?: EnqueueOptions }[]) {
    // Await the underlying ioredis client once
    const redisClient = await this.criticalQueue.client;
    // Use a single Redis pipeline to check and acquire idempotency locks for the batch
    const pipeline = redisClient.pipeline();
    const jobs = payloads.map((p) => {
      const lockKey = `idempotency:email:${p.data.emailType ?? 'default'}:${p.data.userId ?? p.data.to}`;
      const ttl = p.options?.idempotencyTTL ?? TTL_MAP[p.data.emailType ?? 'default'];
      pipeline.set(lockKey, '1', 'EX', ttl, 'NX');
      return { p, lockKey };
    });

    const pipelineResults = await pipeline.exec();

    const filteredJobs: any[] = [];
    let skippedCount = 0;

    if (pipelineResults) {
      for (let i = 0; i < pipelineResults.length; i++) {
        const [err, result] = pipelineResults[i];
        if (!err && result === 'OK') {
          const { p } = jobs[i];
          filteredJobs.push({
            name: 'send-email',
            data: { ...p.data, createdAt: Date.now() },
            opts: { jobId: p.options?.jobId, delay: p.options?.delay },
          });
        } else {
          skippedCount++;
        }
      }
    }

    if (skippedCount > 0) {
      this.logger.warn(`[enqueueBulk] Skipped ${skippedCount} duplicate jobs due to active idempotency locks (${type}).`);
    }

    if (filteredJobs.length === 0) {
      return [];
    }

    switch (type) {
      case QueueType.CRITICAL:
        return this.criticalQueue.addBulk(filteredJobs);

      case QueueType.NORMAL:
        return this.normalQueue.addBulk(filteredJobs);

      case QueueType.BULK:
        return this.bulkQueue.addBulk(filteredJobs);

      default:
        throw new Error(`Unsupported queue type: ${type}`);
    }
  }

  /**
   * Fetches the number of jobs currently waiting in the queue.
   * Essential for implementing backpressure.
   */
  async getWaitingCount(type: QueueType): Promise<number> {
    switch (type) {
      case QueueType.CRITICAL:
        return this.criticalQueue.getWaitingCount();
      case QueueType.NORMAL:
        return this.normalQueue.getWaitingCount();
      case QueueType.BULK:
        return this.bulkQueue.getWaitingCount();
      case QueueType.RETRY:
        return this.retryQueue.getWaitingCount();
      default:
        return 0;
    }
  }

  /**
   * Queue Management: Forcefully pause all queues
   */
  async pauseAll() {
    await Promise.all([
      this.criticalQueue.pause(),
      this.normalQueue.pause(),
      this.bulkQueue.pause(),
      this.retryQueue.pause(),
    ]);
  }

  /**
   * Queue Management: Forcefully resume all queues
   */
  async resumeAll() {
    await Promise.all([
      this.criticalQueue.resume(),
      this.normalQueue.resume(),
      this.bulkQueue.resume(),
      this.retryQueue.resume(),
    ]);
  }

  /**
   * Queue Management: Get advanced stats for all queues
   */
  async getStatus() {
    const queueMap: Record<string, Queue> = {
      Critical: this.criticalQueue,
      Normal: this.normalQueue,
      Bulk: this.bulkQueue,
      Retry: this.retryQueue,
      Dlq: this.dlqQueue,
    };

    return Promise.all(
      Object.entries(queueMap).map(async ([capitalizedName, queue]) => {
        return {
          queue: capitalizedName,
          isPaused: await queue.isPaused(),
          waiting: await queue.getWaitingCount(),
          active: await queue.getActiveCount(),
          failed: await queue.getFailedCount(),
          completed: await queue.getCompletedCount(),
          delayed: await queue.getDelayedCount(),
        };
      })
    );
  }

  /**
   * Queue Management: Clear all jobs from all queues and purge idempotency locks
   */
  async clearAll() {
    const queues = [
      this.criticalQueue,
      this.normalQueue,
      this.bulkQueue,
      this.retryQueue,
      this.dlqQueue,
    ];

    await Promise.all(
      queues.map(async (queue) => {
        await queue.drain(true);
        await queue.clean(0, 0, 'completed');
        await queue.clean(0, 0, 'failed');
        await queue.clean(0, 0, 'delayed');
        await queue.clean(0, 0, 'wait');
      })
    );

    // Clear active idempotency locks in Redis
    try {
      const redisClient = await this.criticalQueue.client;
      let cursor = '0';
      do {
        const [nextCursor, keys] = await redisClient.scan(cursor, 'MATCH', 'idempotency:email:*', 'COUNT', 1000);
        cursor = nextCursor;
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
      } while (cursor !== '0');
    } catch (error) {
      this.logger.error('Failed to clear idempotency keys', error);
    }
  }
}

import { QueueType } from '@constants/enum';
import { QUEUE_NAMES } from '@constants/queue';
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
  ) { }

  /**
   * Enqueues a single email job.
   */
  async enqueue(type: QueueType, payload: EmailJobPayload, options?: EnqueueOptions) {
    // Build idempotency key based on emailType and identifier (userId or email address)
    const lockKey = `idempotency:email:${payload.emailType ?? 'default'}:${payload.userId ?? payload.to}`;
    const ttlMap: Record<string, number> = { otp: 60, registration: 600, bulk: 86400, marketing: 86400, default: 300 };
    const ttl = options?.idempotencyTTL ?? ttlMap[payload.emailType ?? 'default'];
    // Access underlying ioredis client from any queue (they share the same connection)
    const redisClient = (this.criticalQueue as any).client as any;
    const lockAcquired = await redisClient.set(lockKey, '1', 'NX', 'EX', ttl);
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
    const jobs = payloads.map((p) => {
      // Idempotency lock per payload
      const lockKey = `idempotency:email:${p.data.emailType ?? 'default'}:${p.data.userId ?? p.data.to}`;
      const ttlMap: Record<string, number> = { otp: 60, registration: 600, bulk: 86400, marketing: 86400, default: 300 };
      const ttl = p.options?.idempotencyTTL ?? ttlMap[p.data.emailType ?? 'default'];
      const redisClient = (this.criticalQueue as any).client as any;
      // Note: we do not await here; we will filter later after promise resolution
      return { p, lockKey, ttl, redisClient };
    });

    // Resolve locks sequentially to avoid race conditions
    const filteredJobs: any[] = [];
    for (const { p, lockKey, ttl, redisClient } of jobs) {
      const lockAcquired = await redisClient.set(lockKey, '1', 'NX', 'EX', ttl);
      if (lockAcquired) {
        filteredJobs.push({
          name: 'send-email',
          data: { ...p.data, createdAt: Date.now() },
          opts: { jobId: p.options?.jobId, delay: p.options?.delay },
        });
      } else {
        this.logger.warn(`Idempotency lock exists for key ${lockKey}. Skipping duplicate bulk job.`);
      }
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
    ]);
  }

  /**
   * Queue Management: Get advanced stats for all queues
   */
  async getStatus() {
    const connection = this.bulkQueue.opts.connection;
    const queueNames = Object.entries(QUEUE_NAMES);

    return Promise.all(
      queueNames.map(async ([key, name]) => {
        // Map keys like EMAIL_CRITICAL -> Critical, EMAIL_RETRY -> Retry
        const readableName = key.replace('EMAIL_', '').toLowerCase();
        const capitalizedName = readableName.charAt(0).toUpperCase() + readableName.slice(1);

        const queue = new Queue(name, { connection });
        try {
          return {
            queue: capitalizedName,
            isPaused: await queue.isPaused(),
            waiting: await queue.getWaitingCount(),
            active: await queue.getActiveCount(),
            failed: await queue.getFailedCount(),
            completed: await queue.getCompletedCount(),
            delayed: await queue.getDelayedCount(),
          };
        } finally {
          await queue.close();
        }
      })
    );
  }

  /**
   * Queue Management: Clear all jobs from all queues for a fresh start
   */
  async clearAll() {
    const connection = this.bulkQueue.opts.connection;
    const queueNames = Object.values(QUEUE_NAMES);

    await Promise.all(
      queueNames.map(async (name) => {
        const queue = new Queue(name, { connection });
        try {
          await queue.drain(true);
          await queue.clean(0, 0, 'completed');
          await queue.clean(0, 0, 'failed');
        } finally {
          await queue.close();
        }
      })
    );
  }
}

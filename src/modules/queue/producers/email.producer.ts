import { QueueType } from '@constants/enum';
import { QUEUE_NAMES } from '@constants/queue';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

export interface EmailJobPayload {
  to: string;
  subject: string;
  body: string;
  metadata?: Record<string, unknown>; // E.g., user tags, tracking IDs
}

export interface EnqueueOptions {
  jobId?: string; // Set this to enforce idempotency (prevent duplicates)
  delay?: number;
}

@Injectable()
export class EmailProducer {
    constructor(
        @InjectQueue(QUEUE_NAMES.EMAIL_CRITICAL)
        private readonly criticalQueue: Queue,

        @InjectQueue(QUEUE_NAMES.EMAIL_NORMAL)
        private readonly normalQueue: Queue,

        @InjectQueue(QUEUE_NAMES.EMAIL_BULK)
        private readonly bulkQueue: Queue,
    ) {}

  /**
   * Enqueues a single email job.
   */
  async enqueue(type: QueueType, payload: EmailJobPayload, options?: EnqueueOptions) {
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
    const jobs = payloads.map((p) => ({
      name: 'send-email',
      data: { ...p.data, createdAt: Date.now() },
      opts: { 
        jobId: p.options?.jobId, 
        delay: p.options?.delay 
      }
    }));

    switch (type) {
      case QueueType.CRITICAL:
        return this.criticalQueue.addBulk(jobs);

      case QueueType.NORMAL:
        return this.normalQueue.addBulk(jobs);

      case QueueType.BULK:
        return this.bulkQueue.addBulk(jobs);

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
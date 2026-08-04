import { Worker, Job, Queue } from 'bullmq';
import { Logger } from '@nestjs/common';
import { bullmqConfig } from '@config/bullmq';
import { QUEUE_NAMES } from '@constants/queue';

export interface BaseProcessor {
  process(job: Job): Promise<any>;
}

export interface WorkerConfig {
  queueName: string;
  concurrency: number;
  limiter?: { max: number; duration: number }; // Global Redis Rate Limiter
}

/**
 * A highly scalable factory that spins up workers for a specific channel (Email, SMS, Push).
 * Automatically wires up the global circuit breaker, thundering herd mitigation, and DLQ routing.
 */
export function createChannelWorkers(
  channelPrefix: string, // e.g., 'email', 'sms'
  processor: BaseProcessor,
  workerConfigs: WorkerConfig[],
  options?: { circuitBreakerDurationMs?: number }
) {
  console.log('workerConfigs', workerConfigs);
  const logger = new Logger(`${channelPrefix.toUpperCase()}_WORKER_FACTORY`);

  // 1. Initialize core routing queues for this channel
  const retryQueueName = `${channelPrefix}-retry`;
  const dlqQueueName = `${channelPrefix}-dlq`;

  const retryQueue = new Queue(retryQueueName, { connection: bullmqConfig.connection });
  const dlqQueue = new Queue(dlqQueueName, { connection: bullmqConfig.connection });

  // 2. Map over configs to spin up workers
  const workers = workerConfigs.map(({ queueName, concurrency, limiter }) => {

    // Auto-heal stuck paused states from previous crashes
    // const q = new Queue(queueName, { connection: bullmqConfig.connection });
    // q.isPaused().then(paused => {
    //   if (paused) {
    //     logger.log(`[SELF-HEALING] Resuming stuck paused queue: ${queueName}`);
    //     q.resume().catch(err => logger.error(`Failed to auto-resume ${queueName}`, err));
    //   }
    // });

    const worker = new Worker(
      queueName,
      async (job: Job) => {
        return processor.process(job);
      },
      {
        connection: bullmqConfig.connection,
        concurrency,
        limiter, // Enforce global rate limiting if defined in config
      }
    );

    worker.on('ready', () => {
      logger.log(`[WORKER READY] ${queueName} | concurrency=${concurrency}`);
    });

    worker.on('active', (job) => {
      logger.log(`[JOB ACTIVE] queue=${queueName} | jobId=${job.id}`);
    });

    worker.on('completed', (job) => {
      logger.log(`[JOB COMPLETED] queue=${queueName} | jobId=${job.id}`);
    });

    worker.on('failed', async (job, error) => {
      logger.error(`[JOB FAILED] queue=${queueName} | jobId=${job?.id} | error=${error.message}`);
      if (!job) return;

      // Prevent infinite loops if DLQ itself fails
      if (queueName === dlqQueueName) {
        logger.error(`[DLQ ALERT] Job failed in DLQ. Manual intervention required. JobId=${job.id}`);
        return;
      }

      const errMessage = error.message.toLowerCase();
      const isPermanentFailure =
        errMessage.includes('invalid') ||
        errMessage.includes('malformed') ||
        errMessage.includes('bounce') ||
        errMessage.includes('permanent');

      // Circuit Breaker System Pause
      if (errMessage.includes('all providers failed') || errMessage.includes('outage')) {
        const pauseDuration = options?.circuitBreakerDurationMs || 60000;
        logger.warn(`[CIRCUIT BREAKER] Providers degraded for ${queueName}. Pausing for ${pauseDuration / 1000}s.`);
        const currentQueue = new Queue(queueName, { connection: bullmqConfig.connection });
        await currentQueue.pause();

        setTimeout(async () => {
          try {
            await currentQueue.resume();
            logger.log(`[CIRCUIT BREAKER] Cooldown finished. Auto-resumed queue: "${queueName}"`);
          } catch (e) {
            logger.error(`[CIRCUIT BREAKER] Failed to auto-resume queue: "${queueName}"`, e);
          }
        }, pauseDuration); // Wait configured duration to match EmailSenderService lockout!
      }

      // Retry/DLQ Routing
      const maxAttempts = 5;
      const attemptsMade = (job.data.globalAttemptsMade || 0) + 1;
      const isPermanent = isPermanentFailure;
      const priorityMap: Record<string, number> = {
        [QUEUE_NAMES.EMAIL_CRITICAL]: 1,
        [QUEUE_NAMES.EMAIL_NORMAL]: 5,
        [QUEUE_NAMES.EMAIL_BULK]: 10,
      };
      const priority = priorityMap[queueName] ?? 10;

      if (isPermanent || attemptsMade >= maxAttempts) {
        // Route to DLQ with metadata
        const dlqMetadata = {
          originalQueue: queueName,
          errorReason: errMessage,
          retryable: !isPermanent,
          createdAt: Date.now(),
          emailType: job.data.emailType ?? 'default',
          priority,
        };
        await dlqQueue.add(job.name, { ...job.data, globalAttemptsMade: attemptsMade, dlqMetadata }, {
          attempts: 1,
          removeOnComplete: { age: 600 },
          removeOnFail: { age: 600 },
        });
      } else {
        // Route back to retry queue with exponential backoff + jitter, preserving original priority
        const baseDelay = Math.min(30000, 1000 * Math.pow(2, attemptsMade));
        const jitter = Math.floor(Math.random() * 1000);
        const remainingAttempts = maxAttempts - attemptsMade;
        logger.log(`[ROUTING TO RETRY] jobId=${job.id} | attempt=${attemptsMade}/${maxAttempts} | remaining=${remainingAttempts} | delay=${baseDelay + jitter}ms`);
        await retryQueue.add(job.name, { ...job.data, globalAttemptsMade: attemptsMade }, {
          attempts: 1,
          delay: baseDelay + jitter,
          priority,  // Preserve original queue priority so critical jobs are processed first in the retry queue
        });
      }
    });

    worker.on('error', (error) => logger.error(`[WORKER ERROR] queue=${queueName}`, error));
    worker.on('stalled', (jobId) => logger.warn(`[JOB STALLED] queue=${queueName} | jobId=${jobId}`));
    worker.on('closing', () => logger.warn(`[WORKER CLOSING] queue=${queueName}`));
    worker.on('closed', () => logger.warn(`[WORKER CLOSED] queue=${queueName}`));

    return worker;
  });

  // 3. Return workers and a unified shutdown handler
  return {
    workers,
    shutdown: async () => {
      logger.log(`[${channelPrefix.toUpperCase()} WORKERS] Graceful shutdown initiated`);
      await Promise.all([
        ...workers.map((worker) => worker.close()),
        retryQueue.close(),
        dlqQueue.close()
      ]);
      logger.log(`[${channelPrefix.toUpperCase()} WORKERS] Graceful shutdown completed`);
    }
  };
}

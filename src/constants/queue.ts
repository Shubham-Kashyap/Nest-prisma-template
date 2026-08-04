import { QueueType } from "./enum";

export const QUEUE_NAMES = {
  EMAIL_CRITICAL: 'email-critical',
  EMAIL_NORMAL: 'email-normal',
  EMAIL_BULK: 'email-bulk',
  EMAIL_RETRY: 'email-retry',
  EMAIL_DLQ: 'email-dlq',
} as const;






export const EMAIL_WORKERS = {
    [QueueType.CRITICAL]: {
        concurrency: 10,
        queueName: QUEUE_NAMES.EMAIL_CRITICAL,
        limiter: { max: 100, duration: 1000 } // Global limit: 100 OTPs per second max, duration of 1000 means max 100 OTPs in 1 second 
    },
    [QueueType.NORMAL]: {
        concurrency: 30,
        queueName: QUEUE_NAMES.EMAIL_NORMAL,
        limiter: { max: 50, duration: 1000 } // Global limit: 50 standard emails per second, duration of 1000 means max 50 standard emails in 1 second
    },
    [QueueType.BULK]: {
        concurrency: 100,
        queueName: QUEUE_NAMES.EMAIL_BULK,
        limiter: { max: 2000, duration: 1000 } // Throttle to 2000 jobs/sec to prevent hitting the Circuit Breaker, duration of 1000 means max 2000 jobs in 1 second
    },
    [QueueType.RETRY]: {
        /**
         * Concurrency is set to 30 so the single retry queue drains fast.
         * Jobs are isolated by BullMQ priority (Critical=1, Normal=5, Bulk=10),
         * so high-priority retries always get processed before low-priority ones.
         */
        concurrency: 30,
        queueName: QUEUE_NAMES.EMAIL_RETRY,
    },
    // [QueueType.DLQ]: {
    //     concurrency: 5,
    //     queueName: QUEUE_NAMES.EMAIL_DLQ,
    // }
}
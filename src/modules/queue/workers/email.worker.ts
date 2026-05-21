// src/modules/queue/workers/email.worker.ts

import EmailProcessor from '../processors/email.processor';
import { EmailSenderService } from '../services/email-sender.service';
import { EMAIL_WORKERS } from '@constants/queue';
import { createChannelWorkers, WorkerConfig } from '../core/worker.factory';
import { circuitBreakerConfig } from '@config/bullmq';

/**
 * ---------------------------------------------------
 * PROCESSOR INSTANCE
 * ---------------------------------------------------
 */
const emailProcessor = new EmailProcessor(
  new EmailSenderService(),
);

/**
 * ---------------------------------------------------
 * WORKER REGISTRY
 * ---------------------------------------------------
 * By utilizing the Base Worker Factory, we inherit Circuit Breakers,
 * DLQ Routing, and Thundering Herd mitigation for free.
 * 
 * To add SMS or Push, simply duplicate this file, pass 'sms' or 'push', 
 * and pass the respective Processor and Worker map.
 */
const workerConfigs: WorkerConfig[] = Object.values(EMAIL_WORKERS);

export const { 
  workers: emailWorkers, 
  shutdown: shutdownEmailWorkers 
} = createChannelWorkers('email', emailProcessor, workerConfigs, {
  circuitBreakerDurationMs: circuitBreakerConfig.CIRCUIT_OPEN_DURATION_MS,
});
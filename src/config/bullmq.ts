import { BullRootModuleOptions } from "@nestjs/bullmq";

export const bullmqConfig: BullRootModuleOptions = {
    connection: {
       url: process.env.REDIS_URL,
    },
    defaultJobOptions: {
        attempts: 1, // Disabled internal retries to enforce retry queue isolation
        
        // Age and Count limit: prevents Redis memory bloat while preserving history
        removeOnComplete: {
            age: 100,   // keep for 100s 
            count: 1000, // keep max 1000 completed jobs
        },
        removeOnFail: {
            age: 100, // keep failed jobs for 100s 
            count: 5000,    // keep max 5000 failed jobs
        },
    },
}

export const circuitBreakerConfig = {
    MAX_FAILURES: 3,
    CIRCUIT_OPEN_DURATION_MS: 15000, // 15 seconds
};
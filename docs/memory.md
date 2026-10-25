# Project Memory & Architectural Decision Records (ADRs)

## 1. Project Context & Background

This project began as a clean NestJS starter template and evolved into an **Enterprise-grade Distributed System Boilerplate**. It provides reference implementations for real-world production challenges: high-throughput asynchronous workloads, priority queue segregation, multi-provider fault tolerance, memory-safe backpressure regulation, multi-tier caching, and comprehensive observability.

---

## 2. Architectural Decision Records (ADRs)

### ADR 001: Priority Queue Segregation vs Single Monolithic Queue
- **Status**: Accepted
- **Context**: In a monolithic queue, high-volume batch tasks (such as marketing campaigns) block mission-critical transactional tasks (such as OTPs and password resets).
- **Decision**: Segregate email workloads into separate BullMQ queues:
  - `email-critical` (OTPs, urgent security emails)
  - `email-normal` (Transactional receipts, order updates)
  - `email-bulk` (Newsletters, marketing campaigns)
- **Consequences**: Ensures zero starvation for high-priority tasks even when millions of bulk messages are queued.

---

### ADR 002: Centralized Retry Queue (`email-retry`) vs BullMQ In-Place Retries
- **Status**: Accepted
- **Context**: BullMQ native retries keep failing jobs inside the active queue, blocking fresh jobs or distorting worker concurrency limits.
- **Decision**: Disable BullMQ internal retries (`attempts: 1`). Route failed jobs to a centralized `email-retry` queue using custom exponential backoff calculation and priority headers.
- **Consequences**: Isolates retry traffic from standard ingress channels while honoring original job priority during retry execution.

---

### ADR 003: Redis Pipeline-Based Idempotency Lock Checks
- **Status**: Accepted
- **Context**: Checking and acquiring locks individually for 10,000 jobs per batch incurs 10,000 network round-trips to Redis, creating severe ingestion latency.
- **Decision**: Execute all `SET key 1 EX ttl NX` checks inside a single **Redis pipeline** prior to calling `Queue.addBulk()`.
- **Consequences**: Reduces batch lock acquisition time from seconds to a few milliseconds, enabling high-rate job injection.

---

### ADR 004: Ingestion Backpressure Regulation (`REDIS_BACKPRESSURE_LIMIT`)
- **Status**: Accepted
- **Context**: Ingesting 1,000,000 jobs directly into Redis without throttling consumes hundreds of megabytes of RAM and risks triggering Redis Out-Of-Memory (OOM) crashes.
- **Decision**: Implement a backpressure check in `SystemController.seedMassiveLoad()`. If waiting jobs in `email-bulk` or `email-normal` exceed **50,000**, pause the seeder for 2 seconds.
- **Consequences**: Caps Redis memory usage safely between **80MB and 180MB** during massive load tests.

---

### ADR 005: Multi-Provider Email Waterfall with Circuit Breaker
- **Status**: Accepted
- **Context**: Relying on a single third-party email provider exposes the application to external downtime and rate-limiting blocks.
- **Decision**: Implement waterfall failover: **AWS SES** $\rightarrow$ **SendGrid** $\rightarrow$ **Mailgun**. Track consecutive provider failures; trip a circuit breaker for 15 seconds if a provider fails 3 times in a row.
- **Consequences**: Guarantees email delivery continuity even during major external service disruptions.

---

### ADR 006: Dedicated Test Directory (`src/__tests__/`)
- **Status**: Accepted
- **Context**: Separating tests into an external `test/` folder often leads to outdated unit tests as domain files evolve.
- **Decision**: Place all Jest unit tests in `src/__tests__/` next to the implementation code.
- **Consequences**: Improves test discoverability, simplifies path alias imports, and encourages developers to maintain high coverage.

---

## 3. Known Bottlenecks & Operational Insights

| Component | Observation / Bottleneck | Resolution / Recommendation |
| :--- | :--- | :--- |
| **`email-normal` Rate Limiter** | Capped at **50 jobs/sec** in BullMQ configuration. Draining 450k normal jobs requires **~2.5 hours**. | If higher normal-queue throughput is required, adjust the BullMQ rate limiter config or split normal transactional tiers. |
| **Console Logger I/O** | 1M jobs generate 4–5 million stdout log lines, saturating Node.js event-loop CPU time. | In high-load test environments, configure Winston to suppress debug/info console logging or route exclusively to async file streams. |
| **Redis Job Retention** | Completed jobs must not accumulate indefinitely in Redis memory. | Strictly enforced via `removeOnComplete: { count: 1000, age: 100 }` and `removeOnFail: { count: 5000, age: 100 }`. |

---

## 4. Engineering Standards & Conventions

1. **Strict TypeScript**:
   - `noImplicitAny: true` in `tsconfig.json`.
   - Never use `any` in production domain services or controllers.
2. **Database Field Conventions**:
   - Models use `camelCase` in TypeScript code and map to `snake_case` in MongoDB via Prisma `@map("_id")`, `@map("created_at")`, etc.
3. **Response Envelope**:
   - All controller responses must pass through `ResponseHelper` or `ResponseInterceptor` to ensure frontend clients receive consistent schema responses.

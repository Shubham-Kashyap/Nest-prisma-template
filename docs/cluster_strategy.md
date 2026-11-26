   # Cluster Module Strategy & Multi-Process Impact Analysis

   > [!NOTE]
   > **Status**: Proposed (Pending Review & Strategy Finalization)  
   > **Target Scope**: Performance upgrade enabling multi-core Node.js clustering via [app-cluster.service.ts](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/services/app-cluster.service.ts) without regressing BullMQ resiliency, cache consistency, logging, or startup reliability.  
   > **Next Step**: Upon review and approval, implement the finalized option and sync [architecture.md](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/docs/architecture.md), [design.md](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/docs/design.md), [memory.md](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/docs/memory.md), and [tasks.md](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/docs/tasks.md).

   ---

   ## 1. Executive Summary

   Node.js runs JavaScript on a single event loop per process. On multi-core hosts, a single NestJS process leaves extra CPU cores idle. Introducing `node:cluster` via `AppClusterService` forks multiple worker processes sharing port `5000` to scale HTTP throughput.

   However, the current codebase assumes a **single-process runtime** in several critical subsystems:
   1. **Bootstrap & `.env` loading order** ([main.ts](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/main.ts), [app.module.ts](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/app.module.ts))
   2. **Eager BullMQ worker instantiation & in-memory circuit breakers** ([email.worker.ts](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/modules/queue/workers/email.worker.ts), [worker.factory.ts](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/modules/queue/core/worker.factory.ts), [email-sender.service.ts](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/modules/queue/services/email-sender.service.ts))
   3. **Process-local L1 in-memory caching** ([hybrid-cache.service.ts](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/services/cache/hybrid-cache.service.ts))
   4. **Shared rotating log files** ([logger.ts](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/config/logger.ts))
   5. **Per-process DB & Redis connection pools** ([prisma.service.ts](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/services/prisma.service.ts), [redis.service.ts](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/services/cache/redis.service.ts))

   ---

   ## 2. Audit of Existing `AppClusterService`

   Current draft at [app-cluster.service.ts](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/services/app-cluster.service.ts):

   | Observation | Current Behavior | Impact / Required Adjustment |
   | :--- | :--- | :--- |
   | **Not wired into `main.ts`** | `InitializeCluster()` is not invoked yet. | Needs a `clusterize(bootstrap)` pattern so **only workers** (or single-process fallback) execute `bootstrap()`. If `bootstrap()` runs unconditionally after `InitializeCluster()`, the Primary process will also boot NestJS and bind port `5000`. |
   | **`.env` timing bug** | Reads `process.env.CLUSTER_MODE === 'true'` before `NestFactory.create(AppModule)`. | `ConfigModule.forRoot()` only loads `.env` *inside* `NestFactory.create()`. Without `import 'dotenv/config'` (or OS-level env injection), `CLUSTER_MODE` from `.env` will be `undefined` when `InitializeCluster()` runs. |
   | **Unconditional worker respawn** | `cluster.on('exit', () => cluster.fork())` restarts every exited worker. | During intentional shutdown (`SIGTERM`/`SIGINT`) or fatal startup errors (e.g., MongoDB down in `PrismaService.onModuleInit()`), this causes an infinite **fork bomb**. Must skip respawn when `worker.exitedAfterDisconnect` is true and enforce a crash-loop backoff/threshold. |
   | **Worker count unbounded** | Always forks `os.cpus().length`. | Inside Docker/K8s or shared VMs, `os.cpus().length` reflects host cores rather than container CPU limits. Should support `CLUSTER_WORKERS` override (e.g., `0` = auto, capped/configurable). |
   | **ESLint / TS compliance** | Uses `require('os')` and omits explicit return types on `InitializeCluster()` and `getClusterInfo()`. | Fails [.eslintrc.js](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/.eslintrc.js) (`explicit-function-return-type`, `explicit-module-boundary-types`). Must switch to `import * as os from 'node:os'` and explicit return types. |

   ---

   ## 3. Multi-Process Impact Analysis (Why Companion Updates Are Needed)

   ### 3.1. BullMQ Workers & Circuit Breaker Split-Brain

   **Current state**:
   - [queue.module.ts](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/modules/queue/queue.module.ts#L8) imports `shutdownEmailWorkers` from [email.worker.ts](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/modules/queue/workers/email.worker.ts).
   - Evaluating `email.worker.ts` immediately executes `createChannelWorkers(...)` at module load time, spawning 4 BullMQ `Worker` instances per process (`email-critical`: conc 10, `email-normal`: conc 30, `email-bulk`: conc 100, `email-retry`: conc 30; see [queue.ts](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/constants/queue.ts)).

   **Failure modes under naive `N`-worker clustering** (e.g., `N = 8` cores):
   1. **Concurrency & connection explosion**: Spawns `8 × (10 + 30 + 100 + 30) = 1,360` concurrent job slots and multiplies BullMQ Redis connections by `8×`.
   2. **Desynchronized Circuit Breakers**: [EmailSenderService](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/modules/queue/services/email-sender.service.ts#L16-L20) holds provider failure counters (`SES`, `Sendgrid`, `Mailgun`) in **local process memory**. Worker #1 tripping its circuit breaker does not stop Workers #2–#8 from continuing to hit a failing provider.
   3. **Competing Queue Pause/Resume**: In [worker.factory.ts](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/modules/queue/core/worker.factory.ts#L90-L104), on outage, a worker calls `await currentQueue.pause()` on the shared Redis queue and schedules a local `setTimeout(() => currentQueue.resume(), pauseDuration)`. Across 8 workers, one worker's timer can resume the queue immediately after another worker paused it.
   4. **CPU Contention on HTTP Traffic**: Heavy email/1M-job processing runs on the same event loops serving user login, cart, and checkout requests—degrading API p95 latency.

   ---

   ### 3.2. Hybrid L1/L2 Cache Coherency

   **Current state**:
   - [HybridCacheService](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/services/cache/hybrid-cache.service.ts) layers a process-local `Map` (`localCache`, default TTL `15s`) in front of Redis L2.
   - Calling `del(...keys)` removes entries from the **calling worker's** `localCache` and from Redis, but does not notify sibling workers.

   **User-facing impact**:
   - If an admin updates a product or stock on Worker #1, Workers #2–#8 continue serving the stale value from their own `localCache` for up to `localTtlSeconds` (15 seconds). Clients refreshing the page observe inconsistent responses depending on which worker handles the request.

   ---

   ### 3.3. Winston Rotating File Contention & Observability

   **Current state**:
   - [logger.ts](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/config/logger.ts) configures `winston-daily-rotate-file` (`maxSize: '20m'`, `zippedArchive: true`) writing directly to `logs/application-%DATE%.log` and `logs/error-%DATE%.log`.

   **Operational impact**:
   - Multiple OS processes writing to and attempting to rotate/gzip the same file at 20 MB causes interleaved lines, file-lock races, or `ENOENT` archive errors.
   - Log entries do not identify which worker (`workerId` / `PID`) emitted them, complicating crash or latency debugging.

   ---

   ### 3.4. Database & Redis Connection Pool Multiplication

   **Current state**:
   - Every NestJS worker instantiates its own [PrismaService](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/services/prisma.service.ts) (`PrismaClient`) and [RedisService](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/services/cache/redis.service.ts).

   **Operational impact**:
   - Total connections scale linearly (`N × pool_size`). On startup, `N` workers connecting simultaneously can spike MongoDB/Redis connection counts unless `maxPoolSize` (on `MONGODB_URL`) and cluster worker count are tuned together.

   ---

   ## 4. Recommended Target Architecture

   ### Role-Separated Cluster Topology (`APP_ROLE`)

   Aligns with the Phase 4 milestone in [tasks.md](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/docs/tasks.md#L91) (*Multi-Process Worker Scaling*):

   ```mermaid
   flowchart TD
      Client["HTTP Clients"] --> Primary["Cluster Primary (PID: Main)\nNo NestJS HTTP / No DB Pool"]

      Primary -->|Forks N API Workers\nAPP_ROLE=api| API1["Worker 1 (HTTP + Producers + BullBoard)"]
      Primary -->|Round-Robin Socket| API2["Worker 2 (HTTP + Producers + BullBoard)"]
      Primary -->|...| APIN["Worker N (HTTP + Producers + BullBoard)"]

      Primary -->|Forks 1 Dedicated Worker\nAPP_ROLE=worker| QWorker["Queue Worker Process\n(BullMQ Consumers Only)"]

      API1 & API2 & APIN -->|Enqueue Jobs + L2 Cache| Redis[("Redis (Queues, Locks, Pub/Sub, Cache)")]
      API1 & API2 & APIN -->|Queries / Mutations| Mongo[("MongoDB")]

      QWorker -->|Consume & Retry / DLQ| Redis
      QWorker -->|Send Emails| Providers["SES -> SendGrid -> Mailgun"]
   ```

   **Why this topology works best**:
   - **API workers stay lean & fast**: User requests never compete with BullMQ job execution or 1M-job drain loops.
   - **BullMQ concurrency & circuit breakers stay exact**: Exactly 1 worker process (or an independently scaled `worker` container) runs `email-critical` / `email-normal` / `email-bulk` / `email-retry`, preserving single-source-of-truth circuit breaker state and queue pause timers.
   - **Zero-downtime / safe container fallback**: Setting `CLUSTER_MODE=false` and `APP_ROLE=all` preserves the exact current single-process behavior for local development (`npm run dev`), debugging (`npm run debug`), Jest tests, and Kubernetes pods where horizontal scaling is managed externally.

   ---

   ## 5. Major Code Changes Blueprint (For Review)

   | # | Target File | Planned Change | Reason |
   | :--- | :--- | :--- | :--- |
   | **1** | [app-cluster.service.ts](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/services/app-cluster.service.ts) | Refactor into clean `clusterize(bootstrap)` + `getClusterInfo()`: load `dotenv` before reading env, use `node:os`, add `CLUSTER_WORKERS` cap, tag workers with `APP_ROLE` env (`api` vs `worker`), forward `SIGINT`/`SIGTERM` to children, and add crash-loop protection (ignore `exitedAfterDisconnect`, limit rapid restarts). | Prevents primary from binding port `5000`, prevents fork bombs on DB startup failure, and passes strict ESLint/TS checks. |
   | **2** | [main.ts](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/main.ts) | Wrap `bootstrap()` in `AppClusterService.clusterize(bootstrap)` and skip HTTP `app.listen(port)` when `APP_ROLE=worker` (initialize application context only via `NestFactory.createApplicationContext` or dedicated worker bootstrap). | Cleanly separates Primary orchestration, HTTP workers, and headless Queue worker. |
   | **3** | [dot-env.ts](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/config/dot-env.ts) | Add optional/defaulted cluster config keys: `CLUSTER_MODE` (`false`), `CLUSTER_WORKERS` (`0`), `APP_ROLE` (`all`). Update [dot-env.test.ts](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/__tests__/dot-env.test.ts). | Keeps existing `.env` files working without breaking startup validation while exposing cluster controls cleanly. |
   | **4** | [email.worker.ts](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/modules/queue/workers/email.worker.ts) & [queue.module.ts](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/modules/queue/queue.module.ts) | Replace top-level side-effect worker instantiation with explicit `initEmailWorkers()` called in `QueueModule.onModuleInit()` **only when** `APP_ROLE` is `all` or `worker`. | Stops HTTP cluster workers from spawning duplicate BullMQ consumers and breaking circuit breakers. |
   | **5** | [logger.ts](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/config/logger.ts) | Include `workerId` / `PID` in log format; prevent shared rotating-file races (per-worker filename suffix when clustered, or IPC/console-only in workers). | Prevents `DailyRotateFile` archive corruption across processes and makes per-worker logs traceable. |
   | **6** | [hybrid-cache.service.ts](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/src/services/cache/hybrid-cache.service.ts) *(optional)* | Broadcast `del()` invalidations across workers via Redis Pub/Sub or `cluster` IPC to clear `localCache` on sibling workers immediately. | Eliminates up-to-15s L1 cache inconsistency across HTTP workers. |
   | **7** | `src/__tests__/app-cluster.service.test.ts` *(new)* | Unit tests mocking `node:cluster` & `os.cpus()` for single-process fallback, primary fork count, crash-loop guard, graceful shutdown, and `getClusterInfo()`. | Meets repo test standards in `src/__tests__/`. |

   ---

   ## 6. Decisions to Finalize Before Implementation

   Before moving to implementation, confirm these 3 design decisions:

   1. **Process Role Strategy (`APP_ROLE`)**:
      - **Option A (Recommended)**: Primary forks `N` HTTP-only API workers + `1` dedicated Queue Worker process (or separate Docker container).
      - **Option B**: Symmetric cluster where every worker runs both HTTP and BullMQ (requires migrating `EmailSenderService` circuit breaker state and queue pause coordination into Redis).
   2. **L1 Cache Consistency (`HybridCacheService`)**:
      - **Option A**: Add cross-worker `del()` invalidation via Redis Pub/Sub / IPC.
      - **Option B**: Accept bounded 15s (`localTtlSeconds`) eventual consistency in L1 cache.
   3. **Cluster Log Routing (`logger.ts`)**:
      - **Option A**: Per-worker rotating log files (e.g. `logs/application-%DATE%-w1.log`) + `[PID]` tag.
      - **Option B**: Workers log to stdout (Docker-friendly) or forward logs to Primary over IPC for a single unified rotating file.

   ---

   ### Post-Approval Documentation Checklist
   Once finalized and implemented, update:
   - [architecture.md](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/docs/architecture.md): Update runtime topology diagram and worker scaling section.
   - [design.md](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/docs/design.md): Document cluster IPC / worker gating & L1 invalidation pattern.
   - [memory.md](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/docs/memory.md): Add ADR 007 (Cluster Mode & Process Role Isolation).
   - [tasks.md](file:///home/shubham/projects/side_hustle/nestjs_boilerplate/docs/tasks.md): Update Multi-Process Worker Scaling status to `[x]`.

# Project Tasks & Roadmap

This document serves as the single source of truth for tracking completed features, ongoing tasks, and future backlog items across the codebase.

---

## Task Status Legend
- `[x]` **Completed**: Tested, verified, and merged.
- `[/]` **In Progress**: Currently under active development or verification.
- `[ ]` **Backlog / Planned**: Prioritized for upcoming development cycles.

---

## 1. Core Framework & Configuration
- [x] Initial NestJS project scaffolding with TypeScript and SWC compilation.
- [x] Environment variable validation using `dotenv` and `class-validator`.
- [x] Global exception filter (`AllExceptionsFilter`) for unified error handling.
- [x] Global response interceptor (`ResponseInterceptor`) for standardized JSON envelope.
- [x] Winston logging infrastructure with daily file rotation (`logs/app-*.log`, `logs/error-*.log`).
- [x] Internationalization module (`I18nProvider`) supporting English (`en`) and Hindi (`hi`).
- [x] Tiered Swagger documentation (Admin, Web, and System scopes).

---

## 2. Database & Data Modeling (Prisma & MongoDB)
- [x] Prisma schema setup with MongoDB datasource.
- [x] User model with authentication tokens and role enum (`user`, `admin`).
- [x] Product catalog models: Category, Product, Image, Highlights, and Specifications.
- [x] Customer engagement models: Review and Ratings.
- [x] Shopping and fulfillment models: Cart, ShippingAddress, Order, and OrderProduct.
- [x] Database seeding scripts (`npm run seed`, `npm run seed:catalog`, `npm run seed:user`).

---

## 3. Authentication & Authorization
- [x] Password hashing with `bcrypt` (10 salt rounds).
- [x] JWT Access and Refresh token generation and verification.
- [x] NestJS `AuthGuard` protecting authenticated endpoints.
- [x] Role-Based Access Control via `@AuthRole` decorator and `RoleGuard`.
- [x] Token refresh and secure user logout handling.

---

## 4. E-Commerce APIs
- [x] Web Auth Controller & Services (login, register, refresh).
- [x] Web Product Catalog Controller & Services with filtering, pagination, and sorting.
- [x] Web Shopping Cart Controller & Services (add, update quantity, remove).
- [x] Web Orders Controller & Services (order placement, history, status updates).
- [x] Web User Profile Controller & Services.
- [x] Admin Auth & User Management APIs.
- [x] Admin Product Management APIs (create, update, soft delete).

---

## 5. Distributed Queue System (BullMQ & Redis)
- [x] BullMQ connection setup and queue definition constants (`QUEUE_NAMES`).
- [x] Multi-queue segregation: `email-critical`, `email-normal`, and `email-bulk`.
- [x] Single-responsibility worker factory (`WorkerFactory`) for unified listener registration.
- [x] Pipeline-based idempotency lock acquisition in `EmailProducer.enqueueBulk()`.
- [x] Multi-provider email fallback service (`SES` $\rightarrow$ `SendGrid` $\rightarrow$ `Mailgun`).
- [x] Per-provider circuit breaker (trips on 3 consecutive failures for 15s).
- [x] System outage circuit breaker (auto-pauses queue on external outage).
- [x] Exponential backoff with jitter retry routing to `email-retry`.
- [x] Dead-Letter Queue (`email-dlq`) for exhausted/permanent failures.
- [x] DLQ inspection and replay service (`DlqReplayService`).
- [x] Asynchronous 1M jobs load test seeder with backpressure throttle (`REDIS_BACKPRESSURE_LIMIT = 50,000`).
- [x] Bull-Board dashboard integration mounted at `/admin/queues`.

---

## 6. Caching & Performance
- [x] In-memory and Redis hybrid caching layer (`HybridCacheService`).
- [x] Pagination snapshot service (`PaginationSnapshotService`) for large catalog queries.
- [x] Redis key generator utility (`CacheKeyService`).
- [x] Automated Redis job eviction via `removeOnComplete` and `removeOnFail`.

---

## 7. Documentation & Architectural Alignment
- [x] Comprehensive Root Documentation folder (`docs/`):
  - [x] `docs/PRD.md`: Product requirements, personas, scope, and NFRs.
  - [x] `docs/architecture.md`: System diagrams, module hierarchy, queues, and tech stack.
  - [x] `docs/design.md`: ERD diagrams, patterns, API contracts, and security design.
  - [x] `docs/memory.md`: Architectural Decision Records (ADRs) and operational constraints.
  - [x] `docs/tasks.md`: Task tracker and milestone tracking.
- [x] High-load execution flow documentation (`execution_flow.md`).

---

## 8. Backlog & Production Hardening
- [ ] **Multi-Process Worker Scaling**: Separate HTTP server and BullMQ workers into independent processes or Docker containers.
- [ ] **Asynchronous Logging Sink**: Stream Winston logs via worker threads or async sinks during 1M load tests to avoid Node.js event-loop stdout saturation.
- [ ] **Metrics & Observability**:
  - [ ] Prometheus metrics exporter for HTTP latency and status codes.
  - [ ] BullMQ Prometheus exporter for queue depth, active workers, and failure rates.
- [ ] **Payment Gateway Integration**: Stripe or Razorpay webhook handling in `OrderModule`.
- [ ] **End-to-End Test Suite**: Comprehensive integration tests for the full checkout and DLQ replay lifecycles.

---

## Maintenance Protocol
Whenever a new feature is designed or implemented:
1. Update `docs/tasks.md` to reflect status changes (`[ ]` $\rightarrow$ `[/]` $\rightarrow$ `[x]`).
2. If new architectural patterns or constraints are introduced, record an ADR in `docs/memory.md`.
3. If API contracts or schemas change, update `docs/design.md`.

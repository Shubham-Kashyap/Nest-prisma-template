# Product Requirements Document (PRD)

## 1. Executive Summary & Vision

The **NestJS Enterprise Boilerplate** is a production-grade, highly scalable backend foundation designed for modern distributed web applications and e-commerce platforms. Built with **NestJS**, **Prisma ORM**, **MongoDB**, **Redis**, and **BullMQ**, it solves the common challenges of enterprise software development: type-safe data modeling, distributed queue processing at scale (1M+ jobs), resilient multi-provider third-party integrations, granular caching, and unified error/response management.

---

## 2. Target Personas & Stakeholders

| Persona | Role | Primary Needs |
| :--- | :--- | :--- |
| **Backend Engineer** | Core developer | Clean modular code, strict TypeScript (`no any`), pre-built authentication, reusable decorators, and clear architectural patterns. |
| **DevOps / SRE** | System stability & deployment | Health checks (Terminus), containerization (Docker Compose), structured rotation logging (Winston), bounded Redis memory footprint. |
| **Administrator** | Business & platform operations | Admin-specific APIs for catalog management, BullMQ queue dashboard (Bull-Board), DLQ inspection, and queue control (pause/resume/replay). |
| **End User / Client** | Web/Mobile customer | Fast response times (<100ms), reliable checkout and cart handling, uninterrupted email deliveries (OTPs, order confirmations). |

---

## 3. Product Scope & Functional Requirements

### 3.1. Authentication & Access Control
- **User Registration & Login**: Email/password authentication with bcrypt hashing (salt rounds configurable).
- **Token Management**: Dual-token architecture with short-lived JWT access tokens and persistent refresh tokens.
- **Role-Based Access Control (RBAC)**: Role guards enforcing access levels (`user`, `admin`) across separate route spaces (`/admin/*` and `/web/*`).
- **Profile & Token Revocation**: Secure logout and session clearing.

### 3.2. E-Commerce Core Domain
- **Product Catalog**:
  - Categorized products with brand, thumbnail, image gallery, highlights, and technical specifications.
  - Soft-deletion support (`isDeleted`) and stock tracking.
- **Shopping Cart**:
  - User-specific cart management with quantity increment/decrement and item removal.
- **Order Management & Fulfillment**:
  - Multi-item checkout linked to shipping addresses and user profiles.
  - Order delivery status lifecycle tracking (`PENDING`, `IN_PROGRESS`, `DELIVERED`, `FAILED`).
- **Reviews & Ratings**:
  - Customer review submission and score aggregation per product.

### 3.3. Distributed Job Queue System (BullMQ & Redis)
- **Priority-Segregated Queues**:
  - `email-critical`: High priority (OTPs, password resets). Low latency, dedicated concurrency.
  - `email-normal`: Standard transactional emails (welcome emails, order updates). Rate-limited.
  - `email-bulk`: Marketing and newsletter campaigns. High concurrency, bulk processing.
  - `email-retry`: Centralized retry queue with BullMQ priority-based escalation.
  - `email-dlq`: Passive dead-letter queue for failed/exhausted jobs with manual or automated replay capabilities.
- **Idempotency Engine**:
  - Distributed lock acquisition using Redis `SET lockKey 1 EX ttl NX` in atomic pipelines before enqueuing to prevent duplicate message ingestion.
- **Backpressure & 1M+ Job Scalability**:
  - Automatic ingestion throttle when waiting queues exceed `REDIS_BACKPRESSURE_LIMIT` (50,000 jobs) to guarantee zero Redis Out-of-Memory (OOM) failures.
- **Operational Controls**:
  - System endpoints to inspect queue health, pause/resume queues, purge queues, and replay DLQ messages.
  - Embedded Bull-Board dashboard for live UI monitoring.

### 3.4. Resilient Email Notification Engine
- **Multi-Provider Fallback**:
  - Waterfall execution: **AWS SES** $\rightarrow$ **SendGrid** $\rightarrow$ **Mailgun**.
- **Circuit Breaker**:
  - Automatic failure counting per provider. Tripping circuit after 3 consecutive failures for a 15-second cooldown period.
- **Outage Protection**:
  - Automatic temporary queue pause when all third-party providers become unavailable.
- **Retry Policy**:
  - Exponential backoff with random jitter up to 5 attempts before quarantine in DLQ.

### 3.5. Caching & Performance
- **Hybrid Caching**: In-memory (L1) and Redis (L2) tiered cache strategies.
- **Pagination Snapshotting**: Cacheable page windowing for heavy catalog lookups.
- **Cache Invalidation**: Tagged and structured key conventions for product catalog updates.

### 3.6. Cross-Cutting Infrastructure
- **Standardized API Response**: Uniform JSON envelope (`{ success, statusCode, message, data, timestamp }`).
- **Global Error Handling**: Comprehensive exception filter catching HttpException, Prisma errors, and unexpected faults.
- **Logging**: Winston logger with daily file rotation (`logs/app-*.log`, `logs/error-*.log`) and contextual metadata.
- **Internationalization (i18n)**: Multi-language support (English `en`, Hindi `hi`) with dependency-injected language provider.
- **API Documentation**: Tiered Swagger documentation (Admin API, Web API, System/Queue API).

---

## 4. Non-Functional Requirements (NFRs)

| Category | Requirement | Target Metric |
| :--- | :--- | :--- |
| **Performance** | API Latency (p95) | $\le 120\text{ ms}$ for read endpoints; $\le 20\text{ ms}$ for load test / queue ingestion trigger. |
| **Scalability** | Mass Job Ingestion | Handle $\ge 1,000,000$ jobs without application crash or Redis OOM. |
| **Availability** | System Uptime | 99.9% uptime target with Terminus health probes (`/health`). |
| **Data Integrity** | Idempotency | 0% duplicate email transmissions for identical idempotency keys. |
| **Code Quality** | Type Safety | Strict TypeScript (`noImplicitAny: true`, zero `any` in `src/`). |
| **Maintainability** | Test Coverage | Unit tests for all helpers, services, and decorators under `src/__tests__/`. |

---

## 5. Success Criteria & Milestones

1. **Phase 1 (Complete)**: Foundational setup — Prisma MongoDB schemas, auth modules, catalog and order APIs, global response wrappers, and Winston logging.
2. **Phase 2 (Complete)**: Advanced Queues — BullMQ multi-queue architecture, idempotency pipelines, circuit breakers, DLQ replay, and 1M job backpressure engine.
3. **Phase 3 (Current)**: Enterprise Documentation & Standardization — Comprehensive PRD, Architecture, Design, Memory, and Task tracking files.
4. **Phase 4 (Next)**: Production Hardening — Cluster worker scaling, telemetry/metrics exporter, payment gateway integration, and E2E test suites.

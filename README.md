# 🚀 NestJS Enterprise Boilerplate

![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)
![License: UNLICENSED](https://img.shields.io/badge/License-UNLICENSED-yellow.svg)

A **clean, type‑safe** NestJS backend powered by Prisma (MongoDB). It ships with:
- **Global response interceptor** for uniform API responses.
- **Winston logger** that records incoming requests and errors.
- **Injectable i18n** (`I18nProvider`) – keys are generated automatically from locale files.
- **Role‑based Swagger docs** (admin, web, system) with inline descriptions.
- **Redis caching** utilities (hybrid cache, pagination snapshot, etc.).
- **Strict TypeScript** – no `any` in the `src/` folder.

---
## ⚡Introduction
Production-ready NestJS starter template with MongoDB, Prisma, Redis, BullMQ, Swagger, Docker, Jest, i18n, Winston logging, caching, and scalable architecture.

## ✨ Highlights

- **Environment validation** – missing env vars abort startup with a clear log.
- **Http‑Context helper** – unified extraction of `request`/`response` from both `ExecutionContext` and `ArgumentsHost`.
- **Test layout** – all Jest tests live under `src/__tests__/` (the old `test/` folder can be retired).
- **Swagger** – descriptions are defined inline in `src/constants/swagger.ts` (easy to externalise later).

---

## 📂 Directory Structure

```
src/
│   app.module.ts
│   main.ts
│   ...
│
├─ config/                 # dot‑env config, optional swagger JSON
│   └─ dot-env.ts
│
├─ constants/              # enums, messages, swagger helpers
│   ├─ enum.ts
│   ├─ messages.ts
│   └─ swagger.ts          # inline API_PROPERTIES & DEFAULT_VALUES
│
├─ decorators/             # custom Nest decorators
│
├─ filters/                # global exception filter
│
├─ helpers/                # swagger.helper, message.helper
│
├─ i18n/                   # locale files (en.ts, hi.ts)
│
├─ modules/                # feature modules (admin, web, system, …)
│
├─ services/               # business logic
│   └─ i18n.provider.ts   # injectable translation provider (DI)
│
├─ utilities/              # pure utility functions
│   ├─ http-context.ts    # extractHttpContext helper
│   ├─ i18n.ts            # generateKeys, resolveLanguage, translate
│   └─ response.ts        # ResponseHelper class using DI & http‑context
│
└─ __tests__/              # Jest unit tests (mirrors src structure)
```

### What is `src/__tests__/` for?
- Holds **Jest unit tests** for pure functions, services, decorators, and helpers.
- Running `npm run test` or `npm run test:cov` automatically discovers any `*.test.ts` files here.
- Keeping tests next to the code they verify improves discoverability and encourages higher coverage.

---

## 🔧 Setup & Installation

```bash
# Clone the repository
git clone https://github.com/Shubham-Kashyap/Nest-prisma-template.git <your-folder-name>
cd <your-folder-name>

# Install dependencies
npm install

# Create a .env file (see .env.example) – missing variables will stop the app.
cp .env.example .env
```

## ▶️ Run the app
```bash
npm run dev   # Development mode (hot‑reload)
npm run start # Production mode
```

## 🧪 Testing & Coverage
```bash
npm run test          # Unit tests
npm run test:cov      # Unit tests with coverage report
```

---

## 📚 Swagger Documentation
Separate Swagger UIs are provided:
- **Admin** – `http://localhost:5000/api/doc/admin/`
- **Web**   – `http://localhost:5000/api/doc/web/`
- **System** – `http://localhost:5000/api/doc/system/`

Descriptions are defined inline in `src/constants/swagger.ts` under `API_PROPERTIES`. If you prefer external JSON, simply create a JSON file and import it – the project is ready for that.

---

## 🌍 Internationalisation (i18n)
- Locale files live in `src/i18n/locales/` (`en.ts`, `hi.ts`).
- `generateKeys` creates a **dot‑notation key map** exported as `MESSAGES`.
- `I18nProvider` (`src/services/i18n.provider.ts`) is the injectable layer used by controllers and the `ResponseHelper`. Swap it out for any other translation engine without touching business logic.

---

## 🪵 Logging (Winston)
- A **Winston logger** is configured in `src/config/logger.ts`.
- It logs request details, errors, and custom messages with timestamps and appropriate log levels.
- Logs can be directed to console, files, or external services (e.g., Elasticsearch) by adjusting the transports.

---

## 📦 Caching
- Redis utilities (`src/services/redis.service.ts`, `src/utilities/response.ts`) provide hybrid caching, pagination snapshots, and item‑TTL management.
- Default TTLs are configurable via environment variables and validated at startup.

---

## 🚀 Queue System & Resiliency (BullMQ)
- **High-Throughput Queues**: Channel isolation for email, SMS, and push notifications with dedicated execution tiers (Critical, Normal, Bulk, Retry, DLQ).
- **Provider Failover**: Built-in logic to cascade through fallback providers (e.g., SES -> Sendgrid -> Mailgun) seamlessly.
- **Circuit Breaker**: Detects provider outages, trips dynamically, and pauses entire queues to apply backpressure and prevent retry floods.
- **Thundering Herd Mitigation**: Retries implement exponential backoff combined with randomized jitter.
- **Failure Routing**: Intelligent routing splits transient failures (Retry Queue) from permanent failures (Dead Letter Queue) to prevent queue contamination.

---

## 📈 Quick Benchmark
| Dimension | Score |
|-----------|------|
| Coding Standards | 78 |
| Code Quality / Coverage | 72 |
| Scalability | 71 |
| Maintainability | 75 |

Increasing test coverage and externalising more configuration will push these numbers higher.

---

## 👤 Author
- **Shubham Kashyap** – [GitHub](https://github.com/Shubham-Kashyap) | [LinkedIn](https://in.linkedin.com/in/shubham-kashyap-58a310175)

---

## ⭐ Show your support
If this project helped you, give it a star! :)


---
name: file-organization
description: Establish scalable project structures with standardized naming conventions and folder organization patterns for React/Next.js and Node.js/Express applications.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Project File Organization

## When to use this skill
- **New Projects:** For initial folder structure design.
- **Project Growth:** When refactoring to manage increasing complexity.
- **Team Standardization:** To establish a consistent and shared structure.

## Instructions

### Step 1: React/Next.js Project Structure
```
src/
├── app/                      # Next.js 13+ App Router
│   ├── (auth)/               # Route groups
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── settings/
│   ├── api/                  # API routes
│   │   ├── auth/
│   │   └── users/
│   └── layout.tsx
│
├── components/               # UI Components
│   ├── ui/                   # Reusable UI (Button, Input)
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   └── Input/
│   ├── layout/               # Layout components (Header, Footer)
│   ├── features/             # Feature-specific components
│   │   ├── auth/
│   │   └── dashboard/
│   └── shared/               # Shared across features
│
├── lib/                      # Utilities & helpers
│   ├── utils.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useLocalStorage.ts
│   └── api/
│       └── client.ts
│
├── store/                    # State management
│   ├── slices/
│   │   ├── authSlice.ts
│   │   └── userSlice.ts
│   └── index.ts
│
├── types/                    # TypeScript types
│   ├── api.ts
│   ├── models.ts
│   └── index.ts
│
├── config/                   # Configuration
│   ├── env.ts
│   └── constants.ts
│
└── styles/                   # Global styles
    ├── globals.css
    └── theme.ts
```

### Step 2: Node.js/Express Backend Structure
```
src/
├── api/                      # API layer
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   └── index.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── user.controller.ts
│   └── middlewares/
│       ├── auth.middleware.ts
│       ├── errorHandler.ts
│       └── validation.ts
│
├── services/                 # Business logic
│   ├── auth.service.ts
│   ├── user.service.ts
│   └── email.service.ts
│
├── repositories/             # Data access layer
│   ├── user.repository.ts
│   └── session.repository.ts
│
├── models/                   # Database models
│   ├── User.ts
│   └── Session.ts
│
├── database/                 # Database setup
│   ├── connection.ts
│   ├── migrations/
│   └── seeds/
│
├── utils/                    # Utilities
│   ├── logger.ts
│   ├── crypto.ts
│   └── validators.ts
│
├── config/                   # Configuration
│   ├── index.ts
│   ├── database.ts
│   └── env.ts
│
├── types/                    # TypeScript types
│   ├── express.d.ts
│   └── models.ts
│
├── __tests__/                # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── index.ts                  # Entry point
```

### Step 3: Feature-Based Structure (Large-Scale Apps)
```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── api/
│   │   │   └── authApi.ts
│   │   ├── store/
│   │   │   └── authSlice.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   └── index.ts
│   │
│   ├── products/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── types/
│   │
│   └── orders/
│
├── shared/                   # Shared across features
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
│
└── core/                     # App-wide
    ├── store/
    ├── router/
    └── config/
```

### Step 4: Naming Conventions

**File Names:**
- **Components:** `PascalCase.tsx`
- **Hooks:** `camelCase.ts` (e.g., `useAuth.ts`)
- **Utils:** `camelCase.ts` (e.g., `formatDate.ts`)
- **Constants:** `UPPER_SNAKE_CASE.ts` (e.g., `API_ENDPOINTS.ts`)
- **Types:** `camelCase.types.ts` (e.g., `user.types.ts`)
- **Tests:** `*.test.ts`, `*.spec.ts`

**Folder Names:**
- `kebab-case`: `user-profile/`
- `camelCase`: `userProfile/` (optional: hooks/, utils/)
- `PascalCase`: `UserProfile/` (optional: components/)

✅ Consistency is key (entire team uses the same rules)

**Variable/Function Names:**
```typescript
// Components: PascalCase
const UserProfile = () => {};

// Functions: camelCase
function getUserById() {}

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';

// Private: _prefix (optional)
class User {
  private _id: string;

  private _hashPassword() {}
}

// Booleans: is/has/can prefix
const isAuthenticated = true;
const hasPermission = false;
const canEdit = true;
```

### Step 5: `index.ts` Barrel Files

`components/ui/index.ts`:
```typescript
// ✅ Good example: Re-export named exports
export { Button } from './Button/Button';
export { Input } from './Input/Input';
export { Modal } from './Modal/Modal';

// Usage:
import { Button, Input } from '@/components/ui';
```

```typescript
// ❌ Bad example: Re-export everything (impairs tree-shaking)
export * from './Button';
export * from './Input';
```

## Constraints
- **Required Rules (MUST):**
  - **Consistency:** The entire team MUST use the same naming and structure rules.
  - **Clear Folder Names:** Folder names MUST be explicit about their role (e.g., `components`, `hooks`, `services`).
  - **Max Depth:** Recommend a maximum depth of 5 levels or fewer to maintain clarity.
- **Prohibited (MUST NOT):**
  - **Excessive Nesting:** Folder depth MUST NOT exceed 7 levels.
  - **Vague Names:** Avoid generic names like `utils2/`, `helpers/`, or `misc/`.
  - **Circular Dependencies:** Module imports MUST NOT create circular references (e.g., A → B → A).

## Best practices
- **Colocation:** Keep related files close together (e.g., component, its styles, and its tests).
- **Feature-Based Modularity:** For larger applications, modularize the codebase by feature.
- **Path Aliases:** Use path aliases in `tsconfig.json` to simplify imports.

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"]
    }
  }
}
```

**Usage:**
```typescript
// ❌ Bad example
import { Button } from '../../../components/ui/Button';

// ✅ Good example
import { Button } from '@/components/ui';
```

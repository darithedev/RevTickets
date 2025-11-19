# RevTickets Wiki - Action Items & Implementation Approaches

**Status**: Planning & Implementation Phase
**Branch**: `claude/wiki-action-items-01E49T2L7i7LKzXTo4HKNTJo`
**Last Updated**: 2025-11-19

---

## Overview

This document addresses the 5 **Future Considerations** identified in `frontend/PROJECT_STRUCTURE.md`. Each section includes:
- **Current State**: What exists today
- **Problem Statement**: Why it's needed
- **Recommended Approach**: Specific strategy and rationale
- **Implementation Steps**: Concrete actions
- **Success Criteria**: How to validate completion

---

## 1. State Management with Redux Toolkit vs Zustand

### Current State
- **Framework**: Context API + useReducer (AuthContext) + useState (ThemeContext)
- **Data Flow**: Direct API calls from components + Axios interceptors
- **Caching**: None - every component refetches independently
- **Devtools**: None - no Redux DevTools or similar

### Problem Statement
- **Data duplication**: Multiple components fetch the same tickets/categories
- **Cache invalidation**: No pattern for updating stale data
- **Request deduplication**: Network calls not prevented on rapid changes
- **Debugging**: Difficult to trace state changes across the app
- **Optimistic updates**: No way to show pending changes before server confirmation

### Recommended Approach: **Zustand**

**Rationale**:
- **Simplicity**: Minimal boilerplate vs Redux (7KB vs 62KB)
- **Perfect fit**: Project is mid-scale (3 main contexts, not enterprise-level)
- **Minimal API**: Easier to teach/maintain than Redux middleware ecosystem
- **DevTools support**: Has browser extension support (like Redux)
- **Middleware pattern**: Supports persistence, devtools, and custom middleware
- **Learning curve**: Lower than Redux Toolkit + Redux Thunk/Saga

**Why NOT Redux Toolkit**:
- Overkill for current project size
- More boilerplate (actions, reducers, slices)
- Steeper learning curve for new developers

### Implementation Steps

#### Phase 1: Audit & Design (Immediate)
1. **List all global state needs**:
   - User authentication (exists in AuthContext)
   - Tickets list & details (currently fetched per-component)
   - Categories list (currently fetched per-component)
   - UI state (filters, pagination, sort)
   - Theme preference (exists in ThemeContext)

2. **Identify data relationships**:
   - Tickets depend on Categories
   - User role determines visible actions
   - Filters/pagination affect ticket list
   - Theme is purely UI state

3. **Map API endpoints to stores**:
   - `/api/tickets` → `useTicketsStore`
   - `/api/categories` → `useCategoriesStore`
   - `/api/auth/*` → `useAuthStore`
   - UI state → `useUIStore`

#### Phase 2: Setup Zustand (Next)
1. **Install Zustand**:
   ```bash
   npm install zustand
   ```

2. **Create store structure**:
   ```
   src/lib/stores/
   ├── authStore.ts          # User auth, login/logout
   ├── ticketsStore.ts       # Tickets CRUD + filtering
   ├── categoriesStore.ts    # Categories CRUD
   ├── uiStore.ts            # Pagination, filters, sort
   └── index.ts              # Export all stores
   ```

3. **Example: `authStore.ts` migration from AuthContext**
   ```typescript
   import { create } from 'zustand';
   import { persist } from 'zustand/middleware';

   interface AuthState {
     user: User | null;
     isAuthenticated: boolean;
     isLoading: boolean;
     error: string | null;
     login: (email: string, password: string) => Promise<void>;
     logout: () => void;
     validateToken: () => Promise<void>;
   }

   export const useAuthStore = create<AuthState>()(
     persist(
       (set) => ({
         user: null,
         isAuthenticated: false,
         isLoading: false,
         error: null,
         login: async (email, password) => {
           set({ isLoading: true, error: null });
           try {
             const response = await authApi.login(email, password);
             set({
               user: response.user,
               isAuthenticated: true,
               isLoading: false,
             });
           } catch (err) {
             set({
               error: err.message,
               isLoading: false,
             });
           }
         },
         logout: () => set({ user: null, isAuthenticated: false }),
         validateToken: async () => {
           // Implementation
         },
       }),
       { name: 'auth-store' }
     )
   );
   ```

#### Phase 3: Caching & Optimization
1. **Implement cache invalidation pattern**:
   ```typescript
   // In useTicketsStore
   const invalidateTickets = () => set({ cachedAt: null });
   const fetchTickets = async () => {
     if (isCacheValid()) return getTickets();
     // Fetch new data
   };
   ```

2. **Add request deduplication**:
   - Use `AbortController` in stores
   - Cancel previous requests when new ones start

3. **Implement optimistic updates**:
   ```typescript
   const updateTicket = async (id, data) => {
     const oldTicket = getState().getTicket(id);
     set({ updateOptimistic: data });
     try {
       await api.updateTicket(id, data);
       set({ updateSuccess: true });
     } catch {
       set({ tickets: oldTicket }); // Rollback
     }
   };
   ```

#### Phase 4: Migration (Gradual)
1. **Start with one store**: Migrate AuthContext → `useAuthStore`
2. **Update components**: Replace `useAuth()` → `useAuthStore()`
3. **Test thoroughly**: Ensure all auth flows work
4. **Repeat for each store**: TicketsStore, CategoriesStore, UIStore
5. **Remove Context files**: Clean up old AuthContext/ThemeContext

### Success Criteria
- ✅ All state centralized in Zustand stores
- ✅ No prop drilling for global state
- ✅ Zustand DevTools showing state changes
- ✅ No performance regressions (same or faster)
- ✅ Tests passing for all migrations

### Files to Create/Modify
- **Create**: `src/lib/stores/authStore.ts`
- **Create**: `src/lib/stores/ticketsStore.ts`
- **Create**: `src/lib/stores/categoriesStore.ts`
- **Create**: `src/lib/stores/uiStore.ts`
- **Create**: `src/lib/stores/index.ts`
- **Modify**: `frontend/package.json` (add zustand)
- **Modify**: `app/layout.tsx` (remove AuthContext/ThemeContext if migrated)
- **Modify**: Component files (replace context hooks with store hooks)
- **Update**: `frontend/PROJECT_STRUCTURE.md`

---

## 2. Form Validation with React Hook Form + Zod

### Current State
- **Framework**: Native HTML inputs + Manual validation
- **Error handling**: Each component manages its own form state
- **Validation**: Inline checks or server-side only
- **Dependencies**: None (no React Hook Form, Zod, Yup, etc.)

### Problem Statement
- **Repetition**: Form validation logic duplicated across components
- **Error messages**: Not consistently formatted or displayed
- **User experience**: Validation happens on blur/submit, not real-time
- **Type safety**: Form field types not validated at compile time
- **Server sync**: No clear pattern for handling server validation errors

### Recommended Approach: **React Hook Form + Zod**

**Rationale**:
- **Performance**: Minimal re-renders (uncontrolled forms by default)
- **Bundle size**: Smaller than Formik (8.5KB vs 15KB)
- **DX**: Intuitive API, minimal code needed
- **Zod**: TypeScript-first schema validation, amazing inference
- **Ecosystem**: Excellent community, mature, widely adopted

### Implementation Steps

#### Phase 1: Setup
1. **Install dependencies**:
   ```bash
   npm install react-hook-form zod @hookform/resolvers
   ```

2. **Create validation schema structure**:
   ```
   src/lib/schemas/
   ├── auth.schemas.ts       # Login, signup, password reset
   ├── ticket.schemas.ts     # Create, update ticket
   ├── category.schemas.ts   # Create, update category
   └── index.ts              # Export all schemas
   ```

#### Phase 2: Example Implementation - Login Form

**1. Create schema** (`src/lib/schemas/auth.schemas.ts`):
```typescript
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export type LoginFormData = z.infer<typeof LoginSchema>;
```

**2. Create hook wrapper** (`src/app/shared/hooks/useLoginForm.ts`):
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, type LoginFormData } from '@/lib/schemas/auth.schemas';

export function useLoginForm() {
  return useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    mode: 'onBlur', // Validate on blur for better UX
    defaultValues: {
      email: '',
      password: '',
    },
  });
}
```

**3. Use in component**:
```typescript
export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useLoginForm();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await authApi.login(data);
    } catch (error) {
      // Handle server errors
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('email')}
        placeholder="Email"
        className={errors.email ? 'error' : ''}
      />
      {errors.email && <span>{errors.email.message}</span>}

      <input
        {...register('password')}
        type="password"
        placeholder="Password"
        className={errors.password ? 'error' : ''}
      />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

#### Phase 3: Create Reusable Form Components
1. **FormField wrapper** - Handles label, error display, styling
2. **FormInput** - Input + validation display
3. **FormSelect** - Select + validation display
4. **FormTextarea** - Textarea + validation display

**Example** (`src/app/shared/components/FormField.tsx`):
```typescript
interface FormFieldProps {
  label: string;
  error?: FieldError;
  children: React.ReactNode;
  required?: boolean;
}

export function FormField({
  label,
  error,
  children,
  required,
}: FormFieldProps) {
  return (
    <div className="form-group">
      <label>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="error-message">{error.message}</p>}
    </div>
  );
}
```

#### Phase 4: Server-Side Error Handling
Implement pattern for server validation errors:

```typescript
async function handleFormError(error, form) {
  if (error.response?.status === 422) {
    // Validation error
    const fieldErrors = error.response.data.errors;
    Object.entries(fieldErrors).forEach(([field, message]) => {
      form.setError(field, { message });
    });
  }
}
```

#### Phase 5: Apply to All Forms
1. **Auth forms**: Login, signup, password reset
2. **Ticket forms**: Create, update, reply
3. **Category forms**: Create, update
4. **Article forms**: Create, update

### Success Criteria
- ✅ All forms use React Hook Form
- ✅ Zod schemas for all form data
- ✅ Consistent error display UI
- ✅ Server validation errors integrated
- ✅ Real-time validation working
- ✅ No external validation dependencies (Yup, etc.)

### Files to Create/Modify
- **Create**: `src/lib/schemas/` directory with schema files
- **Create**: `src/app/shared/components/FormField.tsx`
- **Create**: `src/app/shared/components/form/` subdirectory for reusable inputs
- **Create**: Custom hooks in `src/app/shared/hooks/` for each form
- **Modify**: `frontend/package.json`
- **Modify**: All form components in features (tickets, categories, auth)
- **Update**: `frontend/PROJECT_STRUCTURE.md`

---

## 3. Testing Structure with Jest and React Testing Library

### Current State
- **Framework**: No testing framework installed
- **Test files**: None in the project
- **Coverage**: 0%
- **CI/CD**: No automated test runs

### Problem Statement
- **No safety net**: Changes risk breaking existing functionality
- **Regression risk**: No way to catch bugs automatically
- **Refactoring fear**: Difficult to improve code with confidence
- **Documentation**: Code behavior not documented through tests
- **Quality gates**: No automated checks before deployment

### Recommended Approach: **Jest + React Testing Library**

**Rationale**:
- **Testing library philosophy**: "Test behavior, not implementation"
- **Jest**: Official React testing standard, zero-config with Next.js
- **React Testing Library**: Encourages best practices (accessibility-focused)
- **Bundle**: Small overhead, good DX

### Implementation Steps

#### Phase 1: Setup
1. **Install testing dependencies**:
   ```bash
   npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
   ```

2. **Create Jest configuration** (`jest.config.ts`):
   ```typescript
   import type { Config } from 'jest';
   import nextJest from 'next/jest.js';

   const createJestConfig = nextJest({
     dir: './',
   });

   const config: Config = {
     coverageProvider: 'v8',
     testEnvironment: 'jsdom',
     setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
     moduleNameMapper: {
       '^@/(.*)$': '<rootDir>/src/$1',
     },
   };

   export default createJestConfig(config);
   ```

3. **Create setup file** (`jest.setup.ts`):
   ```typescript
   import '@testing-library/jest-dom';
   ```

4. **Update package.json scripts**:
   ```json
   {
     "scripts": {
       "test": "jest",
       "test:watch": "jest --watch",
       "test:coverage": "jest --coverage"
     }
   }
   ```

#### Phase 2: Create Test Structure
```
src/
├── app/shared/components/__tests__/
│   ├── Badge.test.tsx
│   ├── Header.test.tsx
│   ├── LoadingSpinner.test.tsx
│   └── StatusBadge.test.tsx
│
├── app/features/tickets/__tests__/
│   ├── TicketList.test.tsx
│   ├── TicketDetail.test.tsx
│   └── CreateTicketForm.test.tsx
│
├── lib/
│   ├── api/__tests__/
│   │   ├── client.test.ts
│   │   └── tickets.test.ts
│   └── utils/__tests__/
│       ├── date.test.ts
│       └── formatting.test.ts
```

#### Phase 3: Test Categories & Examples

**A. Unit Tests** - Utils, Hooks
```typescript
// src/lib/utils/__tests__/formatting.test.ts
import { formatTicketId, formatDate } from '@/lib/utils/formatting';

describe('formatTicketId', () => {
  it('should format ticket ID as TKT-XXXX', () => {
    expect(formatTicketId('507f1f77bcf86cd799439011')).toBe('TKT-507f');
  });

  it('should handle short IDs gracefully', () => {
    expect(formatTicketId('abc')).toBe('TKT-abc');
  });
});
```

**B. Component Tests** - UI interactions
```typescript
// src/app/shared/components/__tests__/Badge.test.tsx
import { render, screen } from '@testing-library/react';
import { Badge } from '@/app/shared/components/ui/Badge';

describe('Badge', () => {
  it('renders with correct text', () => {
    render(<Badge variant="success">Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies correct variant class', () => {
    render(<Badge variant="danger">Critical</Badge>);
    const badge = screen.getByText('Critical');
    expect(badge).toHaveClass('badge-danger');
  });
});
```

**C. Integration Tests** - Multiple components, API mocking
```typescript
// src/app/features/tickets/__tests__/TicketList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { TicketList } from '../TicketList';

// Mock the API
jest.mock('@/lib/api/tickets');

describe('TicketList', () => {
  beforeEach(() => {
    const { ticketsApi } = require('@/lib/api/tickets');
    ticketsApi.getTickets.mockResolvedValue([
      { id: '1', title: 'Test Ticket', status: 'open' },
    ]);
  });

  it('displays tickets from API', async () => {
    render(<TicketList />);

    await waitFor(() => {
      expect(screen.getByText('Test Ticket')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(<TicketList />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

**D. Hook Tests** - Custom React hooks
```typescript
// src/app/shared/hooks/__tests__/useLocalStorage.test.ts
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/app/shared/hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists and retrieves values', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'initial'));

    expect(result.current[0]).toBe('initial');

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem('key')).toBe('updated');
  });
});
```

#### Phase 4: Test Coverage Goals
- **Utilities**: 90%+ coverage (pure functions)
- **Components**: 70%+ coverage (focus on behavior, not implementation)
- **Hooks**: 80%+ coverage
- **API services**: Mocked, test error handling
- **Pages**: Smoke tests (render without crashing)

#### Phase 5: CI/CD Integration
1. **Add GitHub Actions** (`.github/workflows/test.yml`):
   ```yaml
   name: Tests
   on: [push, pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: 20
         - run: npm ci
         - run: npm run test:coverage
         - uses: codecov/codecov-action@v3
   ```

2. **Fail build if coverage drops**:
   ```bash
   jest --coverage --coverageReporters=text-summary
   ```

### Success Criteria
- ✅ Jest configured and working
- ✅ 20+ tests written for critical paths
- ✅ At least 50% code coverage
- ✅ All tests passing in CI/CD
- ✅ Test patterns documented in wiki
- ✅ New PRs require test updates

### Files to Create/Modify
- **Create**: `jest.config.ts`
- **Create**: `jest.setup.ts`
- **Create**: `src/**/__tests__/` directories with test files
- **Create**: `.github/workflows/test.yml` (for CI)
- **Modify**: `frontend/package.json`
- **Update**: `frontend/PROJECT_STRUCTURE.md`
- **Create**: `TESTING_GUIDE.md` (how to write tests)

---

## 4. Storybook for Component Documentation

### Current State
- **Components**: Developed in isolation without documentation
- **Stories**: No interactive component library
- **Documentation**: Basic prop types in code only
- **Review**: Designers/PMs must clone repo and run dev server

### Problem Statement
- **Component reusability**: Unclear which components exist and how to use them
- **Design consistency**: Hard to ensure UI consistency across the app
- **Collaboration**: Non-developers can't easily preview components
- **Onboarding**: New developers must explore code to understand components
- **Variants**: Not documented (different states, sizes, colors)

### Recommended Approach: **Storybook 8.x with React**

**Rationale**:
- **De facto standard**: Industry standard for component documentation
- **Modern**: Storybook 8.x has excellent React support
- **Visual testing**: Can detect visual regressions
- **Interactive**: Developers and designers can interact with components
- **CI-ready**: Can publish to Chromatic for review workflow

### Implementation Steps

#### Phase 1: Setup Storybook
1. **Initialize Storybook**:
   ```bash
   npx storybook@latest init
   ```
   (This auto-detects Next.js and configures accordingly)

2. **Update `.storybook/main.ts`**:
   ```typescript
   import type { StorybookConfig } from '@storybook/nextjs';

   const config: StorybookConfig = {
     framework: '@storybook/nextjs',
     stories: ['../src/**/*.stories.ts?(x)'],
     addons: [
       '@storybook/addon-links',
       '@storybook/addon-essentials',
       '@storybook/addon-a11y',
     ],
     staticDirs: ['../public'],
   };

   export default config;
   ```

3. **Create `.storybook/preview.ts`**:
   ```typescript
   import type { Preview } from '@storybook/react';
   import '../app/globals.css';

   const preview: Preview = {
     parameters: {
       actions: { argTypesRegex: '^on[A-Z].*' },
       controls: {
         matchers: {
           color: /(background|color)$/i,
           date: /Date$/,
         },
       },
     },
   };

   export default preview;
   ```

4. **Add npm scripts**:
   ```json
   {
     "scripts": {
       "storybook": "storybook dev -p 6006",
       "build-storybook": "storybook build"
     }
   }
   ```

#### Phase 2: Story Structure
```
src/
├── app/shared/components/ui/
│   ├── Badge.tsx
│   ├── Badge.stories.tsx        ← Story file
│   ├── StatusBadge.tsx
│   └── StatusBadge.stories.tsx
│
├── app/shared/components/
│   ├── Header.tsx
│   ├── Header.stories.tsx
│   ├── Sidebar.tsx
│   └── Sidebar.stories.tsx
```

#### Phase 3: Story Examples

**A. Simple Component Story** (`Badge.stories.tsx`):
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'success', 'danger', 'warning'],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Badge',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Critical',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-x-2">
      <Badge variant="primary">Primary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="warning">Warning</Badge>
    </div>
  ),
};
```

**B. Complex Component Story** (`TicketCard.stories.tsx`):
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { TicketCard } from './TicketCard';

const meta = {
  title: 'Features/Tickets/TicketCard',
  component: TicketCard,
  tags: ['autodocs'],
} satisfies Meta<typeof TicketCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockTicket = {
  id: '507f1f77bcf86cd799439011',
  title: 'Payment gateway integration failing',
  status: 'open' as const,
  priority: 'high' as const,
  createdAt: new Date('2024-01-15'),
  category: { id: '1', name: 'Billing' },
};

export const Open: Story = {
  args: { ticket: mockTicket },
};

export const Resolved: Story = {
  args: {
    ticket: { ...mockTicket, status: 'resolved' },
  },
};

export const HighPriority: Story = {
  args: {
    ticket: { ...mockTicket, priority: 'critical' },
  },
};
```

**C. Interactive Story with Actions**:
```typescript
export const Interactive: Story = {
  args: mockTicket,
  argTypes: {
    onEdit: { action: 'edit clicked' },
    onDelete: { action: 'delete clicked' },
  },
  render: (args) => (
    <TicketCard
      {...args}
      onEdit={() => console.log('Edit')}
      onDelete={() => console.log('Delete')}
    />
  ),
};
```

#### Phase 4: Documentation Pages
Create Markdown pages for design system docs:

**`.storybook/stories/Introduction.mdx`**:
```mdx
# RevTickets Component Library

Welcome to the RevTickets component documentation.

## Getting Started

All components are organized by feature:
- **Shared Components** - Used across the app
- **Feature Components** - Specific to tickets, categories, etc.
- **UI Primitives** - Basic building blocks

## Design Principles

1. **Accessibility First** - All components must meet WCAG 2.1 AA
2. **Mobile Responsive** - Design mobile-first
3. **Consistent Spacing** - Use Tailwind spacing scale
4. **Type Safe** - Full TypeScript support
```

#### Phase 5: Storybook Deployment (Optional)
1. **Chromatic integration** (visual testing + deployment):
   ```bash
   npm install -D chromatic
   npx chromatic --project-token=<token>
   ```

2. **GitHub Actions workflow**:
   ```yaml
   name: Chromatic
   on: [push, pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
         - run: npm ci
         - run: npx chromatic --project-token=${{ secrets.CHROMATIC_TOKEN }}
   ```

### Success Criteria
- ✅ Storybook running locally (`npm run storybook`)
- ✅ Stories for 100% of shared UI components
- ✅ Stories for 80%+ of feature-specific components
- ✅ All stories have proper documentation
- ✅ Stories demonstrate multiple variants/states
- ✅ Storybook builds without errors

### Files to Create/Modify
- **Create**: `.storybook/` directory with config
- **Create**: `src/**/*.stories.tsx` for each component
- **Create**: `.storybook/stories/` with MDX documentation
- **Modify**: `frontend/package.json`
- **Update**: `frontend/PROJECT_STRUCTURE.md`

---

## 5. Bundle Analysis and Optimization

### Current State
- **Build output**: No analysis of bundle size
- **Code splitting**: Using Next.js defaults
- **Optimization**: Only Tailwind purging
- **Monitoring**: No metrics on bundle growth

### Problem Statement
- **Unknown baseline**: Don't know current bundle size
- **Silent growth**: Adding dependencies doesn't trigger warnings
- **Performance risk**: Larger bundles = slower load times
- **Mobile impact**: Users on slow networks affected
- **Regression risk**: No detection when bundle grows unexpectedly

### Recommended Approach: **Bundle Analysis with next/bundle-analyzer**

**Rationale**:
- **Official**: Part of Next.js ecosystem
- **Visualization**: Understand what's in the bundle
- **Actionable**: Identify large dependencies
- **Integration**: Works seamlessly with build process

### Implementation Steps

#### Phase 1: Setup Bundle Analyzer
1. **Install package**:
   ```bash
   npm install -D @next/bundle-analyzer
   ```

2. **Create `next.config.ts`** (if not exists):
   ```typescript
   import withBundleAnalyzer from '@next/bundle-analyzer';

   const withAnalyzer = withBundleAnalyzer({
     enabled: process.env.ANALYZE === 'true',
   });

   export default withAnalyzer({
     // ... other Next.js config
   });
   ```

3. **Add npm script**:
   ```json
   {
     "scripts": {
       "analyze": "ANALYZE=true npm run build"
     }
   }
   ```

4. **Run analyzer**:
   ```bash
   npm run analyze
   ```

#### Phase 2: Bundle Size Benchmarking
1. **Document baseline** (`BUNDLE_SIZE.md`):
   ```markdown
   # Bundle Size Tracking

   ## Latest Build (2025-11-19)
   - **Client**: 145.2 KB (gzipped)
   - **Server**: 82.3 KB
   - **Largest packages**:
     1. flowbite-react: 38.2 KB
     2. axios: 15.4 KB
     3. date-fns: 12.1 KB
     4. lucide-react: 8.9 KB
   ```

2. **Set size budgets** in Next.js config:
   ```typescript
   {
     onDemandEntries: {
       maxInactiveAge: 15 * 1000,
       pagesBufferLength: 5,
     },
     experimental: {
       outputFileTracingIncludes: {},
     },
   }
   ```

#### Phase 3: Optimization Strategies

**Strategy 1: Code Splitting**
- Next.js already does route-based splitting
- Ensure no blocking code in component trees
- Use dynamic imports for heavy features:

```typescript
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  loading: () => <div>Loading editor...</div>,
  ssr: false, // Don't SSR heavy components
});
```

**Strategy 2: Dependency Audit**
1. **Check for duplicates**:
   ```bash
   npm ls
   ```

2. **Identify unused packages**:
   ```bash
   npx depcheck
   ```

3. **Check package sizes**:
   ```bash
   npm ls --depth=0 --long
   ```

**Strategy 3: Optimize Key Dependencies**

| Package | Size | Optimization |
|---------|------|--------------|
| flowbite-react | 38.2 KB | Use tree-shaking, import only needed components |
| axios | 15.4 KB | Consider `fetch` API for new code |
| date-fns | 12.1 KB | Use only needed utilities with plugins |
| lucide-react | 8.9 KB | Tree-shaking works well, good as-is |

**Example - Optimize date-fns**:
```typescript
// ❌ Bad: Imports all of date-fns
import { format, parse, addDays } from 'date-fns';

// ✅ Good: Imports only needed functions
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
```

**Strategy 4: Image Optimization**
- Use Next.js `Image` component (automatic optimization)
- Implement lazy loading
- Provide responsive srcSet

```typescript
import Image from 'next/image';

export function Avatar({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={40}
      height={40}
      priority={false} // Lazy load
    />
  );
}
```

#### Phase 4: Monitoring
1. **GitHub Actions workflow** (`analytics.yml`):
   ```yaml
   name: Bundle Analysis
   on: [pull_request]
   jobs:
     analyze:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
         - run: npm ci
         - run: npm run analyze
         - uses: actions/upload-artifact@v3
           with:
             name: bundle-analysis
             path: .next/analyze
   ```

2. **Size threshold check**:
   - Warn if bundle grows >5% from baseline
   - Error if bundle grows >10% from baseline

#### Phase 5: Performance Monitoring
1. **Web Vitals tracking**:
   ```typescript
   // pages/_app.tsx
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

   function sendMetric(metric) {
     console.log(metric);
     // Send to analytics service
   }

   getCLS(sendMetric);
   getFID(sendMetric);
   getFCP(sendMetric);
   getLCP(sendMetric);
   getTTFB(sendMetric);
   ```

2. **Real user monitoring**:
   - Integrate with Vercel Analytics (if deployed on Vercel)
   - Or use open-source solution like Plausible

### Success Criteria
- ✅ Bundle analyzer configured and working
- ✅ Current bundle size documented
- ✅ Bundle size budgets defined
- ✅ CI checks for bundle growth
- ✅ All dynamic imports identified
- ✅ Performance monitoring in place
- ✅ Client bundle < 200 KB (gzipped)

### Files to Create/Modify
- **Create**: `BUNDLE_SIZE.md`
- **Modify**: `next.config.ts` (add bundle analyzer)
- **Modify**: `frontend/package.json`
- **Create**: `.github/workflows/analyze.yml`
- **Update**: `frontend/PROJECT_STRUCTURE.md`

### Quick Wins (Implement First)
1. ✅ Run bundle analyzer today: `npm run analyze`
2. ✅ Document baseline sizes
3. ✅ Add GitHub Actions workflow
4. ✅ Review and optimize largest 3 packages
5. ✅ Implement dynamic imports for heavy components

---

## Implementation Timeline & Priority

### Immediate (This Sprint)
1. **State Management (Zustand)** - Foundation for everything else
2. **Bundle Analysis** - Understand current state
3. **Form Validation** - Unblocks feature development

### Short-term (Next 2 Sprints)
4. **Testing (Jest)** - Build confidence for refactors
5. **Storybook** - Component documentation

### Long-term (Ongoing)
- Continuous optimization of bundle size
- Expand test coverage
- Maintain Storybook as components evolve

---

## Rollback Plans

If any implementation encounters issues:

1. **Zustand**: Context API still works - can selectively migrate stores
2. **React Hook Form**: Forms still work without validation - gradual adoption
3. **Jest**: Tests optional - can skip without breaking build
4. **Storybook**: Purely optional - doesn't affect app
5. **Bundle Analysis**: Just monitoring - no functional impact

---

## Success Metrics

Once all action items are complete:

| Metric | Target | Current |
|--------|--------|---------|
| Code coverage | >60% | 0% |
| Bundle size (gzipped) | <200 KB | ? |
| Test count | 50+ | 0 |
| Story count | 30+ | 0 |
| State mutation points | <10 | 100+ |
| Form validation consistency | 100% | <20% |

---

## References & Documentation

- [Zustand Docs](https://zustand-docs.pmnd.rs/)
- [React Hook Form Docs](https://react-hook-form.com/)
- [Jest Docs](https://jestjs.io/)
- [Testing Library Docs](https://testing-library.com/)
- [Storybook Docs](https://storybook.js.org/)
- [Next.js Bundle Analysis](https://nextjs.org/docs/advanced-features/analyzing-bundles)

---

**Document Version**: 1.0
**Last Updated**: 2025-11-19
**Author**: Claude Code
**Status**: Ready for Implementation

# NTIS UI

Next.js application

## Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first CSS framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ntis-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   └── feature-flags/ # Feature flags API
│   ├── dashboard/         # Dashboard page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── common/           # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Table.tsx
│   ├── layout/           # Layout components
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   └── MainLayout.tsx
│   └── modules/          # Feature-specific modules
│       ├── bajar-parwana/        # Permit application module
│       ├── birth-death/          # Certificate application module
│       ├── dashboard/            # Dashboard service cards
│       ├── property-tax/         # Property tax module
│       └── water-tax/            # Water tax module
├── config/               # Application configuration
│   └── app.config.ts
├── features/             # Feature implementations
├── hooks/                # Custom React hooks
│   ├── useAsync.ts
│   └── useLoading.ts
├── lib/                  # Utility functions and helpers
│   ├── api/             # API client utilities
│   ├── constants/       # Constants and routes
│   │   └── routes.ts
│   └── utils/           # Helper functions
│       ├── cn.ts
│       └── format.ts
├── services/             # API services
│   └── api.service.ts
├── styles/               # Additional styles
└── types/                # TypeScript type definitions
    ├── common.types.ts
    └── service.types.ts
```

See [STRUCTURE.md](./STRUCTURE.md) for detailed project structure.

## Environment Variables

The project supports multiple environment configurations:

- `.env` - Shared defaults (committed)
- `.env.development` - Development configuration
- `.env.staging` - Staging configuration (gitignored)
- `.env.production` - Production configuration (gitignored)
- `.env.local` - Local overrides (gitignored)

## Development

### Code Style

This project uses Prettier for code formatting and ESLint for linting. Configuration files:

- `.prettierrc.json` - Prettier configuration
- `eslint.config.mjs` - ESLint configuration

### TypeScript

Path aliases are configured in `tsconfig.json`:

```typescript
import { Button } from '@/components/common';
```

## Building for Production

```bash
npm run build
npm start
```

## License

[Add your license here]

# NTIS UI - Water Tax Rate Master Module

## Overview

This module provides a complete UI for managing Water Tax Rate Master and Billing Cycle Master, with a modern, responsive design as per the provided screenshots.

## Component Structure & Data Flow

### Main Components

- **RateMaster.tsx**
  - Main entry for the Rate Master and Billing Cycle Master screens.
  - Handles tab navigation between Rate Master and Billing Cycle Master.
  - Fetches and manages real data from backend API via `apiService` (no mock data).
  - Contains all logic/UI for Rate Master tab (summary cards, filters, table, add/edit modal).
  - Renders `<BillingCycleTab />` for the Billing Cycle Master tab.

- **BillingCycleTab.tsx**
  - Contains all logic/UI for Billing Cycle Master (summary cards, filters, table, add/edit modal).
  - Fetches and manages real data from backend API via `apiService` (no mock data).
  - Handles its own state, filtering, pagination, and modal for add/edit.

- **AddMasterModal.tsx**
  - (If used) Handles add/edit for master data like category/type/size.
  - Used as a modal in RateMaster for adding new master data.

- **RateChartModal.tsx**
  - (If used) Modal for displaying rate charts.

### Data Flow

- **RateMaster.tsx**
  - Fetches and manages state for Rate Master tab (rates, filters, modal) from backend API.
  - Passes `language` prop to `BillingCycleTab`.
  - When Billing Cycle tab is active, renders `BillingCycleTab` which manages its own state and fetches from backend API.

- **BillingCycleTab.tsx**
  - Fetches and manages its own state for billing cycles, filters, pagination, and modal from backend API.
  - No direct data dependency on RateMaster except for the `language` prop.

### Rendering Flow

1. **App loads RateMaster.tsx**
2. **RateMaster** renders tab navigation and either:
   - Rate Master UI (summary, filters, table, modal) with real data from API
   - OR `<BillingCycleTab />` (when Billing Cycle tab is active)
3. **BillingCycleTab** renders its own summary, filters, table, and modal with real data from API.

### File Responsibilities

- **RateMaster.tsx**: Only Rate Master tab logic/UI and tab navigation, all data from API.
- **BillingCycleTab.tsx**: Only Billing Cycle Master logic/UI, all data from API.
- **AddMasterModal.tsx**: (If used) Add/edit master data modal.
- **RateChartModal.tsx**: (If used) Rate chart modal.

### After Cleanup

- All mock/sample data is removed from components.
- All data is fetched and mutated via the API service (`apiService`).
- Each file/component is focused on a single responsibility.
- Data/state is managed locally in each main component, but always from backend API.
- Data flow is top-down via props (mainly `language`).

---

**For further details, see comments in each component file.**

# NTIS UI Feature: Login, Header, Footer, Sidebar & Water Tax Rate Master

## API Call Flow Overview

This project uses a modular approach for API calls, primarily for water tax rate master management. Below is a flow of how API requests are triggered, from UI actions to backend calls.

---

## Main Files Involved

- `src/components/modules/water-tax/ratemaster/RateMaster.tsx`
- `src/lib/api/services.ts`
- `src/app/water-master/useMasterData.ts`

---

## Flow: UI Action → Function → API Call

### 1. User Action (UI)

- **Actions:** Add, Edit, Delete, Filter, Search, Enable/Disable Rate, Add Category/Type/Size/Zone/Ward.
- **Location:** All actions are initiated from UI components in `RateMaster.tsx`.

### 2. Handler Functions (RateMaster.tsx)

- **Examples:**
  - `handleSave` → Called when saving a new or edited rate.
  - `handleDelete` → Called when deleting a rate.
  - `handleAddCategory`, `handleAddType`, etc. → Called when adding master data.
  - Filter changes trigger `useEffect` to fetch filtered data.

### 3. Custom Hooks (useMasterData.ts)

- Provides master data (categories, types, sizes, zones, wards) and CRUD functions for them.
- Used in `RateMaster.tsx` for state management and API interaction.

### 4. API Service Layer (services.ts)

- Centralizes all API calls.
- **Functions:**
  - `getRates(params)` → Fetches rates with filters.
  - `createRate(data)` → Adds a new rate.
  - `updateRate(id, data)` → Updates a rate.
  - `deleteRate(id)` → Deletes a rate.
  - `getConnectionCategories()`, `addCategory()`, `deleteCategory()` → Master data CRUD.
  - Similar functions for connection types, pipe sizes, zones, wards.

### 5. API Request

- All API calls use `NEXT_PUBLIC_API_BASE_URL` from `.env.local`.
- Requests are made via fetch/axios inside `services.ts`.

---

## Example: Add New Rate Flow

1. **User clicks "Add New Rate"** in `RateMaster.tsx`.
2. **Modal opens**; user fills form and clicks "Save".
3. `handleSave` is called:
    - If editing: calls `apiService.updateRate`.
    - If adding: calls `apiService.createRate`.
4. **API call** is made via `services.ts`.
5. On success, UI is refreshed with updated data.

---

## Example: Filter Rates

1. **User selects filters** (category/type/size/search).
2. State changes trigger `useEffect` in `RateMaster.tsx`.
3. `apiService.getRates` is called with filter params.
4. Table is updated with filtered results.

---

## Example: Add/Delete Category/Type/Size/Zone/Ward

1. **User opens modal** and submits new item.
2. Handler (e.g., `handleAddCategory`) calls corresponding function from `useMasterData`.
3. `useMasterData` calls API via `services.ts` (e.g., `addCategory`).
4. On success, master data is refreshed and UI updates.

---

## Summary Table

| UI Action         | Handler Function         | Hook/Service Used         | API Function Called         |
|-------------------|-------------------------|---------------------------|-----------------------------|
| Add/Edit Rate     | handleSave              | apiService                | createRate / updateRate     |
| Delete Rate       | handleDelete            | apiService                | deleteRate                  |
| Filter/Search     | useEffect               | apiService                | getRates                    |
| Add Category      | handleAddCategory       | useMasterData             | addCategory                 |
| Delete Category   | deleteCategory          | useMasterData             | deleteCategory              |
| Add Type/Size/... | handleAddType/Size/...  | useMasterData             | addType/addSize/...         |
| Delete Type/Size/ | deleteType/deleteSize   | useMasterData             | deleteType/deleteSize/...   |

---

## Environment

- API base URL: Set in `.env.local` as `NEXT_PUBLIC_API_BASE_URL`
- Feature flags and environment variables also in `.env.local`

---

## Extending

- To add new API endpoints, update `services.ts`.
- To add new UI actions, add handler functions in `RateMaster.tsx` and connect to service layer.

---

## Contact

For further details, refer to inline comments in each file or reach out to the project maintainer.

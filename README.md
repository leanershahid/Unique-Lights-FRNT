# Unique Lights web

React 19 + TypeScript (strict) + Vite storefront and admin dashboard for Unique Lights.

## Run

```bash
cp .env.example .env      # first time only
npm install
npm run dev               # http://localhost:5173, proxies /api to the backend
```

The backend must be running (default `http://localhost:5080`, change with `VITE_DEV_API_PROXY`).

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check (`tsc -b`) and production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Oxlint |

## Environment

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | API base. `/api` in development (proxied). Full URL in production, e.g. `https://api.example.com/api` |
| `VITE_DEV_API_PROXY` | Dev only: where `/api` is proxied |
| `VITE_CURRENCY`, `VITE_LOCALE` | Price formatting (default `INR`, `en-IN`) |

## Structure

```
src/
  animations/   variants.ts, transitions.ts, pageTransitions.ts, animations.ts, flyToCart.ts
  api/          axios.ts (client, refresh, errors), one module per API area, queryKeys.ts
  components/   ui/ (design-system primitives), layout/, product/, cart/, search/, home/, orders/, admin/, account/
  features/     React Query hooks per domain (auth, products, categories, cart, wishlist, orders, account, admin)
  hooks/        shared hooks + index re-exporting the main data hooks
  layouts/      Store, Auth, Account and Admin shells
  pages/        route pages (lazy-loaded), pages/account, pages/admin
  routes/       router, guards, animated outlet, error boundary
  store/        Redux Toolkit store and slices
  types/        api.ts mirrors docs/API.md
  utils/        formatting, validation, storage helpers
```

## State

- **Server state: TanStack Query.** Products, categories, cart (signed in), wishlist, orders, profile and all admin data. Mutations update or invalidate the cache; cart quantity changes and wishlist removals are optimistic.
- **Client state: Redux Toolkit.**
  - `auth`: access token (memory only) and the signed-in user. The refresh token is an httpOnly cookie the browser sends to `/api/auth/refresh`.
  - `ui`: cart drawer, search, mobile nav and filter sheet visibility, plus the cart and wishlist "pulse" counters that drive header animations.
  - `guestCart`: the cart for visitors who are not signed in, stored in localStorage and merged into the account on sign-in (`POST /api/cart/merge`).
  - `wishlistUi`: remembers a product a guest tried to save so it is added right after sign-in.
  - `preferences`: theme (evening/daylight) and recent searches, stored in localStorage.
  - `toasts`: notification queue.
- **Listing filters live in the URL** (`?brands=…&sort=…&page=…`) so they can be shared and work with the back button.

## Auth flow

1. On load the app calls `POST /api/auth/refresh`. If the cookie is valid, the user is signed in silently.
2. Every request carries `Authorization: Bearer <access token>`.
3. A `401` triggers one refresh (shared across concurrent requests) and a retry; if refresh fails the user is signed out.
4. Route guards (`RequireAuth`, `RequireAdmin`) only improve UX. The API enforces authentication and the Admin role on its own.

## Animation system

All motion uses Motion for React (`motion/react`) and the shared presets in `src/animations`:

- Timing: micro 150–200 ms, components 250–400 ms, hero 400–700 ms.
- Variants: `fadeIn`, `fadeUp`, `fadeDown`, `scaleIn`, `slideIn`, `staggerContainer`, `staggerItem`, `modal`, `drawer`, `bottomSheet`, `dropdown`, `collapse`, `slideSwap`, `revealLine`.
- Page transitions: `AnimatedOutlet` fades and lifts each route.
- `<MotionConfig reducedMotion="user">` plus `useReducedMotion` checks remove parallax, pinned scroll scenes and particle effects when the visitor prefers reduced motion; CSS animations are also neutralised.
- Only `transform`, `opacity` and `filter` are animated in scroll-driven effects.

## Images

`public/images/*.jpg` are CC0 / public-domain photos used by the home page and the seeded catalogue (credits in the root README). Product images added through the admin are uploaded to Supabase Storage by the API.

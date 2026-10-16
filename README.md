# Instamini

A quick-commerce storefront built with React Native (Expo, expo-router) — the
10-minute grocery flow end to end: browse aisles, search, cart, place order,
track delivery.

Not a UI clone exercise. Every piece below exists because a real quick-commerce
app has that problem, and the README says which decision answers which problem.

Runs on Android, iOS and web from one codebase.

## Run it

```bash
npm install
npx expo start
```

Scan the QR with Expo Go (Android) or the Camera app (iOS). `npx expo start --web`
opens the same app in a browser.

## Screens

| Route | What it does |
| --- | --- |
| `(tabs)/index` | Storefront: delivery promise, aisle grid, trending / deals / staples rails |
| `(tabs)/search` | Debounced search, same sort and filter controls as the aisle grid |
| `(tabs)/cart` | Line items, bill breakdown, free-delivery nudge |
| `category/[slug]` | Aisle grid with sort, filters, active-filter chips, sibling-aisle switching |
| `product/[id]` | Image gallery, price with MRP and discount, stock, add to cart |
| `order` | Live countdown and picker-to-doorstep progress |
| `perf` | Stress surface: render the catalog 1x–10x, toggle virtualization tuning |

## Decisions

**Filter and sort state lives in the route, not in component state.** An aisle
reads as `/category/groceries?sort=price-asc&rating=4`. Three things then come
for free: the back button restores the previous filters, a filtered list can be
shared as a link, and leaving the screen and returning does not silently reset
what the user picked. Search *text* deliberately stays local — it changes on
every keystroke, and writing that to the route would be noise.

**One composition point.** `hooks/useCatalogQuery.ts` is the only place where
catalog, search term, filters and sort meet. The aisle screen and the search
screen render the same `FilterBar`, so the two surfaces cannot drift apart in
behaviour or wording. The rules themselves are pure functions in
`utils/query.ts` — no React, no store, unit-testable on their own.

**Stable sort order.** Comparators fall back to product id when the primary key
ties. Without that, equally-rated products swap places between renders and the
grid visibly twitches.

**Filters apply on tap, not behind an Apply button.** In a ten-minute store every
extra tap is a chance to abandon. Sort closes on pick (nothing left to choose);
filters stay open so several can be stacked, with a live "Show N items" count.

**List performance.** A grocery catalog is long and the grid is the app. Each
`ProductCard` is `memo`ised and subscribes to *only its own quantity*
(`useQty(id)`), so tapping ADD on one card re-renders that card and nothing
else. Grids pass `initialNumToRender`, `windowSize`, `removeClippedSubviews`
and — in the perf lab — `getItemLayout`, so FlatList can skip measurement.

`app/perf.tsx` makes this falsifiable rather than a claim: pick a 10x catalog
(~1900 cards), flip the tuning switch off, and the drop is visible on a mid-range
phone. Flip it back on and scrolling is smooth again.

**Offline and flaky networks.** `store/catalog.ts` is stale-while-revalidate: it
paints the last cached catalog from `AsyncStorage` immediately, then swaps in
fresh data. If the network is dead but cache exists, the user sees the store plus
a quiet "saved catalog" note — never an error screen. The fetch carries an
`AbortController` timeout so a hung socket cannot hang the UI.

**Cart state.** Zustand, keyed by product id (`Record<number, CartLine>`) so a
row reads its quantity in O(1) instead of scanning an array. Persisted through
`AsyncStorage`, because a cart that empties on app restart is a bug.

**Prices.** The catalog API prices in USD decimals. One conversion point
(`utils/format.ts`) turns that into rupees, MRP and savings, so no screen does
its own arithmetic.

**Aisle naming.** The API ships raw category slugs; a storefront needs shop-floor
names. `utils/aisles.ts` owns that mapping and title-cases anything unmapped, so
new categories render instead of crashing the grid.

**Design system.** `theme/tokens.ts` holds the colour, spacing, radius and type
scale. Components reference tokens, never literals — which is why the screens
look like one app.

**Loading states.** Skeletons shaped like the content they replace, so the layout
does not jump when data lands. Empty, error and offline states all route through
one `EmptyState` component.

## Structure

```
src/
  app/            expo-router routes (file = route)
  components/     presentational + memoised building blocks
  store/          zustand stores (catalog, cart)
  api/            network + cache boundary
  theme/          design tokens
  hooks/          useDebounced
  utils/          formatting, aisle mapping
```

## Data

Catalog comes from [DummyJSON](https://dummyjson.com/products) — 194 products
across 22 aisles. Deliberately a real network call rather than a bundled JSON
array, so loading, error, timeout and cache paths are real code and not
hypotheticals.

## Not built, on purpose

Auth, payments and a maps SDK. None of them would show anything about React
Native that the list, cart and offline work above does not already show, and each
would have taken days of SDK configuration.

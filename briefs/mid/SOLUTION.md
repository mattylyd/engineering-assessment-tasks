# SOLUTION.md

Solution for `frontend-mid.md`: a cumulative cost-delta-by-month chart on the project detail page,
with an "All" / "Approved" status filter that recomputes client-side.

**Time spent:** started 10:30am, finished at midday, 90 minutes, excluding the time taken to write
this `SOLUTION.md` and set up.

## Design

- **Data fetch stays as-is.** `ProjectDetailStore.load()` already fetches everything the page needs
  in one `forkJoin`; `changeOrders` was added to that same call (`api.listChangeOrders(projectId)`),
  so the page keeps a single shared `status`/`error` for loading and failure, and change orders
  never trigger a second round-trip.
- **Filtering and aggregation live in the Signal Store, not the component.** `ProjectDetailStore`
  holds `changeOrderStatusFilter` state (`'all' | 'approved'`) and two chained, memoized computed
  signals:
  - `filteredChangeOrders`, the raw list filtered by `changeOrderStatusFilter`.
  - `cumulativeCostDeltaByMonth`, buckets `filteredChangeOrders` by month (from `raisedDate`) and
    runs a cumulative sum, producing `{ month, cumulativeDelta }[]`.

  They're deliberately two separate computeds (not one combined one) so filtering and the running
  total can each be tested in isolation, and together (filter change → recomputed total), without
  either depending on component/template code.
- **The chart component is a pure presentational unit.** `CumulativeCostDeltaChartComponent` takes
  `points` (already-filtered/aggregated data) and `statusFilter` as inputs, emits
  `statusFilterChange`, and its only local `computed` maps that data onto Highcharts `Options`,
  view formatting, not business logic. It mirrors the existing `CostTrendChartComponent`
  (standalone, `OnPush`, `highcharts-angular`, new `@if`/`@else` control flow).
- **Filter toggle** is Angular Material's `mat-button-toggle-group`; its value and change handler
  are inputs/outputs bound from the parent to the store, so state ownership stays in one place
  (`setChangeOrderStatusFilter()` → `patchState`).
- **Empty states** are handled at two levels: the page shows "No change orders have been raised for
  this project" when the raw list is empty, and the chart itself shows "No approved change orders to
  show" when the *current filter* yields nothing (keeping the toggle visible so the user can switch
  back), distinct from the page's shared loading/error states, which gate the whole page above
  this section.

## Trade-offs

- Filter selection isn't persisted (URL param / localStorage), resets to "All" on reload. Out of
  scope per the brief.
- Month bucketing is `raisedDate.slice(0, 7)` (assumes ISO `YYYY-MM-DD` from the API) rather than a
  date library, adequate for this dataset; I'd reach for a date library if timezones or locale
  formatting entered the picture.
- `CostTrendChartComponent` and `CumulativeCostDeltaChartComponent` now have a very similar shape
  (derived data in → Highcharts options out). I didn't extract a shared generic line-chart component
  for two usages, that felt like a premature abstraction; worth revisiting if a third chart
  appears.
- `ChangeOrderStatusFilter` / `CumulativeCostDeltaPoint` are owned by the chart component (as its
  input contract) and the store imports them, keeping the dependency direction consistent with how
  `CostTrendChartComponent` depends outward on domain types rather than a component depending on a
  specific feature's store.

## What I'd improve with more time

- **Tests are the biggest gap.** The brief calls out the cumulative sum and the filtering as the
  logic to cover, and neither has a spec yet, there's no `project-detail.store.spec.ts` (unlike
  `portfolio.store.spec.ts`, which does cover its store). I'd add one covering `filteredChangeOrders`
  and `cumulativeCostDeltaByMonth` independently and composed (filter change → recomputed total),
  following the existing `portfolio.store.spec.ts` pattern (`TestBed` + mocked `ApiClient` +
  `provideZonelessChangeDetection`).
- Apply the same explicit empty-state treatment to the other project-detail sections (milestones,
  benchmarks, cost trend), right now only change orders get a "no data" message; the others render
  silently with zero rows/entries.
- If a third chart with the same data-in/Highcharts-options-out shape appears, extract a shared line
  chart component.

## Commit history

The zip includes `.git`, so the full commit history should be there, happy to also share the GitHub repo link

## AI/tooling used

Built with Claude Code (Anthropic), pairing interactively on the implementation and on refactors
driven by checking the result against the brief's criteria (moving derived state into memoized
Signal Store computeds, splitting filtering and the cumulative sum for testability, and a few
cleanup passes).
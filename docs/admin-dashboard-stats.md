# Admin dashboard statistics

The dashboard reads three bounded summary documents:

- `_adminStats/geography`: residence and military province counts, matched/unmatched totals.
- `_adminStats/daily`: up to 120 daily registration buckets.
- `_adminStats/dashboard`: funnel counters and service-period distribution.

Individual user documents are never sent to the browser. When summaries are absent, the server may calculate an exact temporary fallback only if the entire `users` collection contains at most 100 records. Beyond that threshold the affected visualization is explicitly unavailable, preventing partial or misleading analytics.

Run a read-only reconciliation preview with `pnpm reconcile:admin-stats`. Writing is deliberately guarded and requires `pnpm reconcile:admin-stats -- --write --confirm-project=<FIREBASE_PROJECT_ID>`. This command must be run by an authorized operator after reviewing the dry-run output; dashboard rendering never writes production data.

The eventual event-driven updater should update these summaries idempotently whenever a user is created, deleted/anonymized, or changes residence, service city, profile-completion state, service period, or Devre assignment. Each event must subtract the previous canonical value and add the new canonical value in a Firestore transaction. The guarded reconciliation remains the repair path for missed events.


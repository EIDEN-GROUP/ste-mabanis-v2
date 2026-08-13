# Supabase

SQL for the admin backend. **Not yet applied to any project and therefore not
yet executed** — no Supabase project was provisioned when these were written, so
treat them as reviewed-but-untested until they run against a real database.

| File | Contents |
| --- | --- |
| `migrations/0001_schema.sql` | Enums, tables, indexes, triggers. Mirrors `src/lib/admin/types.ts`. |
| `migrations/0002_rls.sql` | Row level security policies. Depends on `0001`. |

## Applying

```bash
supabase db push
```

Or paste each file, in order, into the SQL editor.

## Access model

| Role | Access |
| --- | --- |
| `anon` | Read-only, and only properties whose status is `available`, `reserved` or `under_offer`, plus their media. Client, lead, document and transaction tables have **no** anon policy, so they are unreachable. |
| `authenticated` staff | Read everything; write the records they own (`agent_id = auth.uid()`). |
| `manager` / `admin` | Write anything. Payments are manager-only. |

Staff identity comes from `profiles`, keyed to `auth.users`. The `is_staff()` and
`is_manager()` helpers are `SECURITY DEFINER` so policies can read `profiles`
without recursing into its own RLS.

## Selling a property does not delete it

`properties.status` moving to `sold` or `rented` drops the row out of the anon
policy, so it leaves the public site immediately, while the row — and every
linked lead, activity, document and transaction — stays for history and
reporting. The `properties_stamp_exit` trigger records `sold_at` on the way out
and clears it if the property is relisted.

## Switching the app over

The app currently reads seed data. One binding decides:

```ts
// src/lib/admin/repository.ts
export const repository: AdminRepository = inMemoryRepository;
```

Implement `AdminRepository` against the Supabase client, swap that export, and
every screen, server function and query hook keeps working unchanged.

Required environment once you do:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

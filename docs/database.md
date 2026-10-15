# Database

MongoDB, database `saige_prep` (dev/prod), `saige_prep_test` (pytest), `saige_prep_e2e` (Playwright). Test suites refuse to run against names that do not end in `_test`/`_e2e`.

## Collections in use (Phase 1)

### `users`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `email` | string | lower-cased, unique (`uniq_email`) |
| `display_name` | string | |
| `password_hash` | string | Argon2id |
| `role` | `"admin" \| "learner"` | the owner is `admin` |
| `is_active` | bool | inactive users can't authenticate |
| `created_at`, `updated_at`, `last_login_at` | date (UTC) | |

### `sessions`
| Field | Type | Notes |
|---|---|---|
| `token_hash` | string | HMAC-SHA256 of the cookie token, unique |
| `user_id` | ObjectId | indexed (`by_user`) |
| `created_at` | date | |
| `expires_at` | date | TTL index (`ttl_expires_at`, expireAfterSeconds=0) |
| `user_agent` | string | truncated to 300 chars |

Indexes are created idempotently at startup (`app/database.py:ensure_indexes`).

## Planned collections
Roles and skills, learning paths, courses/modules/lessons, resources and media, lesson progress, questions, assessment configs, attempts and responses, coding challenges and submissions, interviews and responses, projects, bookmarks, notes, study plans and tasks, skill progress, tags, settings. They will be documented here, with JSON-schema validators, as each phase adds them.

Conventions:
- Stable string `slug` identifiers for seeded content, so seeds can upsert by slug and running them twice never duplicates.
- Learner data (attempts, progress, notes) references content by slug or ObjectId and is never mixed with question documents. Answer keys live only in server-side collections.
- All timestamps are UTC.

## Migrations
A `schema_migrations` collection plus ordered scripts in `backend/scripts/migrations/` will arrive with the first structural change (Phase 2).

## Backups
- Atlas: enable cloud backups / point-in-time restore on the cluster.
- Local: `mongodump --db saige_prep --archive=backups/saige_prep-YYYYMMDD.archive.gz --gzip` and restore with `mongorestore --archive=… --gzip`. `backups/` is git-ignored.

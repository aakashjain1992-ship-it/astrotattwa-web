# Astrotattwa — Database Migration Plan

**Created:** February 15, 2026  
**Status:** Analysis Complete — Migration Deferred  
**Trigger:** Begin migration at 100+ paying users  
**Author:** Claude (AI Assistant)

---

## TL;DR

**Recommendation: Stay on Supabase until 100+ paying users.**

Supabase provides Auth, Storage, and RLS for free. Replacing these before having revenue costs ~$65/month and weeks of engineering time better spent on features.

---

## Current Stack (Supabase)

| Supabase Feature | Used In Astrotattwa | Notes |
|---|---|---|
| PostgreSQL DB | Charts, cities, profiles, test cases | Core data layer |
| Auth (Google OAuth + Email) | Planned in P7 | Handles OAuth, JWT, email verification |
| Row Level Security (RLS) | All tables | Per-user data isolation |
| Client library (`@supabase/supabase-js`) | All DB queries | TypeScript support is decent |
| Storage | PDF reports (Phase 3 / P12) | Not yet active |
| Auto REST API | Not used | Custom API routes preferred |

---

## Migration Target: Linode Managed PostgreSQL

Linode (Akamai) offers fully managed PostgreSQL — the same engine as Supabase, hosted in the same datacenter as the app VPS.

### Side-by-Side Comparison

| Factor | Linode Managed DB | Supabase |
|---|---|---|
| **Cost** | ~$65/month (cheapest plan) | Free tier available |
| **Database** | Pure PostgreSQL | PostgreSQL |
| **Auth** | ❌ Not included | ✅ Built-in |
| **Storage** | ❌ Not included (use Linode Object Storage) | ✅ Built-in (1GB free) |
| **RLS** | ❌ Move to app layer | ✅ Built-in |
| **Dashboard** | Basic | Excellent |
| **Client library** | Prisma / Drizzle / pg | `@supabase/supabase-js` |
| **Latency** | ✅ Same datacenter as app | ⚠️ Separate server |
| **Backups** | ✅ Included | ✅ Included |
| **Scaling** | Manual | Automatic |

---

## Arguments For Moving

- **Latency** — DB and app on same server/datacenter = faster queries
- **No vendor lock-in** — Pure PostgreSQL, standard tooling (Prisma, psql, etc.)
- **Single provider** — One bill, one dashboard, one team to contact
- **Data ownership** — No third-party dependency, full control

## Arguments Against Moving Right Now

- **Cost** — $65/month before a single paying user vs $0 on Supabase free tier
- **Auth replacement** — Supabase Auth handles Google OAuth, email verification, password reset, and JWT tokens. Replacing this means integrating Auth.js (NextAuth) — adds 1–2 weeks of work
- **Storage replacement** — PDF reports (P12) need object storage. Linode Object Storage costs ~$5/month (S3-compatible), but requires setup
- **Opportunity cost** — Migration time = time not spent on features users see

---

## When to Migrate: Checklist

Pull the trigger on migration when ALL of the following are true:

- [ ] 100+ paying users (revenue justifies $65/month)
- [ ] P7 Authentication is live (so you understand the Auth.js migration scope)
- [ ] P12 AI Reports are live (so you understand Storage migration scope)
- [ ] Stable query patterns identified (so schema can be optimised for Prisma)

---

## Migration Path (When Ready)

```
Supabase PostgreSQL    →  Linode Managed PostgreSQL
Supabase Auth          →  Auth.js (NextAuth.js) — Google OAuth + email
Supabase Storage       →  Linode Object Storage (~$5/month, S3-compatible)
@supabase/supabase-js  →  Prisma ORM (better TypeScript support)
RLS policies           →  Application-layer authorization middleware
```

### Step-by-Step Plan (Draft)

1. **Provision** Linode Managed PostgreSQL in Mumbai region (match VPS location)
2. **Schema migration** — Export Supabase schema, import to Linode DB
3. **Data migration** — `pg_dump` / `pg_restore` with zero-downtime strategy (dual-write window)
4. **Auth migration** — Install Auth.js, configure Google OAuth provider, migrate sessions
5. **Storage migration** — Set up Linode Object Storage bucket, migrate any existing PDFs
6. **ORM swap** — Replace `@supabase/supabase-js` calls with Prisma client
7. **RLS → App layer** — Move per-user data isolation to API middleware
8. **Testing** — Verify all queries, auth flows, and file uploads
9. **DNS / connection string cutover**
10. **Decommission Supabase**

### Rollback Strategy

Keep Supabase active for 2 weeks post-migration as a fallback. Dual-write during transition window ensures no data loss if rollback is needed.

---

## Cost Projection (Post-Migration)

| Service | Cost/Month |
|---|---|
| Linode VPS (existing) | ~$20 |
| Linode Managed PostgreSQL | ~$65 |
| Linode Object Storage | ~$5 |
| **Total** | **~$90/month** |

Break-even: ~1 Career Report sale/month covers Object Storage. ~3 report sales/month covers DB cost. Sustainable at 20+ active paying users.

---

## Notes for Future AI Assistants

- This plan was created Feb 15, 2026 as part of P4 analysis
- Migration is **deliberately deferred** — do not start without the trigger checklist above being satisfied
- Auth.js docs: https://authjs.dev
- Linode Object Storage is S3-compatible — AWS SDK works out of the box
- Prisma migration guide from raw SQL: https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project

---

**Last Updated:** February 15, 2026  
**Next Review:** When 100+ paying users milestone is reached

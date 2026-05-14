-- Auto-expose was disabled at project creation, so we must explicitly grant
-- privileges to PostgREST roles. RLS still applies on top.

-- service_role (bypasses RLS): full access for our API routes
grant select, insert, update, delete on public.waitlist to service_role;

-- anon / authenticated: keep DENIED at table level too (RLS would also block,
-- but defense-in-depth — never grant CRUD to anon for sensitive tables).

-- Future tables: by default, no role can see them. Each new table must
-- explicitly grant + add RLS policies. This is the secure default.

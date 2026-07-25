-- Apply with: railway run --service dakinis-internal-api -- psql $DATABASE_URL -f ...
-- Or paste into Supabase SQL Editor.

\echo 'Checking akoenet.member_xp...'
SELECT to_regclass('akoenet.member_xp') AS member_xp;

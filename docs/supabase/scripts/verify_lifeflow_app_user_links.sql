SELECT app_user_id, platform_user_id::text AS platform_user_id, email, updated_at
FROM lifeflow.app_user_links
WHERE platform_user_id = 'a1000088-0000-4000-8000-000000000088'::uuid
   OR app_user_id LIKE 'usr_%'
ORDER BY updated_at DESC NULLS LAST
LIMIT 20;

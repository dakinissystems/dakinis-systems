-- Fermina Food — tenant restaurante argentino (comandas + facturas + stock)
-- Ejecutar en Supabase SQL Editor tras 02-dakinis-core-prod.sql
-- Login: admin@fermina-food.local / demo123
-- QR público: /alergenos/ferminafoodqr2026
-- Alternativa completa (recetas): node platform/core/api/scripts/seed-fermina-food.mjs

DO $$
BEGIN
  IF to_regclass('dakinis_core_prod.business') IS NULL THEN
    RAISE EXCEPTION 'Falta dakinis_core_prod.business. Ejecuta primero schemas/02-dakinis-core-prod.sql en Supabase.';
  END IF;
END $$;

INSERT INTO dakinis_core_prod.business (id, slug, name, type, plan, config_json)
VALUES (
  'biz_fermina_food',
  'fermina-food',
  'Fermina Food',
  'restaurante',
  'starter',
  '{"brand":{"tagline":"foods, drinks & coffee","primaryColor":"#8a9a7b","accentColor":"#1a1a1a"},"menu":{"venue":"Fermina Food","currency":"EUR","items":[{"id":"cheddar-jalapeno-bites","name":"Cheddar and jalapeños bites","nameEs":"Bites cheddar y jalapeños","category":"Entrante","priceEur":8.5,"packSize":50,"portionQty":9,"stockSlug":"bites-cheddar"},{"id":"chicken-bites","name":"Chicken bites","nameEs":"Chicken bites","category":"Entrante","priceEur":9.5,"packSize":120,"portionQty":11,"stockSlug":"bites-pollo"},{"id":"choripan","name":"Choripán","nameEs":"Choripán","category":"Clásico","priceEur":7.5,"stockSlug":"choripan"}]}}'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  plan = EXCLUDED.plan,
  config_json = EXCLUDED.config_json;

INSERT INTO dakinis_core_prod.users (id, business_id, email, password_hash, role)
VALUES (
  'usr_fermina_food_1',
  'biz_fermina_food',
  'admin@fermina-food.local',
  '$2b$10$OsQor1rzoyIOslLdz3jj0uAztY9o5BFsxssaFGAuwfSy/hXWx8lDS',
  'admin'
)
ON CONFLICT (email) DO UPDATE SET
  business_id = EXCLUDED.business_id,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role;

INSERT INTO dakinis_core_prod.tenant_restaurant_profile (business_id, public_token, venue_name, allergies_json)
VALUES (
  'biz_fermina_food',
  'ferminafoodqr2026',
  'Fermina Food',
  '[{"catalogId":"gluten","name":"Gluten","category":"Cereales","present":true,"severity":"alta","notes":"Pan choripán, rebozados"},{"catalogId":"crustaceans","name":"Crustáceos","category":"Marisco","present":false,"severity":"info","notes":""},{"catalogId":"eggs","name":"Huevos","category":"Huevo","present":false,"severity":"info","notes":""},{"catalogId":"fish","name":"Pescado","category":"Pescado","present":false,"severity":"info","notes":""},{"catalogId":"peanuts","name":"Cacahuetes","category":"Frutos secos","present":false,"severity":"info","notes":""},{"catalogId":"soy","name":"Soja","category":"Soja","present":false,"severity":"info","notes":""},{"catalogId":"milk","name":"Leche","category":"Lácteos","present":true,"severity":"alta","notes":"Bites cheddar"},{"catalogId":"nuts","name":"Frutos de cáscara","category":"Frutos secos","present":false,"severity":"info","notes":""},{"catalogId":"celery","name":"Apio","category":"Verdura","present":false,"severity":"info","notes":""},{"catalogId":"mustard","name":"Mostaza","category":"Condimento","present":false,"severity":"info","notes":""},{"catalogId":"sesame","name":"Sésamo","category":"Semillas","present":false,"severity":"info","notes":""},{"catalogId":"sulphites","name":"Sulfitos","category":"Conservantes","present":false,"severity":"info","notes":""},{"catalogId":"lupin","name":"Altramuz","category":"Legumbre","present":false,"severity":"info","notes":""},{"catalogId":"molluscs","name":"Moluscos","category":"Marisco","present":false,"severity":"info","notes":""},{"catalogId":"lactose","name":"Lactosa","category":"Intolerancia","present":false,"severity":"info","notes":""},{"catalogId":"vegan","name":"Vegano / vegetariano","category":"Preferencia","present":false,"severity":"info","notes":""},{"id":"dish_cheddar_jalapeno_bites","name":"Bites cheddar y jalapeños","category":"Entrante","present":true,"severity":"alta","notes":"Leche, Gluten"},{"id":"dish_chicken_bites","name":"Chicken bites","category":"Entrante","present":true,"severity":"alta","notes":"Gluten"},{"id":"dish_choripan","name":"Choripán","category":"Entrante","present":true,"severity":"alta","notes":"Gluten"}]'
)
ON CONFLICT (business_id) DO UPDATE SET
  venue_name = EXCLUDED.venue_name,
  allergies_json = EXCLUDED.allergies_json,
  updated_at = now();

INSERT INTO dakinis_core_prod.tenant_stock_items (id, business_id, slug, name, unit, quantity, min_quantity)
VALUES
  ('stk_ff_cheddar', 'biz_fermina_food', 'bites-cheddar', 'Bites cheddar y jalapeños (bolsa)', 'u', 250, 90),
  ('stk_ff_pollo', 'biz_fermina_food', 'bites-pollo', 'Chicken bites (bolsa)', 'u', 480, 120),
  ('stk_ff_pan', 'biz_fermina_food', 'pan-choripan', 'Pan de choripán', 'u', 40, 10),
  ('stk_ff_chorizo', 'biz_fermina_food', 'chorizo', 'Chorizo', 'u', 45, 12),
  ('stk_ff_chimi', 'biz_fermina_food', 'chimichurri', 'Chimichurri', 'L', 2, 0.5),
  ('stk_ff_pan2', 'biz_fermina_food', 'pan-burger', 'Pan (otros)', 'u', 20, 5)
ON CONFLICT (business_id, slug) DO NOTHING;

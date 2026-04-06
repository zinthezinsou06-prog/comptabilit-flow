-- Seed default categories for demo purposes
-- Note: Replace with actual user_id when running in production

-- Insert default categories (these are examples)
INSERT INTO categories (id, user_id, nom, champ_dynamique, created_at) 
VALUES 
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'Alimentation', 'neant', NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'Transport', 'neant', NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'Logement', 'neant', NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'Loisirs', 'neant', NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'Santé', 'neant', NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'Éducation', 'neant', NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'Divertissement', 'neant', NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001'::uuid, 'Autres', 'neant', NOW())
ON CONFLICT (user_id, nom) DO NOTHING;

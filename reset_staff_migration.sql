-- RESET SCRIPT - Rimuove tutto quello che è stato creato per la tabella staff

-- 1. Rimuovi la foreign key constraint se esiste
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_staff_id_fkey;

-- 2. Rimuovi gli indici se esistono
DROP INDEX IF EXISTS idx_bookings_staff_id;
DROP INDEX IF EXISTS idx_staff_organization_id;
DROP INDEX IF EXISTS idx_staff_user_id;
DROP INDEX IF EXISTS idx_staff_is_active;

-- 3. Rimuovi le policies se esistono
DROP POLICY IF EXISTS "Users can view staff in their organization" ON staff;
DROP POLICY IF EXISTS "Organization owners and admins can insert staff" ON staff;
DROP POLICY IF EXISTS "Organization owners and admins can update staff" ON staff;
DROP POLICY IF EXISTS "Organization owners and admins can delete staff" ON staff;

-- 4. Rimuovi il trigger se esiste
DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;

-- 5. Rimuovi la tabella staff se esiste
DROP TABLE IF EXISTS staff CASCADE;

-- 6. Ricrea la foreign key originale (se esisteva)
-- ALTER TABLE bookings ADD CONSTRAINT bookings_staff_id_fkey 
--   FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE SET NULL;

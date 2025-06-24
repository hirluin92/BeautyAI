-- Migrate existing staff data from users table to staff table
-- Create staff records for existing users who have role 'staff' or 'admin'
INSERT INTO staff (organization_id, user_id, full_name, email, phone, role, is_active, created_at, updated_at)
SELECT 
    organization_id,
    id as user_id,
    full_name,
    email,
    phone,
    role,
    is_active,
    created_at,
    updated_at
FROM users 
WHERE role IN ('staff', 'admin')
ON CONFLICT (user_id) DO NOTHING;

-- Update existing bookings to use the new staff_id
-- Map old user_id to new staff_id
UPDATE bookings 
SET staff_id = s.id
FROM staff s
WHERE bookings.staff_id = s.user_id
AND bookings.staff_id IS NOT NULL;

-- For bookings that still have staff_id pointing to users that don't exist in staff table,
-- set staff_id to NULL (these are probably invalid references)
UPDATE bookings 
SET staff_id = NULL
WHERE staff_id NOT IN (SELECT id FROM staff)
AND staff_id IS NOT NULL; 
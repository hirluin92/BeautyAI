-- Update bookings table to reference staff table instead of users table
-- First, drop the existing foreign key constraint if it exists
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_staff_id_fkey;

-- Add new foreign key constraint to staff table
ALTER TABLE bookings ADD CONSTRAINT bookings_staff_id_fkey 
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL;

-- Create index for the new foreign key (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_bookings_staff_id ON bookings(staff_id);

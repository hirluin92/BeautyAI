-- Fix the missing foreign key constraint for bookings.staff_id
-- This is needed for the financial APIs to work properly

-- First, check if the constraint exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bookings_staff_id_fkey' 
        AND table_name = 'bookings'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE bookings 
        ADD CONSTRAINT bookings_staff_id_fkey 
        FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Added foreign key constraint bookings_staff_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint bookings_staff_id_fkey already exists';
    END IF;
END $$; 
-- STEP 1: Create staff table
-- This script creates the new staff table with all necessary fields

CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Link to auth user
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'staff',
    specializations TEXT[],
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    working_hours JSONB DEFAULT '{"mon": {"start": "09:00", "end": "17:00"}, "tue": {"start": "09:00", "end": "17:00"}, "wed": {"start": "09:00", "end": "17:00"}, "thu": {"start": "09:00", "end": "17:00"}, "fri": {"start": "09:00", "end": "17:00"}}',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id) -- Add unique constraint on user_id
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_staff_organization_id ON staff(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_is_active ON staff(is_active);

-- Create trigger for updated_at (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_staff_updated_at') THEN
        CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- Add RLS policies
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view staff in their organization
DROP POLICY IF EXISTS "Users can view staff in their organization" ON staff;
CREATE POLICY "Users can view staff in their organization" ON staff
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- Policy: Organization owners and admins can insert staff
DROP POLICY IF EXISTS "Organization owners and admins can insert staff" ON staff;
CREATE POLICY "Organization owners and admins can insert staff" ON staff
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

-- Policy: Organization owners and admins can update staff
DROP POLICY IF EXISTS "Organization owners and admins can update staff" ON staff;
CREATE POLICY "Organization owners and admins can update staff" ON staff
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

-- Policy: Organization owners and admins can delete staff
DROP POLICY IF EXISTS "Organization owners and admins can delete staff" ON staff;
CREATE POLICY "Organization owners and admins can delete staff" ON staff
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

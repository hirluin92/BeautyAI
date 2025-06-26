-- Tabelle Time Slots Quantici
CREATE TABLE quantum_time_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  slot_type VARCHAR(50) NOT NULL CHECK (slot_type IN ('available', 'booked', 'blocked', 'optimal', 'quantum', 'ai_generated')),
  efficiency_score INTEGER DEFAULT 0 CHECK (efficiency_score >= 0 AND efficiency_score <= 100),
  revenue_potential DECIMAL(10,2) DEFAULT 0,
  quantum_score INTEGER DEFAULT 0 CHECK (quantum_score >= 0 AND quantum_score <= 100),
  staff_id UUID REFERENCES staff(id),
  booking_id UUID REFERENCES bookings(id),
  ai_generated BOOLEAN DEFAULT false,
  ai_optimization_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, date, start_time, staff_id)
);

-- Tabelle Quantum Calendar Analytics
CREATE TABLE quantum_calendar_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_slots INTEGER DEFAULT 0,
  booked_slots INTEGER DEFAULT 0,
  optimal_slots INTEGER DEFAULT 0,
  quantum_slots INTEGER DEFAULT 0,
  efficiency_score DECIMAL(5,2) DEFAULT 0,
  revenue_forecast DECIMAL(10,2) DEFAULT 0,
  ai_recommendations TEXT[] DEFAULT '{}',
  time_distortions JSONB DEFAULT '{}',
  quantum_optimizations INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, date)
);

-- Tabelle Staff Quantum Sync
CREATE TABLE staff_quantum_sync (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  quantum_enabled BOOLEAN DEFAULT false,
  efficiency_rating DECIMAL(5,2) DEFAULT 0,
  availability_pattern TEXT[] DEFAULT '{}',
  optimization_preferences JSONB DEFAULT '{}',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, staff_id)
);

-- Tabelle Time Optimization Rules
CREATE TABLE time_optimization_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  rule_name VARCHAR(255) NOT NULL,
  rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('efficiency', 'revenue', 'quantum', 'staff_preference', 'client_flow')),
  conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  success_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per Performance
CREATE INDEX idx_quantum_slots_date_staff ON quantum_time_slots(organization_id, date, staff_id);
CREATE INDEX idx_quantum_slots_type ON quantum_time_slots(organization_id, slot_type);
CREATE INDEX idx_quantum_analytics_date ON quantum_calendar_analytics(organization_id, date DESC);
CREATE INDEX idx_staff_quantum_enabled ON staff_quantum_sync(organization_id, quantum_enabled);

-- RLS Policies
ALTER TABLE quantum_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE quantum_calendar_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_quantum_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_optimization_rules ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their organization's data
CREATE POLICY "Users can manage quantum_time_slots" ON quantum_time_slots
  FOR ALL USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view quantum_calendar_analytics" ON quantum_calendar_analytics
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage staff_quantum_sync" ON staff_quantum_sync
  FOR ALL USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage time_optimization_rules" ON time_optimization_rules
  FOR ALL USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())); 
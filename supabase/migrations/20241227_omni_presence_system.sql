-- ===================================
-- Omni Presence System Migration
-- ===================================

-- Tabelle Campagne
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('promotional', 'reminder', 'welcome', 'retention', 'reactivation')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')) DEFAULT 'draft',
  channels TEXT[] NOT NULL DEFAULT '{}',
  audience_segments TEXT[] DEFAULT '{}',
  audience_total INTEGER DEFAULT 0,
  schedule_type VARCHAR(50) NOT NULL CHECK (schedule_type IN ('immediate', 'scheduled', 'recurring')) DEFAULT 'immediate',
  schedule_date TIMESTAMP WITH TIME ZONE,
  schedule_frequency VARCHAR(50),
  content JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  -- Metriche Performance
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  revenue_generated DECIMAL(10,2) DEFAULT 0
);

-- Tabelle AI Personas
CREATE TABLE ai_personas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('assistant', 'salesperson', 'support', 'expert')),
  personality TEXT NOT NULL,
  expertise TEXT[] DEFAULT '{}',
  channels TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Statistiche Performance
  conversation_count INTEGER DEFAULT 0,
  satisfaction_rating DECIMAL(3,2) DEFAULT 0,
  conversion_count INTEGER DEFAULT 0
);

-- Tabelle Canali Omni-Channel
CREATE TABLE omni_channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  channel_type VARCHAR(50) NOT NULL CHECK (channel_type IN ('whatsapp', 'email', 'sms', 'instagram', 'facebook', 'website', 'google')),
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'inactive', 'error', 'pending')) DEFAULT 'pending',
  config JSONB DEFAULT '{}',
  automation_enabled BOOLEAN DEFAULT false,
  ai_enabled BOOLEAN DEFAULT false,
  ai_persona_id UUID REFERENCES ai_personas(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Statistiche
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  
  UNIQUE(organization_id, channel_type)
);

-- Tabelle Messaggi e Conversazioni
CREATE TABLE omni_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id),
  channel_id UUID NOT NULL REFERENCES omni_channels(id),
  client_id UUID REFERENCES clients(id),
  message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('campaign', 'automation', 'manual', 'ai_response')),
  direction VARCHAR(50) NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  content JSONB NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed', 'opened', 'clicked')),
  external_id VARCHAR(255),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelle Automation Workflows
CREATE TABLE automation_workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('new_client', 'booking_confirmed', 'no_show', 'inactive_client', 'birthday', 'custom')),
  trigger_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  channels TEXT[] DEFAULT '{}',
  steps JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Statistiche
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0
);

-- Tabelle Analytics e Tracking
CREATE TABLE omni_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  channel_type VARCHAR(50) NOT NULL,
  metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('sent', 'delivered', 'opened', 'clicked', 'conversion', 'revenue')),
  value INTEGER NOT NULL DEFAULT 0,
  revenue_value DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, date, channel_type, metric_type)
);

-- Indici per Performance
CREATE INDEX idx_campaigns_organization_status ON campaigns(organization_id, status);
CREATE INDEX idx_omni_messages_organization_created ON omni_messages(organization_id, created_at DESC);
CREATE INDEX idx_omni_messages_client_created ON omni_messages(client_id, created_at DESC);
CREATE INDEX idx_omni_analytics_org_date ON omni_analytics(organization_id, date DESC);

-- RLS Policies
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE omni_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE omni_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE omni_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their organization's data
CREATE POLICY "Users can manage campaigns" ON campaigns
  FOR ALL USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage ai_personas" ON ai_personas
  FOR ALL USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage omni_channels" ON omni_channels
  FOR ALL USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage omni_messages" ON omni_messages
  FOR ALL USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage automation_workflows" ON automation_workflows
  FOR ALL USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view omni_analytics" ON omni_analytics
  FOR SELECT USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())); 
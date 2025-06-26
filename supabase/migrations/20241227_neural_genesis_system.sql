-- Neural Genesis System Tables
-- AI Personas table
CREATE TABLE IF NOT EXISTS ai_personas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  avatar VARCHAR(50) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('assistant', 'salesperson', 'expert')),
  personality TEXT NOT NULL,
  expertise TEXT[] NOT NULL DEFAULT '{}',
  languages TEXT[] NOT NULL DEFAULT '{}',
  voice_enabled BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  stats JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),
  client_email VARCHAR(255),
  channel VARCHAR(50) NOT NULL CHECK (channel IN ('whatsapp', 'website', 'email', 'phone')),
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'waiting', 'completed', 'escalated')),
  ai_persona_id UUID REFERENCES ai_personas(id) ON DELETE SET NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  satisfaction_rating DECIMAL(2,1) CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  conversion_completed BOOLEAN DEFAULT false,
  conversion_value DECIMAL(10,2),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Messages table
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  sender VARCHAR(50) NOT NULL CHECK (sender IN ('client', 'ai')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type VARCHAR(50) NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'voice')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Training Sessions table
CREATE TABLE IF NOT EXISTS ai_training_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  accuracy DECIMAL(5,2),
  duration_minutes INTEGER,
  dataset_size INTEGER NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  results JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Datasets table
CREATE TABLE IF NOT EXISTS ai_datasets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('conversations', 'faq', 'reviews', 'custom')),
  size INTEGER NOT NULL DEFAULT 0,
  validated BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_conversations_organization_id ON ai_conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_status ON ai_conversations(status);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_ai_persona_id ON ai_conversations(ai_persona_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_last_message_at ON ai_conversations(last_message_at);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_timestamp ON ai_messages(timestamp);

CREATE INDEX IF NOT EXISTS idx_ai_personas_organization_id ON ai_personas(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_personas_active ON ai_personas(active);

CREATE INDEX IF NOT EXISTS idx_ai_training_sessions_organization_id ON ai_training_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_training_sessions_status ON ai_training_sessions(status);

-- RLS Policies
ALTER TABLE ai_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_datasets ENABLE ROW LEVEL SECURITY;

-- AI Personas policies
CREATE POLICY "Users can view their organization's AI personas" ON ai_personas
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert AI personas for their organization" ON ai_personas
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their organization's AI personas" ON ai_personas
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- AI Conversations policies
CREATE POLICY "Users can view their organization's conversations" ON ai_conversations
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert conversations for their organization" ON ai_conversations
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their organization's conversations" ON ai_conversations
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- AI Messages policies
CREATE POLICY "Users can view messages from their organization's conversations" ON ai_messages
  FOR SELECT USING (conversation_id IN (
    SELECT id FROM ai_conversations WHERE organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert messages for their organization's conversations" ON ai_messages
  FOR INSERT WITH CHECK (conversation_id IN (
    SELECT id FROM ai_conversations WHERE organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  ));

-- AI Training Sessions policies
CREATE POLICY "Users can view their organization's training sessions" ON ai_training_sessions
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert training sessions for their organization" ON ai_training_sessions
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their organization's training sessions" ON ai_training_sessions
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- AI Datasets policies
CREATE POLICY "Users can view their organization's datasets" ON ai_datasets
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert datasets for their organization" ON ai_datasets
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their organization's datasets" ON ai_datasets
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE ai_conversations 
    SET message_count = message_count + 1,
        last_message_at = NEW.timestamp
    WHERE id = NEW.conversation_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE ai_conversations 
    SET message_count = message_count - 1
    WHERE id = OLD.conversation_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for message count updates
CREATE TRIGGER trigger_update_conversation_message_count
  AFTER INSERT OR DELETE ON ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_message_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_update_ai_personas_updated_at
  BEFORE UPDATE ON ai_personas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_ai_conversations_updated_at
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_ai_datasets_updated_at
  BEFORE UPDATE ON ai_datasets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 
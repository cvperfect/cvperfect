-- CVPerfect Secure Authentication Migration
-- Creates sessions table for secure Stripe session tracking

-- Create sessions table for tracking paid Stripe sessions
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  plan VARCHAR(50) NOT NULL DEFAULT 'basic',
  stripe_session_id VARCHAR(255),
  cv_data TEXT,
  job_posting TEXT,
  photo_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  status VARCHAR(50) DEFAULT 'pending'
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_email ON sessions(email);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (
    auth.jwt() ->> 'email' = email OR 
    auth.role() = 'service_role'
  );

-- Policy: Service role can insert sessions (from Stripe webhooks)
CREATE POLICY "Service role can insert sessions" ON sessions
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role'
  );

-- Policy: Service role can update sessions
CREATE POLICY "Service role can update sessions" ON sessions
  FOR UPDATE USING (
    auth.role() = 'service_role'
  );

-- Add trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sessions_updated_at 
  BEFORE UPDATE ON sessions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Cleanup old expired sessions (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions 
  WHERE expires_at < NOW() - INTERVAL '7 days';
END;
$$ language 'plpgsql';

-- Add comments for documentation
COMMENT ON TABLE sessions IS 'Stores secure session data for CVPerfect paid users';
COMMENT ON COLUMN sessions.session_id IS 'Unique session identifier from Stripe checkout';
COMMENT ON COLUMN sessions.stripe_session_id IS 'Stripe checkout session ID for verification';
COMMENT ON COLUMN sessions.cv_data IS 'Encrypted CV data for processing';
COMMENT ON COLUMN sessions.photo_data IS 'Base64 encoded profile photo';
COMMENT ON COLUMN sessions.expires_at IS 'Session expiration (24 hours from creation)';

-- Insert sample data for testing (remove in production)
-- INSERT INTO sessions (session_id, email, plan, status) 
-- VALUES ('sess_test_123', 'test@cvperfect.pl', 'premium', 'active');
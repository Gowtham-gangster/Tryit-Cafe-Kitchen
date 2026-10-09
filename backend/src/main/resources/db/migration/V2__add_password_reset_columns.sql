-- V2: Add password reset token and expiration timestamp to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token_expires_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_user_password_reset_token ON users(password_reset_token);

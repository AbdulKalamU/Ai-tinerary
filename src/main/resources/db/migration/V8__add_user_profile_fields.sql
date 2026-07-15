-- Add extended profile fields to users table
ALTER TABLE users ADD COLUMN display_name VARCHAR(100);
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN home_city VARCHAR(100);
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;

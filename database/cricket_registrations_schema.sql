-- Cricket Registration Table Schema
-- This table stores cricket-specific registration details for event registrations

CREATE TABLE cricket_registrations (
    id BIGSERIAL PRIMARY KEY,
    event_registration_id BIGINT NOT NULL UNIQUE REFERENCES event_registrations(id) ON DELETE CASCADE,
    
    -- Basic Information
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    tshirt_size VARCHAR(10) NOT NULL CHECK (tshirt_size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL')),
    residential_address VARCHAR(500) NOT NULL,
    whatsapp_number VARCHAR(20) NOT NULL,
    
    -- Document/Photo Paths (storing file paths/URLs)
    aadhaar_front_photo VARCHAR(500) NOT NULL,
    aadhaar_back_photo VARCHAR(500) NOT NULL,
    player_photo VARCHAR(500) NOT NULL,
    
    -- Cricket Specific Fields
    game_level VARCHAR(20) NOT NULL CHECK (game_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL')),
    cricket_preference VARCHAR(20) NOT NULL CHECK (cricket_preference IN ('BATTING', 'BOWLING', 'ALL_ROUNDER', 'WICKET_KEEPER')),
    is_wicket_keeper BOOLEAN NOT NULL DEFAULT false,
    has_captain_experience BOOLEAN NOT NULL DEFAULT false,
    batting_hand VARCHAR(10) NOT NULL CHECK (batting_hand IN ('LEFT', 'RIGHT', 'BOTH')),
    bowling_arm VARCHAR(10) NOT NULL CHECK (bowling_arm IN ('LEFT', 'RIGHT', 'BOTH')),
    bowling_pace VARCHAR(20) NOT NULL CHECK (bowling_pace IN ('FAST', 'FAST_MEDIUM', 'MEDIUM', 'MEDIUM_SLOW', 'SLOW', 'SPIN', 'LEG_SPIN', 'OFF_SPIN', 'NOT_APPLICABLE')),
    
    -- T-Shirt Details
    tshirt_name VARCHAR(50) NOT NULL,
    lucky_number INTEGER NOT NULL CHECK (lucky_number BETWEEN 1 AND 99),
    
    -- Terms and Conditions
    terms_accepted BOOLEAN NOT NULL DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_cricket_reg_event_registration ON cricket_registrations(event_registration_id);
CREATE INDEX idx_cricket_reg_gender ON cricket_registrations(gender);
CREATE INDEX idx_cricket_reg_game_level ON cricket_registrations(game_level);
CREATE INDEX idx_cricket_reg_preference ON cricket_registrations(cricket_preference);

-- Add comments for documentation
COMMENT ON TABLE cricket_registrations IS 'Stores cricket-specific registration details including player skills, preferences, and photos';
COMMENT ON COLUMN cricket_registrations.aadhaar_front_photo IS 'File path or URL to Aadhaar card front side photo';
COMMENT ON COLUMN cricket_registrations.aadhaar_back_photo IS 'File path or URL to Aadhaar card back side photo';
COMMENT ON COLUMN cricket_registrations.player_photo IS 'File path or URL to player photo';
COMMENT ON COLUMN cricket_registrations.lucky_number IS 'Jersey/T-shirt number between 1-99';


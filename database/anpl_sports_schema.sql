-- ================================================================
-- SPORTS REGISTRATION SYSTEM - DATABASE SCHEMA
-- Organization: ANPL (Aggar Nagar Premier League)
-- Schema: anpl_sports
-- Version: 2.0
-- Date: 2025-11-21
-- ================================================================

-- Drop schema if exists (for fresh install)
DROP SCHEMA IF EXISTS anpl_sports CASCADE;

-- Create schema
CREATE SCHEMA anpl_sports;

-- Set search path for this session
SET search_path TO anpl_sports, public;

-- ================================================================
-- CORE TABLES
-- ================================================================

-- 1. USERS TABLE
-- Contains user identity and static lifetime fields
CREATE TABLE anpl_sports.users (
    id BIGSERIAL PRIMARY KEY,
    
    -- Basic Information
    full_name VARCHAR(255) NOT NULL,
    fathers_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    registration_number VARCHAR(50) NOT NULL,
    
    -- Contact Information (Static)
    phone_number VARCHAR(20) NOT NULL,
    whatsapp_number VARCHAR(20),
    residential_address VARCHAR(500),
    block VARCHAR(50) NOT NULL,
    house_number VARCHAR(50) NOT NULL,
    
    -- Personal Information (Static)
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    emergency_contact VARCHAR(20),
    
    -- Identity Documents (Static - Upload Once, Use Forever)
    aadhaar_number VARCHAR(12) NOT NULL,
    aadhaar_front_photo VARCHAR(500),
    aadhaar_back_photo VARCHAR(500),
    player_photo VARCHAR(500),
    
    -- Preferences (Static)
    preferred_tshirt_size VARCHAR(10),
    
    -- Account Management
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    is_active BOOLEAN DEFAULT true,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique Constraints
    CONSTRAINT uk_users_email UNIQUE(email),
    CONSTRAINT uk_users_registration_number UNIQUE(registration_number),
    CONSTRAINT uk_users_aadhaar_number UNIQUE(aadhaar_number)
);

-- 2. ADMINS TABLE
CREATE TABLE anpl_sports.admins (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique Constraints
    CONSTRAINT uk_admins_email UNIQUE(email)
);

-- 3. EVENTS TABLE
-- Contains event details with event_type for multi-sport support
CREATE TABLE anpl_sports.events (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Event Type: CRICKET, BADMINTON, FOOTBALL, VOLLEYBALL, etc.
    event_type VARCHAR(50) NOT NULL,
    
    price DECIMAL(10,2) NOT NULL,
    year INTEGER NOT NULL,
    active BOOLEAN NOT NULL DEFAULT false,
    
    -- Registration Period
    registration_start_date TIMESTAMP,
    registration_end_date TIMESTAMP,
    
    -- Event Period
    event_start_date TIMESTAMP,
    event_end_date TIMESTAMP,
    
    -- Capacity Management
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    
    -- Additional Info
    venue VARCHAR(255),
    rules_document VARCHAR(500),
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. EVENT REGISTRATIONS TABLE
-- Contains only event-specific data (not user static data)
CREATE TABLE anpl_sports.event_registrations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    
    -- Registration Details
    registration_number VARCHAR(255),
    registration_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    
    -- Event-Specific Customization
    tshirt_name VARCHAR(50),
    jersey_number INTEGER,
    available_all_days BOOLEAN DEFAULT true,
    unavailable_dates TEXT,
    registration_category VARCHAR(20),
    
    -- Team Information (if applicable)
    team_name VARCHAR(100),
    team_role VARCHAR(50),
    
    -- Special Requests
    special_requests TEXT,
    dietary_requirements VARCHAR(255),
    
    -- Terms & Conditions
    terms_accepted BOOLEAN NOT NULL DEFAULT false,
    terms_accepted_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_event_registrations_user FOREIGN KEY (user_id) 
        REFERENCES anpl_sports.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_event_registrations_event FOREIGN KEY (event_id) 
        REFERENCES anpl_sports.events(id) ON DELETE CASCADE,
    
    -- Unique Constraints
    CONSTRAINT uk_event_registrations_user_event UNIQUE(user_id, event_id),
    CONSTRAINT uk_event_registrations_number UNIQUE(registration_number),
    CONSTRAINT uk_event_registrations_event_jersey UNIQUE(event_id, jersey_number)
);

-- 5. PLAYER PROFILES TABLE
-- Sport-specific player profiles (reusable across events of same sport)
CREATE TABLE anpl_sports.player_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    
    -- Sport Type: CRICKET, BADMINTON, FOOTBALL, etc.
    sport_type VARCHAR(50) NOT NULL,
    
    -- General Skill Information
    skill_level VARCHAR(20) NOT NULL,
    years_of_experience INTEGER DEFAULT 0,
    achievements TEXT,
    sports_history TEXT,
    
    -- Profile Status
    is_active BOOLEAN DEFAULT true,
    verified BOOLEAN DEFAULT false,
    verified_by BIGINT,
    verified_at TIMESTAMP,
    verification_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_player_profiles_user FOREIGN KEY (user_id) 
        REFERENCES anpl_sports.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_player_profiles_verified_by FOREIGN KEY (verified_by) 
        REFERENCES anpl_sports.users(id) ON DELETE SET NULL,
    
    -- Unique Constraints
    CONSTRAINT uk_player_profiles_user_sport UNIQUE(user_id, sport_type)
);

-- 6. CRICKET PLAYER SKILLS TABLE
-- Cricket-specific attributes linked to player profile
CREATE TABLE anpl_sports.cricket_player_skills (
    id BIGSERIAL PRIMARY KEY,
    player_profile_id BIGINT NOT NULL,
    
    -- Primary Role
    primary_role VARCHAR(30) NOT NULL,
    
    -- Batting Details
    batting_style VARCHAR(20) NOT NULL,
    batting_position VARCHAR(30),
    
    -- Bowling Details
    bowling_style VARCHAR(20) NOT NULL,
    bowling_type VARCHAR(30),
    bowling_arm VARCHAR(20),
    
    -- Fielding
    is_wicket_keeper BOOLEAN DEFAULT false,
    preferred_fielding_position VARCHAR(50),
    
    -- Leadership
    has_captaincy_experience BOOLEAN DEFAULT false,
    captaincy_details TEXT,
    
    -- Statistics (optional - can be updated)
    matches_played INTEGER DEFAULT 0,
    batting_average DECIMAL(5,2),
    bowling_average DECIMAL(5,2),
    best_score INTEGER,
    best_bowling VARCHAR(10),
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_cricket_skills_profile FOREIGN KEY (player_profile_id) 
        REFERENCES anpl_sports.player_profiles(id) ON DELETE CASCADE,
    
    -- Unique Constraints
    CONSTRAINT uk_cricket_skills_profile UNIQUE(player_profile_id)
);

-- 7. BADMINTON PLAYER SKILLS TABLE
-- Badminton-specific attributes linked to player profile
CREATE TABLE anpl_sports.badminton_player_skills (
    id BIGSERIAL PRIMARY KEY,
    player_profile_id BIGINT NOT NULL,
    
    -- Playing Details
    playing_style VARCHAR(30) NOT NULL,
    preferred_hand VARCHAR(20) NOT NULL,
    
    -- Format Preferences
    singles_player BOOLEAN DEFAULT true,
    doubles_player BOOLEAN DEFAULT true,
    mixed_doubles BOOLEAN DEFAULT true,
    
    -- Court Position (for doubles)
    preferred_position VARCHAR(30),
    
    -- Specialty Shots
    specialty_shots TEXT,
    
    -- Statistics (optional)
    matches_played INTEGER DEFAULT 0,
    win_percentage DECIMAL(5,2),
    best_ranking INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_badminton_skills_profile FOREIGN KEY (player_profile_id) 
        REFERENCES anpl_sports.player_profiles(id) ON DELETE CASCADE,
    
    -- Unique Constraints
    CONSTRAINT uk_badminton_skills_profile UNIQUE(player_profile_id)
);

-- 8. PAYMENTS TABLE
CREATE TABLE anpl_sports.payments (
    id BIGSERIAL PRIMARY KEY,
    registration_id BIGINT NOT NULL,
    
    -- Payment Details
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    
    -- Razorpay Details
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(255),
    
    -- Payment Status
    payment_status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50),
    payment_date TIMESTAMP,
    
    -- Refund Details
    refund_amount DECIMAL(10,2),
    refund_date TIMESTAMP,
    refund_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_payments_registration FOREIGN KEY (registration_id) 
        REFERENCES anpl_sports.event_registrations(id) ON DELETE CASCADE
);

-- 9. PASSWORD RESET TOKENS TABLE
CREATE TABLE anpl_sports.password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    token VARCHAR(100) NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) 
        REFERENCES anpl_sports.users(id) ON DELETE CASCADE,
    
    -- Unique Constraints
    CONSTRAINT uk_password_reset_token UNIQUE(token)
);

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

-- Users Table Indexes
CREATE INDEX idx_users_email ON anpl_sports.users(email);
CREATE INDEX idx_users_registration_number ON anpl_sports.users(registration_number);
CREATE INDEX idx_users_aadhaar ON anpl_sports.users(aadhaar_number);
CREATE INDEX idx_users_block ON anpl_sports.users(block);
CREATE INDEX idx_users_role ON anpl_sports.users(role);
CREATE INDEX idx_users_active ON anpl_sports.users(is_active);

-- Events Table Indexes
CREATE INDEX idx_events_type ON anpl_sports.events(event_type);
CREATE INDEX idx_events_active ON anpl_sports.events(active);
CREATE INDEX idx_events_year ON anpl_sports.events(year);
CREATE INDEX idx_events_type_active ON anpl_sports.events(event_type, active);
CREATE INDEX idx_events_type_year ON anpl_sports.events(event_type, year);

-- Event Registrations Indexes
CREATE INDEX idx_event_reg_user ON anpl_sports.event_registrations(user_id);
CREATE INDEX idx_event_reg_event ON anpl_sports.event_registrations(event_id);
CREATE INDEX idx_event_reg_status ON anpl_sports.event_registrations(registration_status);
CREATE INDEX idx_event_reg_user_event ON anpl_sports.event_registrations(user_id, event_id);
CREATE INDEX idx_event_reg_number ON anpl_sports.event_registrations(registration_number);

-- Player Profiles Indexes
CREATE INDEX idx_player_profile_user ON anpl_sports.player_profiles(user_id);
CREATE INDEX idx_player_profile_sport ON anpl_sports.player_profiles(sport_type);
CREATE INDEX idx_player_profile_user_sport ON anpl_sports.player_profiles(user_id, sport_type);
CREATE INDEX idx_player_profile_skill ON anpl_sports.player_profiles(skill_level);
CREATE INDEX idx_player_profile_verified ON anpl_sports.player_profiles(verified);
CREATE INDEX idx_player_profile_active ON anpl_sports.player_profiles(is_active);

-- Cricket Skills Indexes
CREATE INDEX idx_cricket_skills_profile ON anpl_sports.cricket_player_skills(player_profile_id);
CREATE INDEX idx_cricket_skills_role ON anpl_sports.cricket_player_skills(primary_role);
CREATE INDEX idx_cricket_skills_keeper ON anpl_sports.cricket_player_skills(is_wicket_keeper);

-- Badminton Skills Indexes
CREATE INDEX idx_badminton_skills_profile ON anpl_sports.badminton_player_skills(player_profile_id);
CREATE INDEX idx_badminton_skills_style ON anpl_sports.badminton_player_skills(playing_style);

-- Payment Indexes
CREATE INDEX idx_payment_registration ON anpl_sports.payments(registration_id);
CREATE INDEX idx_payment_order ON anpl_sports.payments(razorpay_order_id);
CREATE INDEX idx_payment_payment ON anpl_sports.payments(razorpay_payment_id);
CREATE INDEX idx_payment_status ON anpl_sports.payments(payment_status);
CREATE INDEX idx_payment_date ON anpl_sports.payments(payment_date);

-- Password Reset Tokens Indexes
CREATE INDEX idx_reset_token ON anpl_sports.password_reset_tokens(token);
CREATE INDEX idx_reset_user ON anpl_sports.password_reset_tokens(user_id);
CREATE INDEX idx_reset_expiry ON anpl_sports.password_reset_tokens(expiry_date);

-- ================================================================
-- VIEWS FOR COMMON QUERIES
-- ================================================================

-- View: Complete User Profile
CREATE OR REPLACE VIEW anpl_sports.v_user_complete_profile AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.email,
    u.phone_number,
    u.whatsapp_number,
    u.gender,
    u.date_of_birth,
    u.residential_address,
    u.block,
    u.house_number,
    u.aadhaar_number,
    u.preferred_tshirt_size,
    u.player_photo,
    u.registration_number,
    u.is_active,
    pp.id as profile_id,
    pp.sport_type,
    pp.skill_level,
    pp.years_of_experience,
    pp.achievements,
    pp.sports_history,
    pp.verified as profile_verified,
    pp.is_active as profile_active
FROM anpl_sports.users u
LEFT JOIN anpl_sports.player_profiles pp ON u.id = pp.user_id
WHERE u.is_active = true;

-- View: Event Registrations with Full Details
CREATE OR REPLACE VIEW anpl_sports.v_event_registrations_detail AS
SELECT 
    er.id as registration_id,
    er.registration_number,
    er.registration_status,
    er.jersey_number,
    er.registration_category,
    er.tshirt_name,
    er.available_all_days,
    er.unavailable_dates,
    er.team_name,
    er.team_role,
    er.created_at as registration_date,
    e.id as event_id,
    e.name as event_name,
    e.event_type,
    e.price,
    e.year,
    e.venue,
    u.id as user_id,
    u.full_name,
    u.email,
    u.phone_number,
    u.whatsapp_number,
    u.gender,
    u.block,
    u.preferred_tshirt_size,
    p.payment_status,
    p.payment_date,
    p.amount as payment_amount
FROM anpl_sports.event_registrations er
JOIN anpl_sports.events e ON er.event_id = e.id
JOIN anpl_sports.users u ON er.user_id = u.id
LEFT JOIN anpl_sports.payments p ON er.id = p.registration_id;

-- View: Cricket Players with Full Profile
CREATE OR REPLACE VIEW anpl_sports.v_cricket_players AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.email,
    u.gender,
    u.date_of_birth,
    u.phone_number,
    u.block,
    pp.skill_level,
    pp.years_of_experience,
    pp.verified,
    cps.primary_role,
    cps.batting_style,
    cps.batting_position,
    cps.bowling_style,
    cps.bowling_type,
    cps.is_wicket_keeper,
    cps.has_captaincy_experience,
    cps.matches_played,
    cps.batting_average,
    cps.bowling_average
FROM anpl_sports.users u
JOIN anpl_sports.player_profiles pp ON u.id = pp.user_id
JOIN anpl_sports.cricket_player_skills cps ON pp.id = cps.player_profile_id
WHERE pp.sport_type = 'CRICKET' 
  AND pp.is_active = true
  AND u.is_active = true;

-- View: Badminton Players with Full Profile
CREATE OR REPLACE VIEW anpl_sports.v_badminton_players AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.email,
    u.gender,
    u.date_of_birth,
    u.phone_number,
    u.block,
    pp.skill_level,
    pp.years_of_experience,
    pp.verified,
    bps.playing_style,
    bps.preferred_hand,
    bps.singles_player,
    bps.doubles_player,
    bps.mixed_doubles,
    bps.preferred_position,
    bps.matches_played,
    bps.win_percentage
FROM anpl_sports.users u
JOIN anpl_sports.player_profiles pp ON u.id = pp.user_id
JOIN anpl_sports.badminton_player_skills bps ON pp.id = bps.player_profile_id
WHERE pp.sport_type = 'BADMINTON' 
  AND pp.is_active = true
  AND u.is_active = true;

-- ================================================================
-- SAMPLE DATA FOR TESTING
-- ================================================================

-- Insert Sample Events
INSERT INTO anpl_sports.events (name, description, event_type, price, year, active, registration_start_date, registration_end_date, event_start_date, event_end_date, max_participants, created_at, updated_at)
VALUES 
    ('Cricket Tournament 2025', 
     'Annual cricket tournament featuring teams from all blocks. Join us for an exciting competition! Test your batting, bowling, and fielding skills in this premier cricket event.',
     'CRICKET', 
     1000.00, 
     2025, 
     true, 
     NOW(), 
     NOW() + INTERVAL '30 days',
     NOW() + INTERVAL '45 days',
     NOW() + INTERVAL '60 days',
     100,
     NOW(), 
     NOW()),
    
    ('Badminton Championship 2025', 
     'Premier badminton championship open to all residents. Singles and doubles categories available. Show your agility and precision in this fast-paced sport!',
     'BADMINTON', 
     800.00, 
     2025, 
     true,
     NOW(), 
     NOW() + INTERVAL '30 days',
     NOW() + INTERVAL '45 days',
     NOW() + INTERVAL '55 days',
     50,
     NOW(), 
     NOW());

-- ================================================================
-- COMMENTS FOR DOCUMENTATION
-- ================================================================

COMMENT ON SCHEMA anpl_sports IS 'ANPL Sports Registration System - All tables for sports event management';

COMMENT ON TABLE anpl_sports.users IS 'Core user table with static lifetime fields that rarely change';
COMMENT ON TABLE anpl_sports.events IS 'Events table with event_type field to support multiple sports';
COMMENT ON TABLE anpl_sports.event_registrations IS 'Event-specific registration data that changes per event';
COMMENT ON TABLE anpl_sports.player_profiles IS 'Sport-specific player profiles, reusable across multiple events of same sport';
COMMENT ON TABLE anpl_sports.cricket_player_skills IS 'Cricket-specific skills and attributes linked to player profile';
COMMENT ON TABLE anpl_sports.badminton_player_skills IS 'Badminton-specific skills and attributes linked to player profile';
COMMENT ON TABLE anpl_sports.payments IS 'Payment transactions linked to event registrations';

COMMENT ON COLUMN anpl_sports.users.gender IS 'Static field - rarely changes throughout lifetime';
COMMENT ON COLUMN anpl_sports.users.aadhaar_front_photo IS 'Upload once, reuse for all events';
COMMENT ON COLUMN anpl_sports.users.aadhaar_back_photo IS 'Upload once, reuse for all events';
COMMENT ON COLUMN anpl_sports.users.player_photo IS 'General player photo, reusable across all sports';
COMMENT ON COLUMN anpl_sports.users.preferred_tshirt_size IS 'Default t-shirt size preference, can be overridden per event';
COMMENT ON COLUMN anpl_sports.events.event_type IS 'Sport type: CRICKET, BADMINTON, FOOTBALL, VOLLEYBALL, etc.';
COMMENT ON COLUMN anpl_sports.event_registrations.jersey_number IS 'Event-specific jersey number, unique per event';
COMMENT ON COLUMN anpl_sports.event_registrations.registration_category IS 'Age category for the registration (JUNIORS, YOUNGSTERS, LEGENDS)';
COMMENT ON COLUMN anpl_sports.event_registrations.tshirt_name IS 'Name to print on t-shirt for this specific event';
COMMENT ON COLUMN anpl_sports.event_registrations.available_all_days IS 'Indicates if player is available for all tournament dates';
COMMENT ON COLUMN anpl_sports.event_registrations.unavailable_dates IS 'Comma separated list of date strings when player is unavailable';
COMMENT ON COLUMN anpl_sports.player_profiles.sport_type IS 'Sport type for this profile: CRICKET, BADMINTON, FOOTBALL, etc.';
COMMENT ON COLUMN anpl_sports.player_profiles.sports_history IS 'Player provided sports journey summary';
COMMENT ON COLUMN anpl_sports.player_profiles.verified IS 'Admin verification of player skill level';

-- ================================================================
-- GRANT PERMISSIONS (Optional - Uncomment if needed)
-- ================================================================

-- Grant usage on schema
-- GRANT USAGE ON SCHEMA anpl_sports TO anpl_app_user;

-- Grant permissions on all tables
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA anpl_sports TO anpl_app_user;

-- Grant permissions on all sequences
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA anpl_sports TO anpl_app_user;

-- Set default privileges for future tables
-- ALTER DEFAULT PRIVILEGES IN SCHEMA anpl_sports GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anpl_app_user;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA anpl_sports GRANT USAGE, SELECT ON SEQUENCES TO anpl_app_user;

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Verify schema objects
SELECT 
    'Tables' as object_type,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'anpl_sports'
UNION ALL
SELECT 
    'Views' as object_type,
    COUNT(*) as count
FROM information_schema.views 
WHERE table_schema = 'anpl_sports'
UNION ALL
SELECT 
    'Indexes' as object_type,
    COUNT(*) as count
FROM pg_indexes 
WHERE schemaname = 'anpl_sports';

-- ================================================================
-- END OF SCHEMA
-- ================================================================

-- Reset search path
RESET search_path;

-- Grant all privileges to postgres user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA anpl_sports TO postgres;

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ANPL Sports Schema Created Successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Schema: anpl_sports';
    RAISE NOTICE 'Tables: 9';
    RAISE NOTICE 'Views: 4';
    RAISE NOTICE 'Indexes: 30+';
    RAISE NOTICE 'Sample Events: 3';
    RAISE NOTICE '========================================';
END $$;


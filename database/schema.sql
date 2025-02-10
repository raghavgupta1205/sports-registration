-- Initial schema setup
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    fathers_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    block VARCHAR(50) NOT NULL,
    house_number VARCHAR(50) NOT NULL,
    tshirt_size VARCHAR(10) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    aadhaar_number VARCHAR(12) NOT NULL
);

-- Admin Table
CREATE TABLE admins (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    year INTEGER NOT NULL,
    active BOOLEAN NOT NULL DEFAULT false,
    registration_start_date TIMESTAMP,
    registration_end_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Event Registrations Table
CREATE TABLE event_registrations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) NOT NULL,
    event_id BIGINT REFERENCES events(id) NOT NULL,
    registration_number VARCHAR(255) UNIQUE,
    registration_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Payments Table
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    registration_id BIGINT REFERENCES event_registrations(id),
    amount DECIMAL(10,2) NOT NULL,
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    payment_status VARCHAR(50) NOT NULL,
    payment_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL
);

-- Password Reset Tokens Table
CREATE TABLE password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    token VARCHAR(100) NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_registration ON users(registration_number);
CREATE INDEX idx_registrations_user ON event_registrations(user_id);
CREATE INDEX idx_events_active ON events(active);
CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);

-- Insert some sample events
INSERT INTO events (name, description, price, year, active, registration_start_date, registration_end_date, created_at, updated_at)
VALUES 
    ('Cricket Tournament 2024', 'Annual cricket tournament featuring teams from all blocks. Join us for an exciting competition!', 500.00, 2024, true, 
     NOW(), NOW() + INTERVAL '30 days', NOW(), NOW()),
    ('Football League 2024', 'Inter-block football championship. Show your skills and represent your block!', 400.00, 2024, true,
     NOW(), NOW() + INTERVAL '30 days', NOW(), NOW()),
    ('Volleyball Tournament 2023', 'Past volleyball tournament.', 300.00, 2023, false,
     NOW() - INTERVAL '1 year', NOW() - INTERVAL '335 days', NOW() - INTERVAL '1 year', NOW() - INTERVAL '1 year'); 
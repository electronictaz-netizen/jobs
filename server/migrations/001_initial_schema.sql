-- PostgreSQL Migration Script
-- Initial Schema for Aircrew Transportation Management System

-- Enable UUID extension if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  phone TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  pickupDate TEXT NOT NULL,
  pickupTime TEXT NOT NULL,
  flightNumber TEXT NOT NULL,
  pickupLocation TEXT NOT NULL,
  dropoffLocation TEXT NOT NULL,
  driverId INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
  numberOfPassengers INTEGER DEFAULT 1,
  driverPickedUpAt TEXT,
  driverDroppedOffAt TEXT,
  status TEXT DEFAULT 'Unassigned' CHECK(status IN ('Assigned', 'Unassigned')),
  isRecurring INTEGER DEFAULT 0,
  recurrenceFrequency TEXT,
  recurrenceCount INTEGER DEFAULT 12,
  flightStatus TEXT,
  flightStatusUpdatedAt TIMESTAMP,
  flightStatusData TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  type TEXT DEFAULT 'other' CHECK(type IN ('airport', 'hotel', 'other'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_driverId ON jobs(driverId);
CREATE INDEX IF NOT EXISTS idx_jobs_pickupDate ON jobs(pickupDate);
CREATE INDEX IF NOT EXISTS idx_jobs_flightNumber ON jobs(flightNumber);
CREATE INDEX IF NOT EXISTS idx_drivers_email ON drivers(email);

-- Insert default admin user (password: admin123)
-- Note: This will be hashed by the application code
-- The password hash should be generated using bcrypt with 10 rounds
-- You can generate it using: bcrypt.hashSync('admin123', 10)
-- For now, we'll insert a placeholder that will be updated by the application
INSERT INTO drivers (id, name, email, password, phone)
VALUES (1, 'Admin User', 'admin@transport.com', '$2a$10$placeholder', '555-0000')
ON CONFLICT (id) DO NOTHING;

-- Insert sample locations
INSERT INTO locations (name, address, type)
VALUES 
  ('Airport Terminal 1', '123 Airport Blvd', 'airport'),
  ('Airport Terminal 2', '456 Airport Blvd', 'airport'),
  ('Downtown Hotel', '789 Main St', 'hotel'),
  ('Crew Quarters', '321 Crew Ave', 'other')
ON CONFLICT DO NOTHING;

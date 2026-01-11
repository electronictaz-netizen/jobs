import { Pool, QueryResult } from 'pg';
import bcrypt from 'bcryptjs';

// Database interfaces (same as database.ts)
export interface Job {
  id?: number;
  pickupDate: string;
  pickupTime: string;
  flightNumber: string;
  pickupLocation: string;
  dropoffLocation: string;
  driverId?: number | null;
  numberOfPassengers: number;
  driverPickedUpAt?: string | null;
  driverDroppedOffAt?: string | null;
  status: 'Assigned' | 'Unassigned';
  isRecurring?: boolean;
  recurrenceFrequency?: 'weekly' | 'daily' | 'monthly';
  recurrenceCount?: number;
  flightStatus?: string;
  flightStatusUpdatedAt?: string;
  flightStatusData?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Driver {
  id?: number;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  createdAt?: string;
}

export interface Location {
  id?: number;
  name: string;
  address: string;
  type: 'airport' | 'hotel' | 'other';
}

let pool: Pool | null = null;

export const getDatabasePool = (): Pool => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });

    console.log('Connected to PostgreSQL database');
  }
  return pool;
};

export const initDatabase = async () => {
  const pool = getDatabasePool();

  try {
    // Run migration script
    const fs = require('fs');
    const path = require('path');
    const migrationPath = path.join(__dirname, '../migrations/001_initial_schema.sql');
    
    if (fs.existsSync(migrationPath)) {
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      await pool.query(migrationSQL);
      console.log('Database schema initialized');
    } else {
      // If migration file doesn't exist, create tables manually
      await createTables(pool);
    }

    // Ensure admin user exists with correct password
    await ensureAdminUser(pool);
    
    // Ensure sample locations exist
    await ensureSampleLocations(pool);
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

async function createTables(pool: Pool) {
  // Create drivers table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS drivers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      phone TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create jobs table
  await pool.query(`
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
    )
  `);

  // Create locations table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS locations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      type TEXT DEFAULT 'other' CHECK(type IN ('airport', 'hotel', 'other'))
    )
  `);

  // Create indexes
  await pool.query('CREATE INDEX IF NOT EXISTS idx_jobs_driverId ON jobs(driverId)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_jobs_pickupDate ON jobs(pickupDate)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_jobs_flightNumber ON jobs(flightNumber)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_drivers_email ON drivers(email)');
}

async function ensureAdminUser(pool: Pool) {
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  
  const result = await pool.query('SELECT id FROM drivers WHERE id = 1');
  
  if (result.rows.length === 0) {
    await pool.query(
      `INSERT INTO drivers (id, name, email, password, phone)
       VALUES (1, 'Admin User', 'admin@transport.com', $1, '555-0000')`,
      [adminPasswordHash]
    );
  } else {
    // Update password if it's still the placeholder
    await pool.query(
      'UPDATE drivers SET password = $1 WHERE id = 1 AND password = $2',
      [adminPasswordHash, '$2a$10$placeholder']
    );
  }
}

async function ensureSampleLocations(pool: Pool) {
  const locations = [
    ['Airport Terminal 1', '123 Airport Blvd', 'airport'],
    ['Airport Terminal 2', '456 Airport Blvd', 'airport'],
    ['Downtown Hotel', '789 Main St', 'hotel'],
    ['Crew Quarters', '321 Crew Ave', 'other']
  ];

  for (const [name, address, type] of locations) {
    await pool.query(
      `INSERT INTO locations (name, address, type)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [name, address, type]
    );
  }
}

export const query = async (sql: string, params: any[] = []): Promise<any[]> => {
  const pool = getDatabasePool();
  const result: QueryResult = await pool.query(sql, params);
  return result.rows;
};

export const run = async (sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> => {
  const pool = getDatabasePool();
  
  // For INSERT statements, modify SQL to include RETURNING id if not already present
  let modifiedSql = sql;
  const isInsert = sql.trim().toUpperCase().startsWith('INSERT');
  if (isInsert && !sql.toUpperCase().includes('RETURNING')) {
    // Add RETURNING id to INSERT statements
    modifiedSql = sql.replace(/;?\s*$/, '') + ' RETURNING id';
  }
  
  const result: QueryResult = await pool.query(modifiedSql, params);
  
  // Get the last inserted ID
  let lastID = 0;
  if (result.command === 'INSERT') {
    if (result.rows.length > 0 && result.rows[0].id) {
      lastID = parseInt(result.rows[0].id);
    } else {
      // Fallback: use LASTVAL() if RETURNING didn't work
      try {
        const idResult = await pool.query('SELECT LASTVAL() as id');
        if (idResult.rows.length > 0 && idResult.rows[0].id) {
          lastID = parseInt(idResult.rows[0].id);
        }
      } catch (e) {
        // LASTVAL() only works if a sequence was used in this session
        console.warn('Could not get last inserted ID:', e);
      }
    }
  }
  
  return {
    lastID,
    changes: result.rowCount || 0
  };
};

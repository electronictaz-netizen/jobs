import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

const dbPath = './transportation.db';

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

let db: sqlite3.Database;

export const getDatabase = (): sqlite3.Database => {
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
      }
    });
  }
  return db;
};

export const initDatabase = () => {
  const database = getDatabase();
  
  // Enable foreign keys
  database.run('PRAGMA foreign_keys = ON');

  // Create jobs table
  database.run(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pickupDate TEXT NOT NULL,
      pickupTime TEXT NOT NULL,
      flightNumber TEXT NOT NULL,
      pickupLocation TEXT NOT NULL,
      dropoffLocation TEXT NOT NULL,
      driverId INTEGER,
      numberOfPassengers INTEGER DEFAULT 1,
      driverPickedUpAt TEXT,
      driverDroppedOffAt TEXT,
      status TEXT DEFAULT 'Unassigned' CHECK(status IN ('Assigned', 'Unassigned')),
      isRecurring INTEGER DEFAULT 0,
      recurrenceFrequency TEXT,
      recurrenceCount INTEGER DEFAULT 12,
      flightStatus TEXT,
      flightStatusUpdatedAt DATETIME,
      flightStatusData TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (driverId) REFERENCES drivers(id)
    )
  `);

  // Migrate existing databases: Add recurring columns if they don't exist
  try {
    database.run('ALTER TABLE jobs ADD COLUMN isRecurring INTEGER DEFAULT 0');
  } catch (e: any) {
    // Column already exists, ignore error
    if (!e.message?.includes('duplicate column')) {
      console.error('Error adding isRecurring column:', e);
    }
  }
  
  try {
    database.run('ALTER TABLE jobs ADD COLUMN recurrenceFrequency TEXT');
  } catch (e: any) {
    if (!e.message?.includes('duplicate column')) {
      console.error('Error adding recurrenceFrequency column:', e);
    }
  }
  
  try {
    database.run('ALTER TABLE jobs ADD COLUMN recurrenceCount INTEGER DEFAULT 12');
  } catch (e: any) {
    if (!e.message?.includes('duplicate column')) {
      console.error('Error adding recurrenceCount column:', e);
    }
  }
  
  try {
    database.run('ALTER TABLE jobs ADD COLUMN flightStatus TEXT');
  } catch (e: any) {
    if (!e.message?.includes('duplicate column')) {
      console.error('Error adding flightStatus column:', e);
    }
  }
  
  try {
    database.run('ALTER TABLE jobs ADD COLUMN flightStatusUpdatedAt DATETIME');
  } catch (e: any) {
    if (!e.message?.includes('duplicate column')) {
      console.error('Error adding flightStatusUpdatedAt column:', e);
    }
  }
  
  try {
    database.run('ALTER TABLE jobs ADD COLUMN flightStatusData TEXT');
  } catch (e: any) {
    if (!e.message?.includes('duplicate column')) {
      console.error('Error adding flightStatusData column:', e);
    }
  }

  // Create drivers table
  database.run(`
    CREATE TABLE IF NOT EXISTS drivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      phone TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create locations table (for common locations)
  database.run(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      type TEXT DEFAULT 'other' CHECK(type IN ('airport', 'hotel', 'other'))
    )
  `);

  // Insert default admin user (password: admin123)
  // Use bcrypt.hashSync for synchronous hashing during initialization
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  database.run(`
    INSERT OR IGNORE INTO drivers (id, name, email, password, phone)
    VALUES (1, 'Admin User', 'admin@transport.com', ?, '555-0000')
  `, [adminPasswordHash]);

  // Insert sample locations
  database.run(`
    INSERT OR IGNORE INTO locations (name, address, type)
    VALUES 
      ('Airport Terminal 1', '123 Airport Blvd', 'airport'),
      ('Airport Terminal 2', '456 Airport Blvd', 'airport'),
      ('Downtown Hotel', '789 Main St', 'hotel'),
      ('Crew Quarters', '321 Crew Ave', 'other')
  `);

  console.log('Database initialized');
};

export const query = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const run = (sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> => {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};
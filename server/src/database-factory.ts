// Database factory - exports the appropriate database module based on environment
import * as sqliteDb from './database';
import * as pgDb from './database-pg';

const usePostgreSQL = !!process.env.DATABASE_URL;

if (usePostgreSQL) {
  // Export PostgreSQL functions
  export const query = pgDb.query;
  export const run = pgDb.run;
  export const initDatabase = pgDb.initDatabase;
  export type { Job, Driver, Location } from './database-pg';
} else {
  // Export SQLite functions
  export const query = sqliteDb.query;
  export const run = sqliteDb.run;
  export const initDatabase = sqliteDb.initDatabase;
  export type { Job, Driver, Location } from './database';
}

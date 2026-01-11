import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { initDatabase } from './database-factory';
import jobRoutes from './routes/jobs';
import driverRoutes from './routes/drivers';
import authRoutes from './routes/auth';
import flightRoutes from './routes/flights';
import locationRoutes from './routes/locations';
import { updateFlightStatuses } from './services/flightStatusUpdater';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  process.env.AMPLIFY_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      // In production, you might want to be more restrictive
      if (process.env.NODE_ENV === 'production') {
        // Allow any Amplify domain
        if (origin.includes('.amplifyapp.com')) {
          return callback(null, true);
        }
      }
      callback(null, true); // For now, allow all origins - tighten in production
    }
  },
  credentials: true
}));
app.use(express.json());

// Initialize database
if (process.env.DATABASE_URL) {
  // PostgreSQL - async initialization
  initDatabase().catch((err: Error) => {
    console.error('Failed to initialize PostgreSQL database:', err);
    process.exit(1);
  });
} else {
  // SQLite - sync initialization
  initDatabase();
}

// Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/locations', locationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Schedule flight status updates every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  console.log('Running scheduled flight status update...');
  await updateFlightStatuses();
});

// Run initial update on startup (after a short delay to let the server start)
setTimeout(() => {
  console.log('Running initial flight status update...');
  updateFlightStatuses();
}, 10000); // 10 seconds delay

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Flight status updates scheduled to run every 30 minutes');
});
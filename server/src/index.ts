import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { initDatabase } from './database';
import jobRoutes from './routes/jobs';
import driverRoutes from './routes/drivers';
import authRoutes from './routes/auth';
import flightRoutes from './routes/flights';
import locationRoutes from './routes/locations';
import { updateFlightStatuses } from './services/flightStatusUpdater';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize database
initDatabase();

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
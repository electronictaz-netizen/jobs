import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './database';
import jobRoutes from './routes/jobs';
import driverRoutes from './routes/drivers';
import authRoutes from './routes/auth';
import flightRoutes from './routes/flights';
import locationRoutes from './routes/locations';

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
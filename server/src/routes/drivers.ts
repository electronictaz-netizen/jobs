import express from 'express';
import { query } from '../database';

const router = express.Router();

// Get all drivers
router.get('/', async (req, res) => {
  try {
    const drivers = await query(
      'SELECT id, name, email, phone, createdAt FROM drivers ORDER BY name'
    );
    res.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get driver's assigned jobs
router.get('/:id/jobs', async (req, res) => {
  try {
    const { id } = req.params;
    const jobs = await query(
      `SELECT j.*, d.name as driverName 
       FROM jobs j 
       LEFT JOIN drivers d ON j.driverId = d.id 
       WHERE j.driverId = ? 
       ORDER BY j.pickupDate, j.pickupTime`,
      [id]
    );
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching driver jobs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
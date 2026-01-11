import express from 'express';
import bcrypt from 'bcryptjs';
import { query, run } from '../database-factory';

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

// Create a new driver
router.post('/', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await run(
      'INSERT INTO drivers (name, email, password, phone) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null]
    );

    const newDriver = await query(
      'SELECT id, name, email, phone, createdAt FROM drivers WHERE id = ?',
      [result.lastID]
    );

    res.status(201).json(newDriver[0]);
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Error creating driver:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a driver
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check if driver exists
    const existing = await query('SELECT id FROM drivers WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Build update query dynamically based on what's provided
    const updates: string[] = [];
    const params: any[] = [];

    updates.push('name = ?');
    params.push(name);
    
    updates.push('email = ?');
    params.push(email);

    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone || null);
    }

    // Only update password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      params.push(hashedPassword);
    }

    params.push(id);

    await run(
      `UPDATE drivers SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const updatedDriver = await query(
      'SELECT id, name, email, phone, createdAt FROM drivers WHERE id = ?',
      [id]
    );

    res.json(updatedDriver[0]);
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Error updating driver:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a driver
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if driver has assigned jobs
    const jobs = await query('SELECT id FROM jobs WHERE driverId = ?', [id]);
    if (jobs.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete driver with assigned jobs. Please reassign jobs first.' 
      });
    }

    const result = await run('DELETE FROM drivers WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Error deleting driver:', error);
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
    // Convert isRecurring from integer to boolean
    const convertedJobs = jobs.map((job: any) => ({
      ...job,
      isRecurring: job.isRecurring === 1 || job.isRecurring === true
    }));
    res.json(convertedJobs);
  } catch (error) {
    console.error('Error fetching driver jobs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
import express from 'express';
import { query, run } from '../database';

const router = express.Router();

// Get all locations
router.get('/', async (req, res) => {
  try {
    const locations = await query('SELECT * FROM locations ORDER BY name');
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new location
router.post('/', async (req, res) => {
  try {
    const { name, address, type } = req.body;

    if (!name || !address) {
      return res.status(400).json({ error: 'Name and address are required' });
    }

    const result = await run(
      'INSERT INTO locations (name, address, type) VALUES (?, ?, ?)',
      [name, address, type || 'other']
    );

    const newLocation = await query('SELECT * FROM locations WHERE id = ?', [result.lastID]);
    res.status(201).json(newLocation[0]);
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
import express from 'express';
import { query, run, Job } from '../database-factory';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Helper function to convert job from database format to API format
const convertJob = (job: any) => {
  if (!job) return job;
  return {
    ...job,
    isRecurring: job.isRecurring === 1 || job.isRecurring === true
  };
};

// Get all jobs (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { status, driverId, date } = req.query;
    let sql = 'SELECT j.*, d.name as driverName FROM jobs j LEFT JOIN drivers d ON j.driverId = d.id WHERE 1=1';
    const params: any[] = [];

    if (status) {
      sql += ' AND j.status = ?';
      params.push(status);
    }

    if (driverId) {
      sql += ' AND j.driverId = ?';
      params.push(parseInt(driverId as string));
    }

    if (date) {
      sql += ' AND j.pickupDate = ?';
      params.push(date);
    }

    sql += ' ORDER BY j.pickupDate, j.pickupTime';

    const jobs = await query(sql, params);
    res.json(jobs.map(convertJob));
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single job by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const jobs = await query(
      'SELECT j.*, d.name as driverName FROM jobs j LEFT JOIN drivers d ON j.driverId = d.id WHERE j.id = ?',
      [id]
    );

    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(convertJob(jobs[0]));
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to add days/weeks/months to a date
const addToDate = (dateStr: string, frequency: string, count: number): string => {
  const date = new Date(dateStr + 'T00:00:00');
  
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + count);
      break;
    case 'weekly':
      date.setDate(date.getDate() + (count * 7));
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + count);
      break;
    default:
      date.setDate(date.getDate() + (count * 7)); // Default to weekly
  }
  
  return date.toISOString().split('T')[0];
};

// Create a new job
router.post('/', async (req, res) => {
  try {
    const {
      pickupDate,
      pickupTime,
      flightNumber,
      pickupLocation,
      dropoffLocation,
      driverId,
      numberOfPassengers,
      isRecurring,
      recurrenceFrequency,
      recurrenceCount
    } = req.body;

    if (!pickupDate || !pickupTime || !flightNumber || !pickupLocation || !dropoffLocation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const status = driverId ? 'Assigned' : 'Unassigned';
    const recurring = isRecurring ? 1 : 0;
    const frequency = recurrenceFrequency || null;
    const count = recurrenceCount || 12;

    // Create the first job
    const result = await run(
      `INSERT INTO jobs (pickupDate, pickupTime, flightNumber, pickupLocation, dropoffLocation, 
        driverId, numberOfPassengers, status, isRecurring, recurrenceFrequency, recurrenceCount, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        pickupDate,
        pickupTime,
        flightNumber,
        pickupLocation,
        dropoffLocation,
        driverId || null,
        numberOfPassengers || 1,
        status,
        recurring,
        frequency,
        count
      ]
    );

    const createdJobIds = [result.lastID];

    // If recurring, create future instances
    if (isRecurring && recurrenceFrequency) {
      for (let i = 1; i <= count; i++) {
        const nextDate = addToDate(pickupDate, recurrenceFrequency, i);
        const futureResult = await run(
          `INSERT INTO jobs (pickupDate, pickupTime, flightNumber, pickupLocation, dropoffLocation, 
            driverId, numberOfPassengers, status, isRecurring, recurrenceFrequency, recurrenceCount, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [
            nextDate,
            pickupTime,
            flightNumber,
            pickupLocation,
            dropoffLocation,
            driverId || null,
            numberOfPassengers || 1,
            'Unassigned', // Future jobs start as unassigned
            recurring,
            frequency,
            count
          ]
        );
        createdJobIds.push(futureResult.lastID);
      }
    }

    const newJob = await query(
      'SELECT j.*, d.name as driverName FROM jobs j LEFT JOIN drivers d ON j.driverId = d.id WHERE j.id = ?',
      [result.lastID]
    );

    res.status(201).json({
      ...convertJob(newJob[0]),
      createdInstances: createdJobIds.length
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a job
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      pickupDate,
      pickupTime,
      flightNumber,
      pickupLocation,
      dropoffLocation,
      driverId,
      numberOfPassengers,
      status
    } = req.body;

    // Check if job exists
    const existing = await query('SELECT * FROM jobs WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const finalStatus = status || (driverId ? 'Assigned' : 'Unassigned');

    await run(
      `UPDATE jobs SET 
        pickupDate = COALESCE(?, pickupDate),
        pickupTime = COALESCE(?, pickupTime),
        flightNumber = COALESCE(?, flightNumber),
        pickupLocation = COALESCE(?, pickupLocation),
        dropoffLocation = COALESCE(?, dropoffLocation),
        driverId = ?,
        numberOfPassengers = COALESCE(?, numberOfPassengers),
        status = ?,
        updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        pickupDate,
        pickupTime,
        flightNumber,
        pickupLocation,
        dropoffLocation,
        driverId !== undefined ? driverId : existing[0].driverId,
        numberOfPassengers,
        finalStatus,
        id
      ]
    );

    const updatedJob = await query(
      'SELECT j.*, d.name as driverName FROM jobs j LEFT JOIN drivers d ON j.driverId = d.id WHERE j.id = ?',
      [id]
    );

    res.json(convertJob(updatedJob[0]));
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a job
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await run('DELETE FROM jobs WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Driver-specific: Mark pickup time
router.post('/:id/pickup', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Verify job is assigned to this driver
    const jobs = await query('SELECT * FROM jobs WHERE id = ? AND driverId = ?', [id, userId]);
    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found or not assigned to you' });
    }

    const pickupTime = new Date().toISOString();

    await run(
      'UPDATE jobs SET driverPickedUpAt = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [pickupTime, id]
    );

    const updatedJob = await query(
      'SELECT j.*, d.name as driverName FROM jobs j LEFT JOIN drivers d ON j.driverId = d.id WHERE j.id = ?',
      [id]
    );

    res.json(convertJob(updatedJob[0]));
  } catch (error) {
    console.error('Error marking pickup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Driver-specific: Mark dropoff time
router.post('/:id/dropoff', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Verify job is assigned to this driver
    const jobs = await query('SELECT * FROM jobs WHERE id = ? AND driverId = ?', [id, userId]);
    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found or not assigned to you' });
    }

    const dropoffTime = new Date().toISOString();

    await run(
      'UPDATE jobs SET driverDroppedOffAt = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [dropoffTime, id]
    );

    const updatedJob = await query(
      'SELECT j.*, d.name as driverName FROM jobs j LEFT JOIN drivers d ON j.driverId = d.id WHERE j.id = ?',
      [id]
    );

    res.json(convertJob(updatedJob[0]));
  } catch (error) {
    console.error('Error marking dropoff:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
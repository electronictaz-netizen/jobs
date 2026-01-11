import express from 'express';
import axios from 'axios';
import { query } from '../database';

const router = express.Router();

// Get flight status - returns cached status from database (updated every 30 minutes by scheduler)
router.get('/status/:flightNumber', async (req, res) => {
  try {
    const { flightNumber } = req.params;

    // Parse flight number (e.g., "AA123" -> "AA" and "123")
    const airlineMatch = flightNumber.match(/^([A-Z]+)(\d+)$/);
    if (!airlineMatch) {
      return res.status(400).json({ error: 'Invalid flight number format' });
    }

    // Try to get stored flight status from database
    const jobs = await query(
      'SELECT flightStatus, flightStatusData, flightStatusUpdatedAt FROM jobs WHERE flightNumber = ? AND flightStatusData IS NOT NULL ORDER BY flightStatusUpdatedAt DESC LIMIT 1',
      [flightNumber]
    );

    if (jobs.length > 0 && jobs[0].flightStatusData) {
      try {
        const statusData = JSON.parse(jobs[0].flightStatusData);
        res.json({
          ...statusData,
          cached: true,
          lastUpdated: jobs[0].flightStatusUpdatedAt
        });
        return;
      } catch (parseError) {
        console.error('Error parsing stored flight status data:', parseError);
      }
    }

    // If no cached data, try to fetch from API as fallback
    const apiKey = process.env.AVIATIONSTACK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'AviationStack API key not configured',
        message: 'Please set AVIATIONSTACK_API_KEY in your environment variables'
      });
    }

    try {
      const response = await axios.get('http://api.aviationstack.com/v1/flights', {
        params: {
          access_key: apiKey,
          flight_iata: flightNumber,
          limit: 1
        }
      });

      if (response.data.data && response.data.data.length > 0) {
        const flight = response.data.data[0];
        const flightData = {
          flightNumber,
          status: flight.flight_status || 'Unknown',
          departure: {
            airport: flight.departure?.airport || 'Unknown',
            scheduled: flight.departure?.scheduled || null,
            actual: flight.departure?.actual || null,
            delay: flight.departure?.delay || null
          },
          arrival: {
            airport: flight.arrival?.airport || 'Unknown',
            scheduled: flight.arrival?.scheduled || null,
            actual: flight.arrival?.actual || null,
            delay: flight.arrival?.delay || null
          },
          airline: flight.airline?.name || 'Unknown'
        };
        res.json({
          ...flightData,
          cached: false
        });
      } else {
        res.json({
          flightNumber,
          status: 'Not found',
          message: 'Flight information not available',
          cached: false
        });
      }
    } catch (apiError: any) {
      console.error('AviationStack API error:', apiError.response?.data || apiError.message);
      res.status(500).json({
        error: 'Failed to fetch flight status',
        message: apiError.response?.data?.error?.info || 'API request failed'
      });
    }
  } catch (error) {
    console.error('Error fetching flight status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;